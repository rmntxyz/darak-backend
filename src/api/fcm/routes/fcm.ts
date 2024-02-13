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
  ],
};
