/**
 * wheel-spin service
 */

import { factories } from "@strapi/strapi";
import { ErrorCode } from "../../../constant";

export default factories.createCoreService(
  "api::wheel-spin.wheel-spin",
  ({ strapi }) => ({
    async getWheelSpin(userId: number) {
      let wheelSpin = (
        await strapi.entityService.findMany("api::wheel-spin.wheel-spin", {
          filters: {
            user: { id: userId },
          },
          fields: ["amount"],
        })
      )[0];

      if (!wheelSpin) {
        wheelSpin = await strapi.entityService.create(
          "api::wheel-spin.wheel-spin",
          {
            data: {
              amount: 0,
              user: { id: userId },
              publishedAt: new Date(),
            },
            fields: ["amount"],
          }
        );
      }

      return wheelSpin;
    },

    async updateWheelSpin(
      userId: number,
      change: number,
      detail: WheelSpinChangeDetail
    ) {
      return await strapi.db.transaction(async ({ trx }) => {
        const [wheelSpin] = await strapi.db
          .connection("wheel_spins")
          .transacting(trx)
          .forUpdate()
          .join(
            "wheel_spins_user_links",
            "wheel_spins.id",
            "wheel_spins_user_links.wheel_spin_id"
          )
          .where("wheel_spins_user_links.user_id", userId)
          .select("wheel_spins.*");

        if (wheelSpin.amount + change < 0) {
          throw ErrorCode.NOT_ENOUGH_WHEEL_SPINS;
        }

        const updated = await strapi.entityService.update(
          "api::wheel-spin.wheel-spin",
          wheelSpin.id,
          {
            data: {
              amount: wheelSpin.amount + change,
            },
            fields: ["amount"],
          }
        );

        await strapi.entityService.create(
          "api::wheel-spin-history.wheel-spin-history",
          {
            data: {
              change,
              detail,
              result: updated.amount,
              date: new Date(),
              wheel_spin: { id: updated.id },
              publishedAt: new Date(),
            },
          }
        );

        return updated;
      });
    },
  })
);
