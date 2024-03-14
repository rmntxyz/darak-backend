/**
 * A set of functions called "actions" for `user-items`
 */

import { applyLocalizations } from "../../../utils";

export default {
  "get-user-items": async (ctx) => {
    const userId = ctx.state.user?.id;

    if (!userId) {
      return ctx.unauthorized("user is not authenticated");
    }

    const { roomId } = ctx.params;

    const userItems = await strapi
      .service("api::user-items.user-items")
      .findUserItemsByRoom(userId, roomId);

    //localizations
    if (userItems.length > 0) {
      const { locale } = ctx.query;

      userItems.forEach((userItem) => {
        applyLocalizations(userItem.item, locale);
      });
    }

    return userItems;
  },
};
