export default {
  routes: [
    {
      method: "POST",
      path: "/attack/target",
      handler: "attack.attack",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/attack/targets",
      handler: "attack.find-targets",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
