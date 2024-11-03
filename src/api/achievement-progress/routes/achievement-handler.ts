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
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/achievement-progress/verified-list",
      handler: "achievement-progress.get-verified-list",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/achievement-progress/claim-rewards/:aid?",
      handler: "achievement-progress.claim-rewards",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/achievement-progress/status/:progressId?",
      handler: "achievement-progress.read-status",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
