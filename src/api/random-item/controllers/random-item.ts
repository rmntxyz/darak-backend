/**
 * A set of functions called "actions" for `random-item`
 */

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

      const result = await strapi
        .service("api::random-item.random-item")
        .drawRandom(userId, drawId);
      ctx.body = result;
    } catch (err) {
      return ctx.forbidden("draw failed", { errors: err.message });
    }
  },
};
