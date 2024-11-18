/**
 * invocation service
 */

export default ({ strapi }) => ({
  getInvocations: async (userId: number): Promise<Invocations> => {
    const hasUnsettledRelay = await strapi
      .service("api::relay.relay")
      .hasUnsettledRelay(userId);

    const notRedeemed = await strapi
      .service("api::event-coupon.event-coupon")
      .checkNotRedeemed(userId);

    return {
      settle_relay: hasUnsettledRelay,
      claim_redeem_code: notRedeemed.length > 0,
    };
  },
});
