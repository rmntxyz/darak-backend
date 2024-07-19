export default {
  routes: [
    {
      method: "PUT",
      path: "/user-info/me",
      handler: "user-info.update-me",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "PUT",
      path: "/user-info/deactivate",
      handler: "user-info.deactivate-user",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "PUT",
      path: "/user-info/reactivate",
      handler: "user-info.reactivate-user",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
