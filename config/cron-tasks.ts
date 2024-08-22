import { RESET_HOUR, ACCOUNT_DELETION_GRACE_PERIOD } from "../src/constant";
import Hashids from "hashids";

export default {
  resetMonthlyCriteria: {
    task: async ({ strapi }) => {
      await strapi
        .service("api::leaderboard.leaderboard")
        .updateMonthlyRoomCompletionCriteria();
    },
    options: {
      rule: `0 0 ${RESET_HOUR} 1 * *`,
      tz: "Asia/Seoul",
    },
  },
  blockInactiveUsers: {
    task: async ({ strapi }) => {
      const inactiveUsers = await strapi.entityService.findMany(
        "plugin::users-permissions.user",
        {
          filters: {
            deactivated: true,
            blocked: false,
            deactivated_at: {
              $lt: new Date(
                Date.now() - ACCOUNT_DELETION_GRACE_PERIOD * 24 * 60 * 60 * 1000
              ),
            },
          },
          fields: ["email", "deactivated_at"],
        }
      );

      if (inactiveUsers.length === 0) {
        return 200;
      }

      const hashids = new Hashids("", 3, process.env.NONCE_FOR_ENCRYPTION);

      const promises = inactiveUsers.map((user) => {
        const [identifier, domain] = user.email.split("@");
        const codeFromEmail = identifier.split("").map((c) => c.charCodeAt());
        const encodedEmail = hashids.encode(codeFromEmail) + "@ROOMIX.INACTIVE";

        // const encoded = hashids.encode(codeFromEmail);
        // const decodedCodes = hashids.decode(encoded) as number[];
        // const decoded = String.fromCharCode(...decodedCodes);
        // console.log("decode", decoded);

        return strapi.entityService.update(
          "plugin::users-permissions.user",
          user.id,
          {
            data: {
              blocked: true,
              username: "ROOMIX.INACTIVE",
              email: encodedEmail,
              device_token: "",
            },
          }
        );
      });

      return await Promise.all(promises);
    },
    options: {
      rule: `0 0 0 * * *`,
      tz: "Asia/Seoul",
    },
  },
};
