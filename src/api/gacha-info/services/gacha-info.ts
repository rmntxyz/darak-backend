/**
 * gacha-info service
 */

import { factories } from "@strapi/strapi";

let CACHED_GACHA_INFO: GachaInfo = null;
const GACHA_INFO_ID = 1;

export default factories.createCoreService(
  "api::gacha-info.gacha-info",
  ({ strapi }) => ({
    async getGachaInfo() {
      if (CACHED_GACHA_INFO) {
        return CACHED_GACHA_INFO;
      }

      const info = await strapi.entityService.findOne(
        "api::gacha-info.gacha-info",
        GACHA_INFO_ID,
        {
          fields: ["probability"],
          populate: {
            reward_table: {
              populate: {
                rewards: {
                  fields: ["type", "amount", "tier"],
                },
              },
            },
          },
        }
      );

      CACHED_GACHA_INFO = info;

      return info;
    },
  })
);
