/**
 * shield service
 */

import { factories } from "@strapi/strapi";
import { ErrorCode } from "../../../constant";

export default factories.createCoreService(
  "api::shield.shield",
  ({ strapi }) => ({
    getShield: async (userId: number) => {
      let { shield } = await strapi.entityService.findOne(
        "plugin::users-permissions.user",
        userId,
        {
          populate: {
            shield: {
              fields: ["amount"],
            },
          },
        }
      );

      if (!shield) {
        shield = await strapi.entityService.create("api::shield.shield", {
          data: {
            amount: 0,
            max: 5,
            user: { id: userId },
            publishedAt: new Date(),
          },
          fields: ["amount", "max"],
        });
      }

      return shield;
    },

    updateShield: async (
      userId: number,
      change: number,
      detail: ShieldChangeDetail
    ) => {
      return await strapi.db.transaction(async ({ trx }) => {
        const [shield] = await strapi.db
          .connection("shields")
          .transacting(trx)
          .forUpdate()
          .join(
            "shields_user_links",
            "shields.id",
            "shields_user_links.shield_id"
          )
          .where("shields_user_links.user_id", userId)
          .select("shields.*");

        if (shield.amount + change < 0) {
          throw ErrorCode.NOT_ENOUGH_SHIELDS;
        }

        const updated = await strapi.entityService.update(
          "api::shield.shield",
          shield.id,
          {
            data: { amount: shield.amount + change },
            fields: ["amount"],
          }
        );

        await strapi.entityService.create(
          "api::shield-history.shield-history",
          {
            data: {
              change,
              detail,
              result: updated.amount,
              date: new Date(),
              shield: { id: updated.id },
              publishedAt: new Date(),
            },
          }
        );

        return updated;
      });
    },
  })
);
