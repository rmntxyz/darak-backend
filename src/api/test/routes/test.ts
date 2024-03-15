export default {
  routes: [
    {
      method: "GET",
      path: "/test1/:itemId",
      handler: "test.test1",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/test2/:itemId",
      handler: "test.test2",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
