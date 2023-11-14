/**
 * A set of functions called "actions" for `leaderboard`
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::leaderboard.leaderboard",
  ({ strapi }) => ({
    "get-room-completion-rankings": async (ctx) => {
      try {
        const roomId = ctx.params.roomId;

        if (!roomId) {
          return await strapi
            .service("api::leaderboard.leaderboard")
            .getOverallRoomCompletionRankings();
        }

        return await strapi
          .service("api::leaderboard.leaderboard")
          .getRoomCompletionRankings(roomId);
      } catch (err) {
        return ctx.forbidden("failed to get rankings.", {
          errors: err.message,
        });
      }
    },

    "get-monthly-room-completion-rankings": async (ctx) => {
      try {
        return await strapi
          .service("api::leaderboard.leaderboard")
          .getMonthlyRoomCompletionRankings();
      } catch (err) {
        return ctx.forbidden("failed to get rankings.", {
          errors: err.message,
        });
      }
    },
  })
);
