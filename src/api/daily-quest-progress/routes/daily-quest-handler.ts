export default {
  routes: [
    {
      method: "GET",
      path: "/daily-quest-progress/today",
      handler: "daily-quest-progress.get-quest-progress",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/daily-quest-progress/verify/:progressId",
      handler: "daily-quest-progress.verify",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/daily-quest-progress/claim-rewards/:progressId",
      handler: "daily-quest-progress.claim-rewards",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
