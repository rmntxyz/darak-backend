/**
 * experience-table service
 */

import { factories } from "@strapi/strapi";

const CACHED_EXP_TABLE = {};

export default factories.createCoreService(
  "api::experience-table.experience-table",
  ({ strapi }) => ({
    async getExperienceTable(type: string) {
      if (!CACHED_EXP_TABLE[type]) {
        CACHED_EXP_TABLE[type] = (
          await strapi.entityService.findMany(
            "api::experience-table.experience-table",
            {
              filters: { for: type },
              populate: {
                exp_table: {
                  populate: {
                    rewards: true,
                  },
                  sort: "level:asc",
                },
              },
            }
          )
        )[0];
      }

      return CACHED_EXP_TABLE[type];
    },

    async refreshCache(type: string) {
      CACHED_EXP_TABLE[type] = (
        await strapi.entityService.findMany(
          "api::experience-table.experience-table",
          {
            filters: { for: type },
            populate: {
              exp_table: {
                populate: {
                  rewards: true,
                },
                sort: "level:asc",
              },
            },
          }
        )
      )[0];

      return CACHED_EXP_TABLE[type];
    },
  })
);
