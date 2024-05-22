/**
 * relay controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::relay.relay",
  ({ strapi }) => ({
    "get-relay-status": async (ctx, next) => {
      const userId = ctx.state.user?.id;

      const result = await strapi
        .service("api::relay.relay")
        .getCurrentRelay(userId);

      return result;
    },
    "settle-past-relay": async (ctx, next) => {
      const userId = ctx.state.user?.id;

      const result = await strapi
        .service("api::relay.relay")
        .settlePastRelay(userId);

      return result;
    },
  })
);
