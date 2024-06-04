export default {
  routes: [
    {
      method: "POST",
      path: "/user-room/unlock",
      handler: "user-room.unlock-room",
      config: {
        policies: [],
        middlewares: [],
      },
    },
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
