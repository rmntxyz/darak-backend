/**
 * status service
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreService(
  "api::status.status",
  ({ strapi }) => ({
    async getStatus(userId: number, withLevelUpRewards = false) {
      let status = (
        await strapi.entityService.findMany("api::status.status", {
          filters: { user: userId },
          populate: {
            level_up_reward_claim_history: {
              sort: "level:asc",
            },
          },
        })
      )[0];

      if (!status) {
        status = await strapi.entityService.create("api::status.status", {
          data: {
            user: userId,
            level: 1,
            exp: 0,
            level_up_reward_claimed: true,
            publishedAt: new Date(),
          },
          populate: {
            level_up_reward_claim_history: {
              sort: "level:asc",
            },
          },
        });
      }

      const expTable = await strapi.entityService.findMany(
        "api::experience-table.experience-table",
        {
          filters: { for: "user_level" },
          populate: {
            exp_table: {
              populate: {
                rewards: true,
              },
            },
          },
        }
      );

      return {
        status,
        expTable,
      };
    },

    async claimLevelUpReward(userId: number) {
      return await strapi.db.transaction(async (trx) => {
        return null;
      });
    },
  })
);
