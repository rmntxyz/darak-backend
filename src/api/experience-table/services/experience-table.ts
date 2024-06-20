/**
 * experience-table service
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreService(
  "api::experience-table.experience-table",
  ({ strapi }) => ({
    async getExperienceTable(forType: string) {
      return await strapi.entityService.findMany(
        "api::experience-table.experience-table",
        {
          filters: { for: forType },
          populate: {
            exp_table: {
              populate: {
                rewards: true,
              },
            },
          },
        }
      );
    },
  })
);
