/**
 * user-decoration controller
 */

import { factories } from "@strapi/strapi";
import { applyLocalizations } from "../../../utils";

export default factories.createCoreController(
  "api::user-decoration.user-decoration",
  ({ strapi }) => ({
    "get-decorations-with-rooms": async (ctx) => {
      const userId = ctx.state.user?.id;

      if (!userId) {
        return ctx.badRequest("User id is required");
      }

      const userRooms = await strapi
        .service("api::user-room.user-room")
        .getUserRooms(userId);

      // localizations
      const { locale } = ctx.query;

      userRooms.forEach((userRoom) => {
        applyLocalizations(userRoom.room, locale);
      });

      const userDecorations = await strapi
        .service("api::user-decoration.user-decoration")
        .findUserDecorations(userId);

      return {
        user_rooms: userRooms,
        user_decorations: userDecorations,
      };
    },

    "create-decoration": async (ctx) => {
      const { userId } = ctx.params;
      if (!userId) {
        return ctx.badRequest("User id is required");
      }

      const userDecoration = await strapi
        .service("api::user-decoration.user-decoration")
        .createUserDecoration(userId);

      return userDecoration;
    },

    "update-decoration": async (ctx) => {
      const { userId, decoId } = ctx.params;

      if (!userId) {
        return ctx.badRequest("User id is required");
      }

      if (!decoId) {
        return ctx.badRequest("Decoration id is required");
      }

      // data

      const data = JSON.parse(ctx.request.body.data);

      // const { items, deco_items, texts, lines, snapshot, } = data;

      const userDecoration = await strapi
        .service("api::user-decoration.user-decoration")
        .updateUserDecoration(decoId, data);

      return userDecoration;
    },
  })
);
