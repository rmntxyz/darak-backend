/**
 * user-room service
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreService(
  "api::user-room.user-room",
  ({ strapi }) => ({
    async updateItems(
      userRoom: UserRoom,
      itemsToAdd: number[],
      itemsToRemove: number[]
    ) {
      const { id, start_time, owned_items, room } = userRoom;

      for (const itemId of itemsToAdd) {
        if (!owned_items[itemId]) {
          owned_items[itemId] = 0;
        }
        owned_items[itemId] += 1;
      }

      for (const itemId of itemsToRemove) {
        if (owned_items[itemId]) {
          owned_items[itemId] -= 1;
        }
      }

      const total = room.items.length;

      const completion_rate = Math.round(
        (Object.values(owned_items).filter(Boolean).length / total) * 100
      );

      const completed = completion_rate === 100;

      const data: Partial<UserRoom> = {
        owned_items,
        completion_rate,
        completed,
      };

      if (completed) {
        const now = new Date();
        data.completion_time = now;
        data.duration = now.getTime() - new Date(start_time).getTime();
      }

      return strapi.entityService.update("api::user-room.user-room", id, {
        data,
      });
    },

    async getUserRoom(userId: number, roomId: number) {
      let userRoom = (
        await strapi.entityService.findMany("api::user-room.user-room", {
          filters: {
            user: { id: userId },
            room: { id: roomId },
          },
          populate: {
            room: {
              fields: ["id"],
              populate: {
                items: {
                  fields: ["rarity"],
                },
              },
            },
          },
        })
      )[0];

      if (!userRoom) {
        const now = new Date();

        // TEMPORARY: link user to room
        await strapi.entityService.update(
          "plugin::users-permissions.user",
          userId,
          {
            data: {
              rooms: {
                connect: [roomId],
              },
            },
          }
        );

        userRoom = await strapi.entityService.create(
          "api::user-room.user-room",
          {
            data: {
              start_time: now,
              completion_time: null,
              room: { id: roomId },
              user: { id: userId },
              completed: false,
              completion_rate: 0,
              duration: null,
              owned_items: {},
              publishedAt: now,
            },
            populate: {
              room: {
                fields: ["id"],
                populate: {
                  items: {
                    fields: ["rarity"],
                  },
                },
              },
            },
          }
        );
      }

      return userRoom;
    },
  })
);
