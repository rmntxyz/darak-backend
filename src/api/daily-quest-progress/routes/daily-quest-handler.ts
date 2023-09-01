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
      path: "/daily-quest-progress/claim-rewards/:qid",
      handler: "daily-quest-progress.claim-rewards",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
