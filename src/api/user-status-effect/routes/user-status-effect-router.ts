export default {
  routes: [
    {
      method: "PUT",
      path: "/user-status-effect/request/:effectName",
      handler: "user-status-effect.request",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
