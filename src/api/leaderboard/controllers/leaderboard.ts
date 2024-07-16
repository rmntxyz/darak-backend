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

    "get-exp-rankings": async (ctx) => {
      const userId = ctx.state.user?.id;
      const size = ctx.params.size;

      try {
        const rankings = await strapi
          .service("api::leaderboard.leaderboard")
          .getOverallExpRankings(size);

        let me = null;
        if (userId) {
          const inRankings: ExpRank = rankings.find(
            (ranking) => ranking.user?.id === userId
          );

          if (inRankings) {
            me = {
              ...inRankings,
              rank:
                rankings.filter((ranking) => ranking.exp > inRankings.exp)
                  .length + 1,
            };
          } else {
            me = await strapi
              .service("api::leaderboard.leaderboard")
              .getRankForOverallExp(userId);
          }

          return {
            rankings,
            me,
          };
        }

        return {
          rankings,
        };
      } catch (err) {
        return ctx.forbidden("failed to get rankings.", {
          errors: err.message,
        });
      }
    },

    // "get-monthly-exp-rankings": async (ctx) => {
    //   try {
    //     return await strapi
    //       .service("api::leaderboard.leaderboard")
    //       .getMonthlyExpRankings();
    //   } catch (err) {
    //     return ctx.forbidden("failed to get rankings.", {
    //       errors: err.message,
    //     });
    //   }
    // },
  })
);
