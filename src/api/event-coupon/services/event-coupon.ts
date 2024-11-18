/**
 * event-coupon service
 */

import { factories } from "@strapi/strapi";
import { ErrorCode } from "../../../constant";

export default factories.createCoreService(
  "api::event-coupon.event-coupon",
  ({ strapi }) => ({
    async getCoupon(userId, code) {
      const coupon = (
        await strapi.entityService.findMany("api::event-coupon.event-coupon", {
          filters: {
            code,
            publishedAt: { $ne: null },
          },
          fields: ["code", "start_date", "end_date"],
          populate: {
            rewards: true,
            users: {
              filters: {
                id: userId,
              },
              fields: ["id"],
            },
          },
        })
      )[0];

      return coupon;
    },

    async checkNotRedeemed(userId) {
      return await strapi.entityService.findMany("api::redeem.redeem", {
        filters: {
          user: userId,
          redeemed: false,
        },
        fields: ["id", "redeemed", "code", "createdAt"],
        populate: {
          user: {
            fields: ["id", "username"],
          },
        },
      });
    },
  })
);
