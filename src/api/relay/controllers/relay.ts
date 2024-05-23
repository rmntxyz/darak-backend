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

      const result = await strapi
        .service("api::relay.relay")
        .getCurrentRelay(userId);

      if (!result) {
        return ctx.notFound("no current relay");
      }

      return result;
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
