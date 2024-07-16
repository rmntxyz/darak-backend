export default {
  routes: [
    {
      method: "GET",
      path: "/rooms",
      handler: "room.get-all-rooms",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/room/:roomName",
      handler: "room.get-room-by-name",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/user-rooms/count",
      handler: "room.get-user-rooms-count",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/user-rooms/:userId",
      handler: "room.get-user-rooms",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/user-rooms/recommended",
      handler: "room.get-recommended-rooms",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/rooms/locked",
      handler: "room.get-locked-rooms",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
