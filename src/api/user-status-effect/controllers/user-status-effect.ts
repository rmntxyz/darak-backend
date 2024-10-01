/**
 * user-status-effect controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::user-status-effect.user-status-effect",
  ({ strapi }) => ({
    async request(ctx) {
      const { user } = ctx.state;
      const { effect } = ctx.params;
      const data = ctx.request.body;

      const userEffect = await strapi
        .service("api::user-status-effect.user-status-effect")
        .getUserStatusEffect(user.id, effect);

      const verified = await strapi
        .service("api::status-effect.status-effect")
        .verify(userEffect, data);

      if (!verified) {
        throw new Error("StatusEffect not verified");
      }

      return await strapi
        .service("api::user-status-effect.user-status-effect")
        .updateStack(userEffect, 1);
    },
  })
);
