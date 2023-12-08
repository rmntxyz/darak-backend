/**
 * A set of functions called "actions" for `admin`
 */
import { diff } from "deep-diff";

export default {
  "update-monthly-criteria": async (ctx) => {
    return await strapi
      .service("api::leaderboard.leaderboard")
      .updateMonthlyRoomCompletionCriteria();
  },
  "create-leaderboard": async (ctx) => {
    const { name } = ctx.params;
    const exist = await strapi
      .service("api::leaderboard.leaderboard")
      .getLeaderboard(name);
    return exist ? 200 : 400;
  },
  "update-leaderboard": async (ctx) => {
    const exist = await strapi
      .service("api::update-manager.update-manager")
      .updateRoomCompletionRankings();
    return exist ? 200 : 400;
  },
  "reset-user-room": async (ctx) => {
    // strapi transaction
    // const result = await strapi.db.transaction(async () => {
    // find all user rooms
    const userRooms = await strapi.entityService.findMany(
      "api::user-room.user-room",
      {
        populate: {
          room: {
            fields: ["id"],
            populate: {
              draws: {
                fields: ["id"],
              },
            },
          },
          user: {
            fields: ["id"],
          },
        },
      }
    );

    const promises = userRooms.map(async (userRoom) => {
      const id = userRoom.id;
      const userId = userRoom.user.id;
      const userRoomInfo = await strapi
        .service("api::admin.admin")
        .getLatestUserRoomInfo(userRoom);

      const result = await strapi.entityService.update(
        "api::user-room.user-room",
        id,
        {
          data: userRoomInfo,
        }
      );

      // return userRoomInfo;
      console.log(`user ${userId}, user-room ${id} done`);

      return result;
    });

    const result = await Promise.all(promises);
    console.log("completed");
    return result;
    // });

    // return result;
  },

  "check-user-room": async (ctx) => {
    const userRooms: UserRoom[] = await strapi.entityService.findMany(
      "api::user-room.user-room",
      {
        populate: {
          room: {
            fields: ["id"],
            populate: {
              draws: {
                fields: ["id"],
              },
            },
          },
          user: {
            fields: ["id"],
          },
        },
      }
    );

    for (const userRoom of userRooms) {
      const id = userRoom.id;
      const userId = userRoom.user.id;
      // if (!(id === 166 && userId === 45)) {
      //   continue;
      // }

      const userRoomInfo = await strapi
        .service("api::admin.admin")
        .getLatestUserRoomInfo(userRoom);

      const { owned_items: prevOwnedItems } = userRoom;
      const { owned_items: newOwnedItems } = userRoomInfo;

      // console.log("prev", prevOwnedItems);
      // console.log("new", newOwnedItems);

      const changes = diff(prevOwnedItems, newOwnedItems);

      if (changes) {
        console.log(`user ${userId}, user-room ${id} has diffs`);
        console.log(changes);
      }
    }
    console.log("done");

    return 200;
  },

  "reset-owned-items": async (ctx) => {
    const userRooms: UserRoom[] = await strapi.entityService.findMany(
      "api::user-room.user-room",
      {
        populate: {
          room: {
            fields: ["id"],
            populate: {
              draws: {
                fields: ["id"],
              },
            },
          },
          user: {
            fields: ["id"],
          },
        },
      }
    );

    for (const userRoom of userRooms) {
      const id = userRoom.id;
      const userId = userRoom.user.id;

      const userRoomInfo = await strapi
        .service("api::admin.admin")
        .getLatestUserRoomInfo(userRoom);

      const { owned_items: prevOwnedItems } = userRoom;
      const { owned_items: newOwnedItems } = userRoomInfo;

      let changes = diff(prevOwnedItems, newOwnedItems);

      if (
        userRoom.completed !== userRoomInfo.completed ||
        userRoom.completion_rate !== userRoomInfo.completion_rate
      ) {
        changes = true;
      }

      if (changes) {
        const result = await strapi.entityService.update(
          "api::user-room.user-room",
          id,
          {
            data: userRoomInfo,
          }
        );

        console.log(changes);
        console.log(`user ${userId}, user-room ${id} done`);
      }
    }
    console.log("done");

    return 200;
  },

  "migration-room-to-userRoom": async (ctx) => {
    const users = await strapi.entityService.findMany(
      "plugin::users-permissions.user",
      {
        fields: ["id"],
        populate: {
          rooms: {
            populate: {
              items: {
                fields: ["id"],
              },
            },
          },
        },
      }
    );

    const promises = users.map(async (user) => {
      const userId = user.id;
      const rooms = user.rooms;

      const roomStatus = {};
      for (const room of rooms) {
        const userItems = await strapi.entityService.findMany(
          "api::inventory.inventory",
          {
            filters: {
              users_permissions_user: { id: userId },
              item: { room: { id: room.id } },
            },
            populate: {
              item: {
                fields: ["id"],
              },
            },
            sort: "updatedAt",
          }
        );

        const roomInfo = await strapi.entityService.findOne(
          "api::room.room",
          room.id,
          {
            populate: {
              items: {
                fields: ["id", "category", "rarity"],
              },
            },
          }
        );

        const roomItems = roomInfo.items
          .filter((item) => item.category === "decoration")
          .map((item) => item.id);

        const itemIds = new Map();
        const start_time = userItems[0].updatedAt;
        let completion_time = null;
        let completed = false;
        let duration = null;

        for (const userItem of userItems) {
          const itemId = userItem.item.id;
          if (!itemIds.has(itemId)) {
            itemIds.set(itemId, 0);
          }
          itemIds.set(itemId, itemIds.get(itemId) + 1);

          if (itemIds.size === roomItems.length) {
            completed = true;
            completion_time = userItem.updatedAt;
            duration =
              new Date(completion_time).getTime() -
              new Date(start_time).getTime();
          }
        }

        const completion_rate = Math.round(
          (itemIds.size / roomItems.length) * 100
        );

        const owned_items = Object.fromEntries(itemIds);

        const userRoomInfo = {
          start_time,
          completion_time,
          duration,
          completed,
          completion_rate,
          owned_items,
          room: {
            connect: [room.id],
          },
          user: {
            connect: [userId],
          },
          publishedAt: new Date(),
        };

        await strapi.entityService.create("api::user-room.user-room", {
          data: userRoomInfo,
        });
      }

      console.log(`user ${userId} done`);
    });

    await Promise.all(promises);

    console.log("completed");

    return 200;
  },

  "create-achievement-progress": async (ctx) => {
    const users = await strapi.entityService.findMany(
      "plugin::users-permissions.user",
      {
        fields: ["id"],
      }
    );

    const userIds = users.map((user) => user.id);
    // const userIds = [45, 86];

    await strapi
      .service("api::achievement-progress.achievement-progress")
      .createAchievementProgress(userIds);

    console.log("completed");

    return 200;
  },

  "fill-trade-history-date": async (ctx) => {
    const trades = await strapi.entityService.findMany("api::trade.trade", {
      fields: ["createdAt", "expires"],
      populate: {
        history: true,
      },
    });

    let counter = 0;
    const promises = trades.map(async (trade) => {
      const { id, createdAt, expires, history } = trade;

      let changed = false;
      const newHistory = history.map((h) => {
        if (h.date) {
          return h;
        }

        changed = true;

        let date = new Date(createdAt);

        if (h.status === "proposed") {
          // do nothing
        } else if (h.status === "canceled") {
          date.setHours(date.getHours() + 1);
        } else if (h.status === "counter_proposed" || h.status === "rejected") {
          date.setHours(date.getHours() + 3);
        } else if (h.status === "success" || h.status === "failed") {
          date.setHours(date.getHours() + 8);
        } else if (h.status === "expired") {
          date = new Date(expires);
        }

        return {
          ...h,
          date,
        };
      });

      if (changed) {
        console.log(`trade ${id} changed`);

        await strapi.entityService.update("api::trade.trade", id, {
          data: {
            history: newHistory,
          },
        });
      }

      counter++;
    });

    await Promise.all(promises);

    console.log("completed", counter);

    return trades;
  },
};
