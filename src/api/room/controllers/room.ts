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
          image_complete: {
            fields: ["url", "width", "height"],
          },
          image_empty: {
            fields: ["url", "width", "height"],
          },
          items: {
            fields: [
              "name",
              "desc",
              "rarity",
              "category",
              "attribute",
              "current_serial_number",
            ],
            populate: {
              image: {
                fields: ["url"],
              },
              thumbnail: {
                fields: ["url"],
              },
              additional_images: {
                fields: ["url"],
              },
            },
          },
          webtoon: {
            fields: ["title", "desc", "volume", "webtoon_id", "release_date"],
            populate: {
              episodes: true,
              webtoon_outlinks: {
                fields: ["platform", "url"],
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

      const room = rooms[0];

      if (ctx.state.user) {
        const userId = ctx.state.user.id;

        // find user's items for this room
        const inventory = await strapi.entityService.findMany(
          "api::inventory.inventory",
          {
            fields: ["serial_number"],
            populate: {
              item: {
                fields: ["rarity"],
              },
            },
            filters: {
              users_permissions_user: { id: userId },
              item: { room: { id: room.id } },
            },
          }
        );

        room.inventory = inventory;
      }

      return room;
    },
  })
);
