/**
 * room controller
 */

import { factories } from "@strapi/strapi";
import { applyLocalizations } from "../../../utils";

export default factories.createCoreController(
  "api::room.room",
  ({ strapi }) => ({
    "get-room-by-name": async (ctx) => {
      const { roomName } = ctx.params;

      if (!roomName) {
        return ctx.badRequest("Room name is required");
      }

      const rooms = await strapi
        .service("api::room.room")
        .findRooomByRoomName(roomName);

      if (rooms.length === 0) {
        return ctx.notFound("Room not found");
      }

      const room = rooms[0];

      if (rooms) {
        // localizations
        const { locale } = ctx.query;

        applyLocalizations(room, locale);

        applyLocalizations(room.creator, locale);

        if (room.webtoon) {
          applyLocalizations(room.webtoon, locale);

          room.webtoon.episodes.forEach((episode) => {
            applyLocalizations(episode, locale);
          });
        }

        room.items.forEach((item) => {
          applyLocalizations(item, locale);
        });
      }

      return room;
    },

    "get-all-rooms": async (ctx) => {
      const rooms = await strapi.service("api::room.room").findAll();

      if (rooms.length !== 0) {
        // localizations
        const { locale } = ctx.query;

        rooms.forEach((room) => {
          applyLocalizations(room, locale);

          applyLocalizations(room.creator, locale);

          if (room.webtoon) {
            applyLocalizations(room.webtoon, locale);

            room.webtoon.episodes.forEach((episode) => {
              applyLocalizations(episode, locale);
            });
          }

          room.items.forEach((item) => {
            applyLocalizations(item, locale);
          });
        });
      }

      return rooms;
    },

    "get-user-rooms": async (ctx) => {
      const { userId } = ctx.params;

      if (!userId) {
        return ctx.badRequest("User id is required");
      }

      const rooms = await strapi
        .service("api::room.room")
        .findUserRooms(userId);

      if (rooms.length !== 0) {
        // localizations
        const { locale } = ctx.query;

        rooms.forEach((room) => {
          applyLocalizations(room, locale);

          applyLocalizations(room.creator, locale);

          if (room.webtoon) {
            applyLocalizations(room.webtoon, locale);

            room.webtoon.episodes.forEach((episode) => {
              applyLocalizations(episode, locale);
            });
          }

          room.items.forEach((item) => {
            applyLocalizations(item, locale);
          });
        });
      }

      return rooms;
    },

    /**
     * @public
     * @param ctx
     * @returns
     */
    "get-user-rooms-count": async (ctx) => {
      const rooms = await strapi.service("api::room.room").findUserRoomsCount();

      if (rooms.length !== 0) {
        // localizations
        const { locale } = ctx.query;

        rooms.forEach((room) => {
          applyLocalizations(room, locale);

          applyLocalizations(room.creator, locale);

          room.items.forEach((item) => {
            applyLocalizations(item, locale);
          });
        });
      }

      return rooms;
    },
  })
);
