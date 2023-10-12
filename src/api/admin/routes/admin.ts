export default {
  routes: [
    {
      method: "GET",
      path: "/admin/migration-rooms",
      handler: "admin.migration-room-to-userRoom",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
