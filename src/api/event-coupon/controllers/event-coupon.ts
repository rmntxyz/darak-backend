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

      try {
        const coupon = await strapi
          .service("api::event-coupon.event-coupon")
          .getCoupon(userId, code);

        if (!coupon) {
          throw ErrorCode.COUPON_CODE_NOT_FOUND;
        }

        const { start_date, end_date, users } = coupon;

        let now = new Date().getTime();

        if (start_date) {
          const start = new Date(start_date).getTime();
          if (start > now) {
            throw ErrorCode.COUPON_NOT_STARTED;
          }
        }

        if (end_date) {
          const end = new Date(end_date).getTime();
          if (end < now) {
            throw ErrorCode.COUPON_EXPIRED;
          }
        }

        if (users.length > 0) {
          throw ErrorCode.COUPON_ALREADY_REDEEMED;
        }

        const { rewards } = coupon;

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
      } catch (error) {
        return ctx.badRequest(error.message, error);
      }
    },

    "claim-redeem-codes": async (ctx) => {
      const userId = ctx.state.user.id;

      const notRedeemed = await strapi
        .service("api::event-coupon.event-coupon")
        .checkNotRedeemed(userId);

      if (notRedeemed.length === 0) {
        return ctx.badRequest("No rewards to redeem", ErrorCode.NO_REWARDS);
      }

      try {
        const coupons = [];

        for (const redeem of notRedeemed) {
          const { code } = redeem;

          const coupon = await strapi
            .service("api::event-coupon.event-coupon")
            .getCoupon(userId, code);

          if (!coupon) {
            throw ErrorCode.COUPON_CODE_NOT_FOUND;
          }

          const { start_date, end_date, users, createdAt } = coupon;

          let redeemedAt = new Date(createdAt).getTime();

          if (end_date) {
            const end = new Date(end_date).getTime();
            if (end < redeemedAt) {
              throw ErrorCode.COUPON_EXPIRED;
            }
          }

          if (users.length > 0) {
            throw ErrorCode.COUPON_ALREADY_REDEEMED;
          }

          await strapi.entityService.update("api::redeem.redeem", redeem.id, {
            data: {
              redeemed: true,
            },
          });
          await strapi.entityService.update(
            "api::event-coupon.event-coupon",
            coupon.id,
            {
              data: {
                users: { connect: [userId] },
              },
            }
          );

          const { rewards } = coupon;

          if (rewards.length > 0) {
            await strapi
              .service("api::reward.reward")
              .claim(userId, rewards, "redeem");
          }

          coupons.push(coupon);
        }

        return coupons;
      } catch (error) {
        return ctx.badRequest(error.message, error);
      }
    },
  })
);
