/**
 * wheel-info controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::wheel-info.wheel-info",
  ({ strapi }) => ({
    "get-wheel-info": async (ctx) => {
      const userId = ctx.state.user?.id;

      if (!userId) {
        return ctx.unauthorized("user is not authenticated");
      }

      return await strapi
        .service("api::wheel-info.wheel-info")
        .getWheelInfo(userId);
    },
    "spin-wheel": async (ctx) => {
      const userId = ctx.state.user?.id;

      if (!userId) {
        return ctx.unauthorized("user is not authenticated");
      }

      const { wheelInfoId } = ctx.request.body;

      if (!wheelInfoId) {
        return ctx.badRequest("wheelInfoId is required");
      }

      return await strapi
        .service("api::wheel-info.wheel-info")
        .spinWheel(userId, wheelInfoId);
    },
  })
);
