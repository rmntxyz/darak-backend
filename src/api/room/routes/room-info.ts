export default {
  routes: [
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
  ],
};
