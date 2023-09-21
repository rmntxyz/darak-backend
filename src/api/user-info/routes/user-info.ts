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
  ],
};
