export default {
  routes: [
    {
      method: "GET",
      path: "/creator/list",
      handler: "creator.get-creator-list",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/creator/:creatorId",
      handler: "creator.get-creator-detail",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
