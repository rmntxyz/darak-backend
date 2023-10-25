/**
 * star-point service
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreService(
  "api::star-point.star-point",
  ({ strapi }) => ({
    async getStarPoint(userId: number) {
      let starPoint = (
        await strapi.entityService.findMany("api::star-point.star-point", {
          filters: {
            user: { id: userId },
          },
          fields: ["amount"],
        })
      )[0];

      if (!starPoint) {
        starPoint = await strapi.entityService.create(
          "api::star-point.star-point",
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

      return starPoint;
    },
  })
);
