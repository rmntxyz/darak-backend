/**
 * inventory service
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreService(
  "api::inventory.inventory",
  ({ strapi }) => ({
    async sell(userId: number, userItems: number[]) {
      const promises = [];
      const itemsToSellByRoom = {};
      let sum = 0;

      for (const userItemId of userItems) {
        // update inventory
        const updated = await strapi.entityService.update(
          "api::inventory.inventory",
          userItemId,
          {
            data: {
              users_permissions_user: null,
            },
            populate: {
              item: {
                fields: ["price"],
                populate: {
                  room: {
                    fields: ["id"],
                  },
                },
              },
            },
          }
        );

        // accumulate star points
        sum += updated.item.price;

        // remap by room
        const items = itemsToSellByRoom[updated.item.room.id];
        if (!items) {
          itemsToSellByRoom[updated.item.room.id] = [];
        }
        itemsToSellByRoom[updated.item.room.id].push(updated.item.id);
      }

      // update user room
      for (const roomId in itemsToSellByRoom) {
        const userRoom = await strapi
          .service("api::user-room.user-room")
          .getUserRoom(userId, roomId);

        const items = itemsToSellByRoom[roomId];
        const updated = strapi
          .service("api::user-room.user-room")
          .updateItems(userRoom, [], items);

        promises.push(updated);
      }
      await Promise.all(promises);

      // update star point
      const starPoint = await strapi
        .service("api::star-point.star-point")
        .getStarPoint(userId);

      const updatedStarPoint = await strapi
        .service("api::star-point.star-point")
        .updateStarPoint(starPoint, sum, "item_sale");

      return updatedStarPoint;
    },
  })
);
