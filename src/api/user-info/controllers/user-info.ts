/**
 * A set of functions called "actions" for `user-info`
 */

export default {
  "update-me": async (ctx) => {
    const userId = ctx.state.user?.id;

    if (!userId) {
      return ctx.unauthorized("user is not authenticated");
    }

    const { username, avatar } = ctx.request.body;

    return await strapi
      .service("api::user-info.user-info")
      .updateUserInfo(userId, username, avatar);
  },

  "deactivate-user": async (ctx) => {
    const userId = ctx.state.user?.id;

    if (!userId) {
      return ctx.unauthorized("user is not authenticated");
    }

    return await strapi
      .service("api::user-info.user-info")
      .deactivateUser(userId);
  },

  "reactivate-user": async (ctx) => {
    const userId = ctx.state.user?.id;

    if (!userId) {
      return ctx.unauthorized("user is not authenticated");
    }

    try {
      return await strapi
        .service("api::user-info.user-info")
        .reactivateUser(userId);
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },
};
