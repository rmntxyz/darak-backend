export default {
  routes: [
    {
      method: "GET",
      path: "/random-item/:userId/:drawId",
      handler: "random-item.random-item",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
