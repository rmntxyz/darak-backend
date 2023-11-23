export default {
  routes: [
    {
      method: "GET",
      path: "/achievement-progress/list",
      handler: "achievement-progress.get-achievement-list",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/achievement-progress/verify/:aid?",
      handler: "achievement-progress.verify",
      config: {
        policies: [],
        middlewares: ["global::mutex-by-user"],
      },
    },
    {
      method: "GET",
      path: "/achievement-progress/claim-rewards/:aid?",
      handler: "achievement-progress.claim-rewards",
      config: {
        policies: [],
        middlewares: ["global::mutex-by-user"],
      },
    },
  ],
};
