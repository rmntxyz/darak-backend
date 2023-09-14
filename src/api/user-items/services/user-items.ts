/**
 * user-items service
 */

export default ({ strapi }) => ({
  async findUserItemsByRoom(roomId: number, userId: number | undefined) {
    const filters: any = {
      users_permissions_user: { id: userId },
    };

    if (roomId) {
      filters.item = { room: { id: roomId } };
    }

    return await strapi.entityService.findMany("api::inventory.inventory", {
      fields: ["id", "serial_number"],
      filters,
      populate: {
        item: {
          fields: ["name", "desc", "rarity", "category", "attribute"],
          populate: {
            image: {
              fields: ["url"],
            },
            thumbnail: {
              fields: ["url"],
            },
            additional_images: {
              fields: ["url"],
            },
          },
        },
      },
    });
  },
});
