/**
 * status controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::status.status",
  ({ strapi }) => ({
    "get-status": async (ctx) => {
      const userId = ctx.state.user?.id;

      if (!userId) {
        return ctx.unauthorized("user is not authenticated");
      }

      const status = await strapi
        .service("api::status.status")
        .getStatus(userId);

      return status;
    },

    "claim-level-up-reward": async (ctx) => {
      const userId = ctx.state.user?.id;

      if (!userId) {
        return ctx.unauthorized("user is not authenticated");
      }

      const reward = await strapi
        .service("api::status.status")
        .claimLevelUpReward(userId);

      return reward;
    },
  })
);
