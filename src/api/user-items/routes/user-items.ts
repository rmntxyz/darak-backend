export default {
  routes: [
    {
      method: "GET",
      path: "/user-items/room/:roomId?",
      handler: "user-items.get-user-items",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
