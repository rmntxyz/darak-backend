export default {
  routes: [
    {
      method: "GET",
      path: "/wheel-info",
      handler: "wheel-info.get-wheel-info",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/wheel-info/spin",
      handler: "wheel-info.spin-wheel",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
