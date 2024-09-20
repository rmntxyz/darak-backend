/**
 * event-coupon controller
 */

import { factories } from "@strapi/strapi";
import { ErrorCode } from "../../../constant";

export default factories.createCoreController(
  "api::event-coupon.event-coupon",
  ({ strapi }) => ({
    async redeem(ctx) {
      const userId = ctx.state.user.id;
      const { code } = ctx.request.body;

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

      if (!coupon) {
        return ctx.notFound(
          "coupon not found",
          ErrorCode.COUPON_CODE_NOT_FOUND
        );
      }

      const { start_date, end_date, users, rewards } = coupon;

      let now = new Date().getTime();

      if (start_date) {
        const start = new Date(start_date).getTime();
        if (start > now) {
          return ctx.badRequest(
            "coupon not started",
            ErrorCode.COUPON_NOT_STARTED
          );
        }
      }

      if (end_date) {
        const end = new Date(end_date).getTime();
        if (end < now) {
          return ctx.badRequest("coupon expired", ErrorCode.COUPON_EXPIRED);
        }
      }

      if (users.length > 0) {
        return ctx.badRequest(
          "coupon already redeemed",
          ErrorCode.COUPON_ALREADY_REDEEMED
        );
      }

      await strapi.entityService.update(
        "api::event-coupon.event-coupon",
        coupon.id,
        {
          data: {
            users: { connect: [userId] },
          },
        }
      );

      if (rewards.length > 0) {
        await strapi
          .service("api::reward.reward")
          .claim(userId, rewards, "redeem");
      }

      return rewards;
    },
  })
);
