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
      let total = 0;

      for (const userItemId of userItems) {
        const updated = await strapi.entityService.update(
          "api::inventory.inventory",
          userItemId,
          {
            data: {
              user: null,
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

        total += updated.item.price;

        const items = itemsToSellByRoom[updated.item.room.id];
        if (!items) {
          itemsToSellByRoom[updated.item.room.id] = [];
        }

        itemsToSellByRoom[updated.item.room.id].push(updated.item.id);
      }

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

      const user = await strapi.entityService.update(
        "plugin::users-permissions.user",
        userId,
        {
          data: {},
        }
      );

      await Promise.all(promises);
    },
  })
);
