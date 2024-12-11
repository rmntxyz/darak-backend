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
        .findRoomByRoomName(roomName);

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

        room.characters.forEach((character) => {
          applyLocalizations(character, locale);
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

          room.characters.forEach((character) => {
            applyLocalizations(character, locale);
          });
        });
      }

      return rooms;
    },

    "get-all-rooms-with-unpublished": async (ctx) => {
      return await strapi
        .service("api::room.room")
        .getAllRoomsWithUnpublished();
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

          room.characters.forEach((character) => {
            applyLocalizations(character, locale);
          });
        });
      }

      return rooms;
    },

    "get-room-by-name-with-unpublished": async (ctx) => {
      const { roomName } = ctx.params;

      if (!roomName) {
        return ctx.badRequest("Room name is required");
      }

      return await strapi
        .service("api::room.room")
        .getRoomByRoomNameWithUnpublished(roomName);
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

    "get-recommended-rooms": async (ctx) => {},

    "get-locked-rooms": async (ctx) => {
      const userId = ctx.state.user.id;

      const rooms = await strapi
        .service("api::room.room")
        .findLockedRooms(userId);

      if (rooms.length > 0) {
        // localizations
        const { locale } = ctx.query;

        rooms.forEach((room) => {
          applyLocalizations(room, locale);

          if (room.unlock_conditions?.room_completion?.length > 0) {
            for (const target of room.unlock_conditions.room_completion) {
              applyLocalizations(target, locale);
            }
          }
        });
      }

      return rooms;
    },
  })
);
