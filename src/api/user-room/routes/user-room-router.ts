export default {
  routes: [
    {
      method: "GET",
      path: "/user-room/initial-completion-check/:roomId?",
      handler: "user-room.is-initial-completion",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
