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
      method: "PUT",
      path: "/daily-quest-progress/verify",
      handler: "daily-quest-progress.verify",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/daily-quest-progress/claim-rewards",
      handler: "daily-quest-progress.claim-rewards",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
