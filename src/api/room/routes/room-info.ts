export default {
  routes: [
    {
      method: "GET",
      path: "/room/:roomName",
      handler: "room.get-room-info",
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
