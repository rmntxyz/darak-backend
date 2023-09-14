/**
 * room controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::room.room",
  ({ strapi }) => ({
    "get-room-info": async (ctx) => {
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

      return room;
    },

    "get-user-rooms": async (ctx) => {
      const { userId } = ctx.params;

      if (!userId) {
        return ctx.badRequest("User id is required");
      }

      const rooms = await strapi
        .service("api::room.room")
        .findUserRooms(userId);

      if (rooms.length === 0) {
        return ctx.notFound("Rooms not found");
      }

      return rooms;
    },
  })
);
