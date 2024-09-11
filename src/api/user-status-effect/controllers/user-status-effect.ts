/**
 * user-status-effect controller
 */

import { factories } from "@strapi/strapi";
import { UserStatusEffectOptions } from "../services/user-status-effect";

export default factories.createCoreController(
  "api::user-status-effect.user-status-effect",
  ({ strapi }) => ({
    async request(ctx) {
      const { user } = ctx.state;
      const { effectName } = ctx.params;
      const data = ctx.request.body;

      const userEffect = await strapi
        .service("api::user-status-effect.user-status-effect")
        .getUserStatusEffect(user.id, effectName);

      const verified = await strapi
        .service("api::status-effect.status-effect")
        .verify(userEffect, user.id, data);

      if (!verified) {
        throw new Error("StatusEffect not verified");
      }

      return await strapi
        .service("api::user-status-effect.user-status-effect")
        .activate(user.id, userEffect);
    },
  })
);
