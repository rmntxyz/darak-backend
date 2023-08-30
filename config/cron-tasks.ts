export default {
  resetDailyQuest: {
    task: ({ strapi }) => {},
    options: {
      rule: "0 0 5 * * *",
      tz: "Asia/Seoul",
    },
  },
};
