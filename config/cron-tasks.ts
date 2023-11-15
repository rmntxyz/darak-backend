export default {
  resetMonthlyCriteria: {
    task: async ({ strapi }) => {
      await strapi
        .service("api::leaderboard.leaderboard")
        .updateMonthlyRoomCompletionCriteria();
    },
    options: {
      rule: "0 0 0 1 * *",
      tz: "Asia/Seoul",
    },
  },
};
