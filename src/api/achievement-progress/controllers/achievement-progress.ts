/**
 * achievement-progress controller
 */

import { factories } from "@strapi/strapi";
import { applyLocalizations } from "../../../utils";

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

      const { locale } = ctx.query;

      // result is object
      for (let key in result) {
        console.log(result[key]);
        const { achievement, milestone_progresses } = result[key];
        applyLocalizations(achievement, locale);
        applyLocalizations(achievement.badge, locale);

        achievement.milestones.forEach((milestone) => {
          applyLocalizations(milestone, locale);
          applyLocalizations(milestone.badge, locale);
        });

        milestone_progresses.forEach(({ achievement }) => {
          applyLocalizations(achievement, locale);
          applyLocalizations(achievement.badge, locale);
        });
      }

      return result;
    },

    verify: async (ctx) => {
      const { aid } = ctx.params;

      const userId = ctx.state.user?.id;

      if (!userId) {
        return ctx.unauthorized("user is not authenticated");
      }

      // try {
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
      // } catch (error) {
      //   return ctx.badRequest(error.message);
      // }
    },

    "get-verified-list": async (ctx) => {
      const userId = ctx.state.user?.id;

      if (!userId) {
        return ctx.unauthorized("user is not authenticated");
      }

      const result = await strapi
        .service("api::achievement-progress.achievement-progress")
        .getVerifiedList(userId);

      return result;
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

    "read-status": async (ctx) => {
      const { progressId } = ctx.params;

      const userId = ctx.state.user?.id;

      if (!userId) {
        return ctx.unauthorized("user is not authenticated");
      }

      try {
        if (progressId) {
          const result = await strapi
            .service("api::achievement-progress.achievement-progress")
            .readStatus(progressId);

          return result;
        } else {
          const results = await strapi
            .service("api::achievement-progress.achievement-progress")
            .readAllStatus(userId);

          return results;
        }
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },
  })
);
