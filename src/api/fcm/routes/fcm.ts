export default {
  routes: [
    {
      method: "POST",
      path: "/fcm/send-all",
      handler: "fcm.send-all",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/fcm/:locale/send",
      handler: "fcm.send",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
