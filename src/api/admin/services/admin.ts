/**
 * admin service
 */

export default ({ strapi }) => ({
  getLatestUserRoomInfo: async (userRoom: UserRoom) => {
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

    const itemIds = new Map();
    let completed = false;

    const userItems = await strapi.entityService.findMany(
      "api::inventory.inventory",
      {
        filters: {
          users_permissions_user: { id: userId },
          item: { room: { id: roomId } },
        },
        populate: {
          item: {
            fields: ["id"],
          },
        },
      }
    );

    for (const userItem of userItems) {
      const itemId = userItem.item.id;
      itemIds.set(itemId, (itemIds.get(itemId) || 0) + 1);
    }

    const collected = [...itemIds.entries()].filter(([_, value]) => value > 0);
    const completion_rate = Math.round(
      (collected.length / roomItems.length) * 100
    );

    if (collected.length === roomItems.length) {
      completed = true;
    }

    const owned_items = Object.fromEntries(itemIds);

    const userRoomInfo = {
      completed,
      completion_rate,
      owned_items,
    };

    return userRoomInfo;
  },

  getUnrewardedHistory: async () => {
    const histories = await strapi.entityService.findMany(
      "api::star-point-history.star-point-history",
      {
        populate: {
          star_point: {
            populate: {
              user: {
                fields: ["id"],
              },
            },
          },
        },
        filters: {
          detail: "achievement_reward",
        },
      }
    );

    // reduce by user
    const byId = histories.reduce((acc, cur) => {
      const userId = cur.star_point.user.id;
      if (!acc.has(userId)) {
        acc.set(userId, []);
      }
      // history.id의 연속성으로 구분하기
      const arr = acc.get(userId);

      if (arr.length === 0) {
        arr.push([cur]);
      } else {
        const last = arr[arr.length - 1];
        const lastId = last[last.length - 1].id;
        const curId = cur.id;
        if (curId - lastId === 1) {
          last.push(cur);
        } else {
          arr.push([cur]);
        }
      }

      return acc;
    }, new Map());

    const list = [...byId.keys()]
      .map((userId) => {
        const group = byId.get(userId);

        const result = [];

        if (group.length > 1) {
          console.log(userId, group);
        }

        for (const histories of group) {
          if (histories.length > 1) {
            result.push({ userId, histories });
          }
        }

        return result;
      })
      .flat();

    return list;
  },
});
