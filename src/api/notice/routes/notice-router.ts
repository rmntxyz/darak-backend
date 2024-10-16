export default {
  routes: [
    {
      method: "GET",
      path: "/notice",
      handler: "notice.get-notice",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
