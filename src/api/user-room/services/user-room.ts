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
      const {
        id,
        start_time,
        owned_items,
        room,
        completed: prev_completed,
      } = userRoom;

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

      const total = room.items.filter(
        (item) => item.category === "decoration"
      ).length;

      const completion_rate = Math.round(
        (Object.values(owned_items).filter(Boolean).length / total) * 100
      );

      const completed = completion_rate === 100;

      const data: Partial<UserRoom> = {
        owned_items,
        completion_rate,
        completed,
      };

      if (!prev_completed && completed) {
        const now = new Date();
        data.completion_time = now;
        data.duration = now.getTime() - new Date(start_time).getTime();
      }

      const updatedUserRoom = await strapi.entityService.update(
        "api::user-room.user-room",
        id,
        {
          data,
          populate: {
            user: {
              fields: ["id"],
            },
            room: {
              fields: ["id"],
            },
          },
        }
      );

      if (prev_completed !== completed) {
        await strapi
          .service("api::update-manager.update-manager")
          .updateRoomCompletion(updatedUserRoom);
      }
    },
    async getUserRooms(userId: number) {
      const userRooms = await strapi.entityService.findMany(
        "api::user-room.user-room",
        {
          filters: {
            user: { id: userId },
          },
          populate: {
            user: {
              fields: ["id"],
            },
            room: {
              fields: ["name", "rid"],
              populate: {
                image_complete: {
                  fields: ["url"],
                },
                items: {
                  fields: ["category", "rarity"],
                  populate: {
                    image: {
                      fields: ["url"],
                    },
                  },
                },
              },
            },
          },
        }
      );

      return userRooms;
    },

    async getUserRoom(userId: number, roomId: number, forceCreate = true) {
      let userRoom = (
        await strapi.entityService.findMany("api::user-room.user-room", {
          filters: {
            user: { id: userId },
            room: { id: roomId },
          },
          populate: {
            user: {
              fields: ["id"],
            },
            room: {
              fields: ["name", "rid"],
              populate: {
                image_complete: {
                  fields: ["url"],
                },
                items: {
                  fields: ["category", "rarity"],
                  populate: {
                    image: {
                      fields: ["url"],
                    },
                  },
                },
              },
            },
          },
        })
      )[0];

      if (!userRoom && forceCreate) {
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
              initial_completion_checked: false,
              publishedAt: now,
            },
            populate: {
              user: {
                fields: ["id"],
              },
              room: {
                fields: ["name", "rid"],
                populate: {
                  image_complete: {
                    fields: ["url"],
                  },
                  items: {
                    fields: ["category", "rarity"],
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
