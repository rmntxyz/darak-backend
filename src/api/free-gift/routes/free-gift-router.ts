export default {
  routes: [
    {
      method: "GET",
      path: "/free-gift",
      handler: "free-gift.get",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/free-gift/claim",
      handler: "free-gift.claim",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
