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

      // find webtoon with roomName and populate webtoon
      const rooms = await strapi.entityService.findMany("api::room.room", {
        filters: { rid: roomName },
        fields: ["name", "desc", "rid", "start_date", "end_date"],
        populate: {
          webtoon: {
            fields: ["title", "desc", "volume", "webtoon_id", "release_date"],
            populate: {
              episodes: true,
              webtoon_outlinks: {
                fields: ["sns", "url"],
              },
              cover_image: {
                populate: ["url"],
              },
            },
          },
        },
      });

      if (rooms.length === 0) {
        return ctx.notFound("Room not found");
      }

      return rooms[0];
    },
  })
);
