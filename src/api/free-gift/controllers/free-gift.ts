/**
 * free-gift controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::free-gift.free-gift",
  ({ strapi }) => ({
    get: async (ctx, next) => {
      const userId = ctx.state.user?.id;

      if (!userId) {
        return ctx.unauthorized("user is not authenticated");
      }

      const freeGift = await strapi
        .service("api::free-gift.free-gift")
        .getFreeGiftInfo(userId);

      return freeGift;
    },

    claim: async (ctx, next) => {
      const userId = ctx.state.user?.id;

      if (!userId) {
        return ctx.unauthorized("user is not authenticated");
      }

      try {
        const result = await strapi
          .service("api::free-gift.free-gift")
          .claimFreeGift(userId);

        return result;
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
  })
);
