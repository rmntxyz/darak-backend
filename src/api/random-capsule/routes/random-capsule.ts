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
  ],
};
