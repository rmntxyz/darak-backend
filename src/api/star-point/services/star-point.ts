/**
 * star-point service
 */

import { factories } from "@strapi/strapi";
import { ErrorCode } from "../../../constant";

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
      userId: number,
      change: number,
      detail: StarPointChangeDetail,
      userItems: number[] = []
    ) {
      return await strapi.db.transaction(async ({ trx }) => {
        const [starPoint] = await strapi.db
          .connection("star_points")
          .transacting(trx)
          .forUpdate()
          .join(
            "star_points_user_links",
            "star_points.id",
            "star_points_user_links.star_point_id"
          )
          .where("star_points_user_links.user_id", userId)
          .select("star_points.amount");

        if (starPoint.amount + change < 0) {
          throw ErrorCode.NOT_ENOUGH_STAR_POINTS;
        }

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
      });
    },
  })
);
