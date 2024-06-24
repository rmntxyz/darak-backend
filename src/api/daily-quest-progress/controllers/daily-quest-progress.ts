/**
 * daily-quest-progress controller
 */

import { factories } from "@strapi/strapi";
import { applyLocalizations } from "../../../utils";

export default factories.createCoreController(
  "api::daily-quest-progress.daily-quest-progress",
  ({ strapi }) => ({
    "get-quest-progress": async (ctx) => {
      const userId = ctx.state.user?.id;

      if (!userId) {
        return ctx.unauthorized("user is not authenticated");
      }

      const results = await strapi
        .service("api::daily-quest-progress.daily-quest-progress")
        .getTodayQuests(userId);

      const { locale } = ctx.query;
      for (const result of results) {
        applyLocalizations(result.daily_quest, locale);
      }

      return results;
    },

    verify: async (ctx) => {
      const { progressId } = ctx.request.body;

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

        applyLocalizations(result.daily_quest, ctx.query.locale);

        return result;
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },

    "claim-rewards": async (ctx) => {
      const { progressId } = ctx.request.body;

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
