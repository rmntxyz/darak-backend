/**
 * freebie service
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreService(
  "api::freebie.freebie",
  ({ strapi }) => ({
    async refresh(freebieId: number) {
      const freebie = await strapi
        .service("api::freebie.freebie")
        .findOne(freebieId);
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

          return await strapi
            .service("api::freebie.freebie")
            .update(freebieId, { data: { current, last_charged_at } });
        }
      }

      return freebie;
    },
  })
);
