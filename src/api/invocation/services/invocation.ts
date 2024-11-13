/**
 * invocation service
 */

export default ({ strapi }) => ({
  getInvocations: async (userId: number): Promise<Invocations> => {
    const hasUnsettledRelay = await strapi
      .service("api::relay.relay")
      .hasUnsettledRelay(userId);

    return {
      settle_relay: hasUnsettledRelay,
    };
  },
});
