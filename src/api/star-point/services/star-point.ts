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

    async updateStarPoint(
      starPoint: StarPoint,
      change: number,
      detail: StarPointChangeDetail,
      userItems: number[] = []
    ) {
      const updated = await strapi.entityService.update(
        "api::star-point.star-point",
        starPoint.id,
        {
          data: {
            amount: starPoint.amount + change,
          },
          fields: ["amount"],
        }
      );

      // record to star point history
      await strapi.entityService.create(
        "api::star-point-history.star-point-history",
        {
          data: {
            change,
            remaining: updated.amount,
            detail,
            star_point: { id: updated.id },
            inventories: { connect: userItems },
            publishedAt: new Date(),
          },
        }
      );

      return updated;
    },
  })
);
