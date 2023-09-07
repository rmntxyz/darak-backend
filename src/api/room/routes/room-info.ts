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
  ],
};
