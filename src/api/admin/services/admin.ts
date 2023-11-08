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

    const owned_items = Object.fromEntries(itemIds);

    const userRoomInfo = {
      completed,
      completion_rate,
      owned_items,
    };

    return userRoomInfo;
  },
});
