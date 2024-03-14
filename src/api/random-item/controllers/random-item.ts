/**
 * A set of functions called "actions" for `random-item`
 */

import { applyLocalizations } from "../../../utils";

export default {
  "random-item": async (ctx, next) => {
    try {
      const { drawId } = ctx.params;

      if (!drawId) {
        return ctx.badRequest("drawId is required");
      }

      const userId = ctx.state.user?.id;

      if (!userId) {
        return ctx.unauthorized("user is not authenticated");
      }

      const results = await strapi
        .service("api::random-item.random-item")
        .drawRandom(userId, drawId);

      if (results.length > 0) {
        const { locale } = ctx.query;

        results.forEach((item) => {
          applyLocalizations(item, locale);
        });
      }

      return results;
    } catch (err) {
      return ctx.internalServerError("draw failed", err);
    }
  },
};
