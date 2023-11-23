/**
 * achievement-progress controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::achievement-progress.achievement-progress",
  ({ strapi }) => ({
    "get-achievement-list": async (ctx) => {
      const userId = ctx.state.user?.id;

      if (!userId) {
        return ctx.unauthorized("user is not authenticated");
      }

      const result = await strapi
        .service("api::achievement-progress.achievement-progress")
        .getAchievementList(userId);

      return result;
    },

    verify: async (ctx) => {
      const { aid } = ctx.params;

      const userId = ctx.state.user?.id;

      if (!userId) {
        return ctx.unauthorized("user is not authenticated");
      }

      try {
        let result;

        if (aid) {
          result = await strapi
            .service("api::achievement-progress.achievement-progress")
            .verify(userId, aid);
        } else {
          result = await strapi
            .service("api::achievement-progress.achievement-progress")
            .verifyAll(userId);
        }

        return result;
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },

    "claim-rewards": async (ctx) => {
      const { aid } = ctx.params;

      const userId = ctx.state.user?.id;

      if (!userId) {
        return ctx.unauthorized("user is not authenticated");
      }

      try {
        let result;

        if (aid) {
          result = await strapi
            .service("api::achievement-progress.achievement-progress")
            .claimRewards(userId, aid);
        } else {
          result = await strapi
            .service("api::achievement-progress.achievement-progress")
            .claimAllRewards(userId);
        }

        return result;
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
  })
);
