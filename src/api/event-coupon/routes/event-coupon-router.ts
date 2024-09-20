export default {
  routes: [
    {
      method: "PUT",
      path: "/event-coupon/redeem",
      handler: "event-coupon.redeem",
      config: {
        policies: [],
        middlewares: ["global::mutex-by-user"],
      },
    },
  ],
};
