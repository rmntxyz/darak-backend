/**
 * daily-quest-progress controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::daily-quest-progress.daily-quest-progress",
  ({ strapi }) => ({
    "get-quest-progress": async (ctx) => {
      // const userId = ctx.state.user?.id;
      const userId = 51;

      if (!userId) {
        return ctx.unauthorized("user is not authenticated");
      }

      const user = await strapi.entityService.findOne(
        "plugin::users-permissions.user",
        userId
      );

      const result = await strapi
        .service("api::daily-quest-progress.daily-quest-progress")
        .getTodayQuest(user);

      return result;
    },
    "claim-rewards": async (ctx) => {
      // TODO: claim rewards
    },
  })
);
