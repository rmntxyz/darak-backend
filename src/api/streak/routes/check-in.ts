export default {
  routes: [
    {
      method: "GET",
      path: "/streak/status",
      handler: "streak.get-streak-status",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/streak/check-in",
      handler: "streak.check-in",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
