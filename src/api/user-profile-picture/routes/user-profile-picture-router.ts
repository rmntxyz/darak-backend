export default {
  routes: [
    {
      method: "GET",
      path: "/user-profile-picture/list",
      handler: "user-profile-picture.get-user-profile-pictures",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
