/**
 * shield service
 */

import { factories } from "@strapi/strapi";
import { ErrorCode } from "../../../constant";

export default factories.createCoreService(
  "api::shield.shield",
  ({ strapi }) => ({
    async getShield(userId: number) {
      let { shield } = await strapi.entityService.findOne(
        "plugin::users-permissions.user",
        userId,
        {
          populate: {
            shield: {
              fields: ["amount, max"],
            },
          },
        }
      );

      if (!shield) {
        shield = await strapi.entityService.create("api::shield.shield", {
          data: {
            amount: 1,
            max: 3,
            user: { id: userId },
            publishedAt: new Date(),
          },
          fields: ["amount", "max"],
        });
      }

      return shield;
    },

    async calcConvertedCoinAmount(userId: number, amount: number) {
      const { amount: current, max } = await this.getShield(userId);

      const exceeded = current + amount - max;

      if (exceeded > 0) {
        return exceeded;
      }

      return 0;
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

        if (shield.amount + change > shield.max) {
          change = shield.max - shield.amount;
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
