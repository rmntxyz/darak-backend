export default {
  routes: [
    {
      method: "POST",
      path: "/random-item/from-unlocked-rooms",
      handler: "random-item.random-items-from-unlocked-rooms",
      config: {
        policies: [],
        middlewares: [],
      },
    },
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
