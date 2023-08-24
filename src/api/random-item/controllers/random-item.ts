/**
 * A set of functions called "actions" for `random-item`
 */

export default {
  "random-item": async (ctx, next) => {
    try {
      const { userId, drawId } = ctx.params;
      const result = await strapi
        .service("api::random-item.random-item")
        .drawRandom(userId, drawId);
      ctx.body = result;
    } catch (err) {
      return ctx.forbidden("draw failed", { errors: err.message });
    }
  },
};
