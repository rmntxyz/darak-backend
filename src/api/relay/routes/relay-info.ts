export default {
  routes: [
    {
      method: "GET",
      path: "/relay/status",
      handler: "relay.get-relay-status",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "PUT",
      path: "/past-relay/settlement",
      handler: "relay.settle-past-relay",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // {
    //   method: "GET",
    //   path: "/user-rooms/count",
    //   handler: "room.get-user-rooms-count",
    //   config: {
    //     policies: [],
    //     middlewares: [],
    //   },
    // },
    // {
    //   method: "GET",
    //   path: "/user-rooms/:userId",
    //   handler: "room.get-user-rooms",
    //   config: {
    //     policies: [],
    //     middlewares: [],
    //   },
    // },
  ],
};
