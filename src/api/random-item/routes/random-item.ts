export default {
  routes: [
    {
      method: "GET",
      path: "/random-item/:drawId",
      handler: "random-item.random-item",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
