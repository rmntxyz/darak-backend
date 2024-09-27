/**
 * A set of functions called "actions" for `admin`
 */
import { diff } from "deep-diff";
import Hashids from "hashids";

export default {
  test: async (ctx) => {
    // const inactiveUsers = await strapi.entityService.findMany(
    //   "plugin::users-permissions.user",
    //   {
    //     filters: {
    //       deactivated: true,
    //       blocked: false,
    //       deactivated_at: {
    //         $lt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    //       },
    //     },
    //     fields: ["email", "deactivated_at", "provider"],
    //   }
    // );
    // if (inactiveUsers.length === 0) {
    //   return 200;
    // }
    // const hashids = new Hashids("", 3, process.env.NONCE_FOR_ENCRYPTION);
    // const promises = inactiveUsers.map((user) => {
    //   const [identifier, domain] = user.email.split("@");
    //   const codeFromEmail = identifier.split("").map((c) => c.charCodeAt());
    //   const encodedEmail = hashids.encode(codeFromEmail) + "@ROOMIX.INACTIVE";
    //   // const encoded = hashids.encode(codeFromEmail);
    //   // const decodedCodes = hashids.decode(encoded) as number[];
    //   // const decoded = String.fromCharCode(...decodedCodes);
    //   // console.log("decode", decoded);
    //   return strapi.entityService.update(
    //     "plugin::users-permissions.user",
    //     user.id,
    //     {
    //       data: {
    //         blocked: true,
    //         username: "ROOMIX.INACTIVE",
    //         email: encodedEmail,
    //         device_token: "",
    //       },
    //     }
    //   );
    // });
    // await Promise.all(promises);
    // return inactiveUsers;
  },
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
    const userRooms = await strapi.entityService.findMany(
      "api::user-room.user-room",
      {
        fields: [
          "id",
          "start_time",
          "completed",
          "completion_rate",
          "owned_items",
        ],
        populate: {
          room: {
            fields: ["id"],
            populate: {
              items: {
                fields: ["id", "category", "rarity"],
              },
              // draws: {
              //   fields: ["id"],
              // },
            },
          },
          user: {
            fields: ["id"],
          },
        },
      }
    );

    const brokens = [];

    const COUNTING_RARITIES = ["common", "uncommon", "rare", "unique"];

    const getBrokens = userRooms.map(async (userRoom) => {
      const { id, user, room, owned_items } = userRoom;
      const userId = user.id;
      const roomId = room.id;

      const inventories = await strapi.entityService.findMany(
        "api::inventory.inventory",
        {
          filters: {
            users_permissions_user: { id: userId },
            item: { room: { id: roomId } },
          },
          fields: ["id", "updatedAt"],
          populate: {
            item: {
              fields: ["id"],
            },
          },
          sort: "updatedAt",
        }
      );

      const inventory_items = inventories.reduce((acc, inventory) => {
        acc[inventory.item.id] = (acc[inventory.item.id] || 0) + 1;
        return acc;
      }, {});

      const differences = diff(owned_items, inventory_items);

      if (differences) {
        const list = new Set();
        for (const item of room.items) {
          if (
            item.category !== "built-in" &&
            COUNTING_RARITIES.includes(item.rarity)
          ) {
            list.add(item.id);
          }
        }

        brokens.push({
          userRoom,
          ledger: list,
          ordered_inventories: inventories,
          owned_items,
          inventory_items,
        });
      }
    });

    await Promise.all(getBrokens);

    const fixes = brokens.map(async (broken) => {
      const { ledger, ordered_inventories, inventory_items, userRoom } = broken;
      const { start_time } = userRoom;
      const data: any = {
        owned_items: inventory_items,
        completed: false,
        completion_time: null,
        completion_rate: 0,
        duration: null,
      };

      const total = ledger.size;

      for (const userItem of ordered_inventories) {
        if (ledger.has(userItem.item.id)) {
          ledger.delete(userItem.item.id);
        }

        if (ledger.size === 0) {
          data.completion_time = userItem.updatedAt;
          data.duration =
            new Date(userItem.updatedAt).getTime() -
            new Date(start_time).getTime();
          data.completed = true;
          break;
        }
      }

      data.completion_rate = Math.round(((total - ledger.size) / total) * 100);

      // return data;

      return await strapi.entityService.update(
        "api::user-room.user-room",
        userRoom.id,
        {
          data,
        }
      );
    });

    console.log("completed");
    return await Promise.all(fixes);
  },

  "check-user-room": async (ctx) => {
    const userRooms = await strapi.entityService.findMany(
      "api::user-room.user-room",
      {
        fields: [
          "id",
          "start_time",
          "completed",
          "completion_rate",
          "owned_items",
        ],
        populate: {
          room: {
            fields: ["id"],
            populate: {
              items: {
                fields: ["id", "category", "rarity"],
              },
              // draws: {
              //   fields: ["id"],
              // },
            },
          },
          user: {
            fields: ["id"],
          },
        },
      }
    );

    const brokens = [];

    const COUNTING_RARITIES = ["common", "uncommon", "rare", "unique"];

    const getBrokens = userRooms.map(async (userRoom) => {
      const { id, user, room, owned_items } = userRoom;
      const userId = user.id;
      const roomId = room.id;

      const inventories = await strapi.entityService.findMany(
        "api::inventory.inventory",
        {
          filters: {
            users_permissions_user: { id: userId },
            item: { room: { id: roomId } },
          },
          fields: ["id", "updatedAt"],
          populate: {
            item: {
              fields: ["id"],
            },
          },
          sort: "updatedAt",
        }
      );

      const inventory_items = inventories.reduce((acc, inventory) => {
        acc[inventory.item.id] = (acc[inventory.item.id] || 0) + 1;
        return acc;
      }, {});

      const differences = diff(owned_items, inventory_items);

      if (differences) {
        const list = new Set();
        for (const item of room.items) {
          if (
            item.category !== "built-in" &&
            COUNTING_RARITIES.includes(item.rarity)
          ) {
            list.add(item.id);
          }
        }

        brokens.push({
          userRoom,
          ledger: list,
          ordered_inventories: inventories,
          owned_items,
          inventory_items,
        });
      }
    });

    await Promise.all(getBrokens);

    console.log("completed");

    return brokens;
  },

  "reset-owned-items": async (ctx) => {
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

    for (const userRoom of userRooms as UserRoom[]) {
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

        for (const userItem of userItems as Inventory[]) {
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

  "send-unpaid-star-points": async (ctx) => {
    const list: { userId: number; histories: StarPointHistory[] }[] =
      await strapi.service("api::admin.admin").getUnrewardedHistory();

    for (const { userId, histories } of list) {
      const last = histories[histories.length - 1];
      let amount = last.remaining - last.change;

      const restHistories = await strapi.entityService.findMany(
        "api::star-point-history.star-point-history",
        {
          filters: {
            star_point: { user: { id: userId } },
            id: { $gt: last.id },
          },
        }
      );

      const exclusionIndex = histories.length - 1;
      const allHistories = [...histories, ...(restHistories as any[])];

      for (let i = 0; i < allHistories.length; i++) {
        const history = allHistories[i];
        const change = history.change;

        if (i !== exclusionIndex) {
          amount += change;
        }

        await strapi.entityService.update(
          "api::star-point-history.star-point-history",
          history.id,
          {
            data: {
              remaining: amount,
            },
          }
        );
      }

      await strapi.entityService.update(
        "api::star-point.star-point",
        last.star_point.id,
        {
          data: {
            amount,
          },
        }
      );

      console.log({ userId, amount });
    }

    console.log("completed");

    return 200;
  },
};
