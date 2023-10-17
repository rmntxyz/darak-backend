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
    {
      method: "GET",
      path: "/admin/reset-user-room",
      handler: "admin.reset-user-room",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
