/**
 * A set of functions called "actions" for `user-items`
 */

export default {
  "get-user-items": async (ctx) => {
    const userId = ctx.state.user?.id;

    if (!userId) {
      return ctx.unauthorized("user is not authenticated");
    }

    const { roomId } = ctx.params;

    return await strapi
      .service("api::user-items.user-items")
      .findUserItemsByRoom(userId, roomId);
  },
};
