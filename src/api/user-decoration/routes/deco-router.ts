export default {
  routes: [
    {
      method: "GET",
      path: "/decorations/with-rooms",
      handler: "user-decoration.get-decorations-with-rooms",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/decorations",
      handler: "user-decoration.create-decoration",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "PUT",
      path: "/decorations/:decoId",
      handler: "user-decoration.update-decoration",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
