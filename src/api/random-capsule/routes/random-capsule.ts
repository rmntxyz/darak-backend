export default {
  routes: [
    {
      method: "POST",
      path: "/random-capsule",
      handler: "random-capsule.gacha",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/random-capsule/test",
      handler: "random-capsule.test",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
