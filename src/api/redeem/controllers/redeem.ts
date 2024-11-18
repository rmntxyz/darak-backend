/**
 * redeem controller
 */

import { factories } from "@strapi/strapi";
import format from "string-template";
import fs from "fs";
import { ErrorCode } from "../../../constant";

export default factories.createCoreController(
  "api::redeem.redeem",
  ({ strapi }) => ({
    submit: async (ctx) => {
      const { username, code } = ctx.request.body;

      try {
        // find by username
        const user = (
          await strapi.entityService.findMany(
            "plugin::users-permissions.user",
            {
              filters: {
                username,
              },
              fields: ["id", "username"],
            }
          )
        )[0];

        if (!user) {
          throw ErrorCode.INVALID_USERNAME;
        }

        const userId = user.id;

        // find coupon
        const coupon = await strapi
          .service("api::event-coupon.event-coupon")
          .getCoupon(userId, code);

        if (!coupon) {
          throw ErrorCode.COUPON_CODE_NOT_FOUND;
        }

        // check if coupon is valid
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

        // check if coupon is already redeemed
        const redeemed = (
          await strapi.entityService.findMany("api::redeem.redeem", {
            filters: {
              user: userId,
              code,
            },
            fields: ["id", "redeemed"],
          })
        )[0];

        if (redeemed) {
          throw ErrorCode.COUPON_ALREADY_REDEEMED;
        }

        // create redeem
        await strapi.entityService.create("api::redeem.redeem", {
          data: {
            user: { id: userId },
            code,
            redeemed: false,
            publishedAt: new Date(),
          },
        });

        ctx.status = 200;

        return {
          message: format("Redeem coupon {code} for user {username}", {
            code,
            username,
          }),
        };
      } catch (error) {
        return ctx.badRequest(error.message, error);
      }
    },

    form: async (ctx) => {
      // return html form
      ctx.set("Content-Type", "text/html");
      ctx.body = fs.readFileSync(`public/redeem/index.html`, "utf8");
    },
  })
);
