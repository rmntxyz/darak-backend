/**
 * freebie service
 */

import { factories } from "@strapi/strapi";
import { ErrorCode } from "../../../constant";

export default factories.createCoreService(
  "api::freebie.freebie",
  ({ strapi }) => ({
    async getFreebie(userId: number) {
      let freebie = (
        await strapi.entityService.findMany("api::freebie.freebie", {
          filters: {
            user: { id: userId },
          },
        })
      )[0];

      if (freebie) {
        freebie = this.recalculate(freebie);
      } else {
        freebie = await strapi.entityService.create("api::freebie.freebie", {
          data: {
            current: 30,
            max: 30,
            last_charged_at: (new Date().getTime() / 1000) | 0,
            charge_interval: 3600,
            charge_amount: 3,
            user: { id: userId },
            publishedAt: new Date(),
          },
        });
      }

      return freebie;
    },
    async refresh(freebie: Freebie) {
      let {
        id,
        current,
        max,
        last_charged_at,
        charge_interval,
        charge_amount,
      } = freebie;

      if (current < max) {
        // 현재 시간
        const now = (Date.now() / 1000) | 0;
        // 충전 가능한 갯수
        const limit_charges = max - current;

        const diff_time = now - last_charged_at;
        const multiple = Math.floor(diff_time / charge_interval);
        const charges = Math.min(multiple * charge_amount, limit_charges);

        if (multiple > 0) {
          current += charges;
          last_charged_at += multiple * charge_interval;

          return await strapi
            .service("api::freebie.freebie")
            .update(id, { data: { current, last_charged_at } });
        }
      }

      return freebie;
    },

    recalculate(freebie: Freebie) {
      let { current, max, last_charged_at, charge_interval, charge_amount } =
        freebie;

      if (current < max) {
        // 현재 시간
        const now = (Date.now() / 1000) | 0;
        // 충전 가능한 갯수
        const limit_charges = max - current;

        const diff_time = now - last_charged_at;
        const multiple = Math.floor(diff_time / charge_interval);
        const charges = Math.min(multiple * charge_amount, limit_charges);

        if (multiple > 0) {
          current += charges;
          last_charged_at += multiple * charge_interval;

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
            "freebies_users_permissions_user_links",
            "freebies.id",
            "freebies_users_permissions_user_links.freebie_id"
          )
          .where("freebies_users_permissions_user_links.user_id", userId)
          .select("freebies.*");

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
