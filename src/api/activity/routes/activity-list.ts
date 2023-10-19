export default {
  routes: [
    {
      method: "GET",
      path: "/activity/list/:category?",
      handler: "activity.get-activity-list",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
