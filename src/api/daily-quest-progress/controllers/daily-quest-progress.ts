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
    "claim-rewards": async (ctx) => {
      const { qid } = ctx.params;

      if (!qid) {
        return ctx.badRequest("qid is required");
      }

      const userId = ctx.state.user?.id;

      if (!userId) {
        return ctx.unauthorized("user is not authenticated");
      }

      const result = await strapi
        .service("api::daily-quest-progress.daily-quest-progress")
        .claimRewards(userId, qid);
    },
  })
);
