/**
 * freebie service
 */

import { factories } from "@strapi/strapi";
import { ErrorCode } from "../../../constant";

export default factories.createCoreService(
  "api::freebie.freebie",
  ({ strapi }) => ({
    async refresh(freebie: Freebie) {
      let { id, current, max, last_charged_at, charge_interval } = freebie;

      if (current < max) {
        // 현재 시간
        const now = (Date.now() / 1000) | 0;
        // 충전 가능한 갯수
        const limit_charges = max - current;

        const diff_time = now - last_charged_at;
        const charges = Math.min(
          Math.floor(diff_time / charge_interval),
          limit_charges
        );

        if (charges > 0) {
          current += charges;
          last_charged_at += charges * charge_interval;

          return await strapi
            .service("api::freebie.freebie")
            .update(id, { data: { current, last_charged_at } });
        }
      }

      return freebie;
    },

    recalculate(freebie: Freebie) {
      let { current, max, last_charged_at, charge_interval } = freebie;

      if (current < max) {
        // 현재 시간
        const now = (Date.now() / 1000) | 0;
        // 충전 가능한 갯수
        const limit_charges = max - current;

        const diff_time = now - last_charged_at;
        const charges = Math.min(
          Math.floor(diff_time / charge_interval),
          limit_charges
        );

        if (charges > 0) {
          current += charges;
          last_charged_at += charges * charge_interval;

          freebie = { ...freebie, current, last_charged_at };
        }
      }

      return freebie;
    },

    async updateFreebie(userId: number, change: number) {
      return await strapi.db.transaction(async ({ trx }) => {
        let [freebie] = await strapi.db
          .connection("freebies")
          .transacting(trx)
          .forUpdate()
          .join(
            "freebie_user_links",
            "freebie.id",
            "freebie_user_links.freebie_id"
          )
          .where("freebie_user_links.user_id", userId)
          .select("freebie.*");

        // refresh freebie
        freebie = this.recalculate(freebie);

        const { current, max } = freebie;

        if (current + change < 0) {
          throw ErrorCode.NOT_ENOUGH_FREEBIES;
        }

        const after = current + change;

        const data: FreebieData = { current: after };

        if (current >= max && after < max) {
          data.last_charged_at = Math.floor(new Date().getTime() / 1000);
        }

        return await strapi
          .service("api::freebie.freebie")
          .update(freebie.id, { data });
      });
    },
  })
);
