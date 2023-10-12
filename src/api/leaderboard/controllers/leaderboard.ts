/**
 * A set of functions called "actions" for `leaderboard`
 */

export default {
  "get-room-completion-rankings": async (ctx) => {
    try {
      const roomId = ctx.params.roomId;

      if (!roomId) {
        return await strapi
          .service("api::leaderboard.leaderboard")
          .findOverallRoomCompletionRankings();
      }

      return await strapi
        .service("api::leaderboard.leaderboard")
        .findRoomCompletionRankings(roomId);
    } catch (err) {
      return ctx.forbidden("failed to get rankings.", { errors: err.message });
    }
  },
};
