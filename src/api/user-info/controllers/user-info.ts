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
  // exampleAction: async (ctx, next) => {
  //   try {
  //     ctx.body = 'ok';
  //   } catch (err) {
  //     ctx.body = err;
  //   }
  // }
};
