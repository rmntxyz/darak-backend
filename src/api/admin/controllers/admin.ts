/**
 * A set of functions called "actions" for `admin`
 */

export default {
  "create-leaderboard": async (ctx) => {
    const { name } = ctx.params;
    const exist = await strapi
      .service("api::leaderboard.leaderboard")
      .createLeaderboard(name);
    return exist ? 200 : 400;
  },
  "reset-user-room": async (ctx) => {
    // strapi transaction
    const result = await strapi.db.transaction(async () => {
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
        const roomId = userRoom.room.id;
        const drawId = userRoom.room.draws[0].id;
        const userId = userRoom.user.id;

        // room info
        const roomInfo = await strapi.entityService.findOne(
          "api::room.room",
          roomId,
          {
            populate: {
              items: {
                fields: ["category", "rarity"],
              },
            },
          }
        );
        const roomItems = roomInfo.items
          .filter((item) => item.category === "decoration")
          .map((item) => item.id);

        // draw histories
        const drawHistories = await strapi.entityService.findMany(
          "api::draw-history.draw-history",
          {
            filters: {
              users_permissions_user: { id: userId },
              draw: { id: drawId },
            },
          }
        );
        const drawList = drawHistories.map((drawHistory) => ({
          type: "draw",
          id: drawHistory.id,
          date: new Date(drawHistory.createdAt).getTime(),
          incoming: drawHistory.draw_result,
          outgoing: [],
        }));

        // trades
        const trades = await strapi.entityService.findMany("api::trade.trade", {
          filters: {
            $or: [
              {
                proposer: { id: userId },
              },
              {
                partner: { id: userId },
              },
            ],
            status: "success",
          },
          populate: {
            proposer: {
              fields: ["id"],
            },
            partner: {
              fields: ["id"],
            },
            proposer_items: {
              fields: ["id"],
              populate: {
                item: {
                  fields: ["id"],
                },
              },
            },
            partner_items: {
              fields: ["id"],
              populate: {
                item: {
                  fields: ["id"],
                },
              },
            },
          },
        });

        const tradeList = trades
          .map((trade) => {
            const proposerItems = trade.proposer_items
              .map((x) => x.item.id)
              .filter((x) => roomItems.includes(x));
            const partnerItems = trade.partner_items
              .map((x) => x.item.id)
              .filter((x) => roomItems.includes(x));

            if (proposerItems.length === 0 && partnerItems.length === 0) {
              return null;
            }

            return {
              type: "trade",
              id: trade.id,
              date: new Date(trade.updatedAt).getTime(),
              incoming:
                trade.proposer.id === userId ? partnerItems : proposerItems,
              outgoing:
                trade.proposer.id === userId ? proposerItems : partnerItems,
            };
          })
          .filter(Boolean);

        const list = [...drawList, ...tradeList];
        list.sort((a, b) => a.date - b.date);

        // return list;

        const itemIds = new Map();
        const start_time = list[0].date;
        let completion_time = null;
        let completed = false;
        let duration = null;

        for (const each of list) {
          const { incoming, outgoing } = each;

          for (const itemId of incoming) {
            if (!itemIds.has(itemId)) {
              itemIds.set(itemId, 0);
            }
            itemIds.set(itemId, itemIds.get(itemId) + 1);
          }

          for (const itemId of outgoing) {
            if (itemIds.has(itemId)) {
              itemIds.set(itemId, Math.max(itemIds.get(itemId) - 1, 0));
            }
          }

          const collected = [...itemIds.entries()].filter(
            ([_, value]) => value > 0
          );

          if (collected.length === roomItems.length) {
            completed = true;
            completion_time = each.date;
            duration = completion_time - start_time;
          }
        }

        const collected = [...itemIds.entries()].filter(
          ([_, value]) => value > 0
        );
        const completion_rate = Math.round(
          (collected.length / roomItems.length) * 100
        );

        const owned_items = Object.fromEntries(itemIds);

        const userRoomInfo = {
          start_time: new Date(start_time).toISOString(),
          completion_time:
            completion_time !== null
              ? new Date(completion_time).toISOString()
              : null,
          duration,
          completed,
          completion_rate,
          owned_items,
          room: {
            connect: [roomId],
          },
          user: {
            connect: [userId],
          },
        };

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
    });

    return result;
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
};
