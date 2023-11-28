export default {
  routes: [
    {
      method: "GET",
      path: "/admin/update-monthly-criteria",
      handler: "admin.update-monthly-criteria",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/admin/create-leaderboard/:name",
      handler: "admin.create-leaderboard",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/admin/update-leaderboard",
      handler: "admin.update-leaderboard",
      config: {
        policies: [],
        middlewares: [],
      },
    },
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
    {
      method: "GET",
      path: "/admin/check-user-room",
      handler: "admin.check-user-room",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/admin/reset-owned-items",
      handler: "admin.reset-owned-items",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/admin/create-achievement-progress",
      handler: "admin.create-achievement-progress",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
