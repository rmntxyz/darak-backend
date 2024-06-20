export default {
  routes: [
    {
      method: "GET",
      path: "/status/me",
      handler: "status.get-status",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/status/level-up-test",
      handler: "status.level-up-test",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/status/claim-level-up-reward",
      handler: "status.claim-level-up-reward",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
