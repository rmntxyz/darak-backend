export default {
  routes: [
    {
      method: "POST",
      path: "/redeem/submit",
      handler: "redeem.submit",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/redeem/form",
      handler: "redeem.form",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
