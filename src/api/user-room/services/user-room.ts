/**
 * user-room service
 */

import { factories } from "@strapi/strapi";

const conditionValidator = {
  star_point: async (userId: number, amount: number) => {
    const user = await strapi.entityService.findOne(
      "plugin::users-permissions.user",
      userId,
      {
        fields: ["star_point"],
      }
    );

    if (user.star_point < amount) {
      return false;
    }

    return true;
  },
  room_completion: async (userId: number, roomIds: number[]) => {
    const userRooms = await strapi.entityService.findMany(
      "api::user-room.user-room",
      {
        filters: {
          user: { id: userId },
          room: { $in: roomIds },
          completed: true,
        },
      }
    );

    return userRooms.length === roomIds.length;
  },
  level: async (userId: number, level: number) => {
    const user = await strapi.entityService.findOne(
      "plugin::users-permissions.user",
      userId,
      {
        fields: ["level"],
      }
    );

    if (user.level < level) {
      return false;
    }

    return true;
  },
};

export default factories.createCoreService(
  "api::user-room.user-room",
  ({ strapi }) => ({
    async unlockRoom(userId: number, roomId: number) {
      const userRoom = await strapi
        .service("api::user-room.user-room")
        .getUserRoom(userId, roomId);

      if (userRoom.unlocked) {
        return userRoom;
      }

      const room = await strapi.entityService.findOne(
        "api::room.room",
        roomId,
        {
          fields: ["unlock_conditions"],
        }
      );

      if (!room) {
        throw "Room not found";
      }

      if (room.unlock_conditions) {
        for (const condition in room.unlock_conditions) {
          const value = room.unlock_conditions[condition];
          const isOk = conditionValidator[condition](userId, value);

          if (!isOk) {
            throw "Unlock condition not met";
          }
        }
      }

      return await strapi.db.transaction(async ({ trx }) => {
        if (room.unlock_conditions && room.unlock_conditions.star_point > 0) {
          await strapi
            .service("api::star-point.star-point")
            .updateStarPoint(
              userId,
              -room.unlock_conditions.star_point,
              "room_unlock"
            );
        }

        return await strapi.entityService.update(
          "api::user-room.user-room",
          userRoom.id,
          {
            data: {
              start_time: new Date(),
              unlocked: true,
            },
          }
        );
      });
    },

    async createUserRoomsWithoutUnlockCondition(userId: number) {
      const conditionNullRooms = await strapi.entityService.findMany(
        "api::room.room",
        {
          filters: {
            unlock_conditions: null,
          },
          fields: ["id"],
        }
      );

      const promises = conditionNullRooms.map((room) =>
        strapi
          .service("api::user-room.user-room")
          .getUserRoom(userId, room.id)
          .then((userRoom) =>
            userRoom.unlocked
              ? userRoom
              : strapi.entityService.update(
                  "api::user-room.user-room",
                  userRoom.id,
                  {
                    data: {
                      start_time: new Date(),
                      unlocked: true,
                    },
                  }
                )
          )
      );

      return await Promise.all(promises);
    },

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
            $or: [
              {
                unlocked: true,
              },
              {
                room: { unlock_conditions: null },
              },
            ],
          },
          populate: {
            user: {
              fields: ["id"],
            },
            room: {
              fields: ["name", "rid", "unlock_conditions"],
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
                localizations: {
                  fields: ["name", "locale"],
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
                localizations: {
                  fields: ["name", "locale"],
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
              start_time: null,
              completion_time: null,
              room: { id: roomId },
              user: { id: userId },
              completed: false,
              completion_rate: 0,
              duration: null,
              owned_items: {},
              initial_completion_checked: false,
              publishedAt: now,
              unlocked: false,
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
                  localizations: {
                    fields: ["name", "locale"],
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
