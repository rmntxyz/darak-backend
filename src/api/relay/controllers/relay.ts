/**
 * relay controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::relay.relay",
  ({ strapi }) => ({
    "get-relay-status": async (ctx, next) => {
      const userId = ctx.state.user?.id;

      if (!userId) {
        return ctx.unauthorized("user is not authenticated");
      }

      const relays = await strapi
        .service("api::relay.relay")
        .getCurrentRelays(userId);

      if (relays && relays.length === 0) {
        return ctx.notFound("no current relay");
      }

      return relays;
    },
    "settle-past-relay": async (ctx, next) => {
      const userId = ctx.state.user?.id;

      if (!userId) {
        return ctx.unauthorized("user is not authenticated");
      }

      const result = await strapi
        .service("api::relay.relay")
        .settlePastRelay(userId);

      return result;
    },
  })
);
