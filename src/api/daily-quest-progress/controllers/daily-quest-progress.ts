/**
 * daily-quest-progress controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::daily-quest-progress.daily-quest-progress",
  ({ strapi }) => ({
    "get-quest-progress": async (ctx) => {
      const userId = ctx.state.user?.id;

      if (!userId) {
        return ctx.unauthorized("user is not authenticated");
      }

      const result = await strapi
        .service("api::daily-quest-progress.daily-quest-progress")
        .getTodayQuest(userId);

      return result;
    },
    verify: async (ctx) => {
      const { progressId } = ctx.params;

      if (!progressId) {
        return ctx.badRequest("Daily Quest Progress ID is required");
      }

      const userId = ctx.state.user?.id;

      if (!userId) {
        return ctx.unauthorized("user is not authenticated");
      }

      try {
        const result = await strapi
          .service("api::daily-quest-progress.daily-quest-progress")
          .verify(userId, progressId);

        return result;
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
    "claim-rewards": async (ctx) => {
      const { progressId } = ctx.params;

      if (!progressId) {
        return ctx.badRequest("Daily Quest Progress ID is required");
      }

      const userId = ctx.state.user?.id;

      if (!userId) {
        return ctx.unauthorized("user is not authenticated");
      }

      try {
        const result = await strapi
          .service("api::daily-quest-progress.daily-quest-progress")
          .claimRewards(userId, progressId);

        return result;
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
  })
);
