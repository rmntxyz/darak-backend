export default {
  routes: [
    {
      method: "PUT",
      path: "/event-coupon/redeem",
      handler: "event-coupon.redeem",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "PUT",
      path: "/event-coupon/claim-redeem-codes",
      handler: "event-coupon.claim-redeem-codes",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
