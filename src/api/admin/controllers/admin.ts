/**
 * A set of functions called "actions" for `admin`
 */

export default {
  "migration-room-to-userRoom": async (ctx) => {
    // const userId = 55;
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

        // console.log(userItems);
        const rarity = roomInfo.items
          .filter((item) => item.category === "decoration")
          .reduce((acc, item) => {
            if (!acc[item.rarity]) {
              acc[item.rarity] = [];
            }
            acc[item.rarity].push(item.id);
            return acc;
          }, {});

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
            break;
          }
        }

        const completion_rate = Math.round(
          (itemIds.size / roomItems.length) * 100
        );

        const owned_items = Object.fromEntries(itemIds);

        const item_details = {
          total: roomItems.length,
          rarity,
        };

        const userRoomInfo = {
          start_time,
          completion_time,
          duration,
          completed,
          completion_rate,
          item_details,
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
