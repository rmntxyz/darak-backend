/**
 * user-items service
 */

export default ({ strapi }) => ({
  async findUserItemsByRoom(userId: number, roomId: number | undefined) {
    const filters: any = {
      users_permissions_user: { id: userId },
    };

    if (roomId) {
      filters.item = { room: { id: roomId } };
    }

    return await strapi.entityService.findMany("api::inventory.inventory", {
      fields: ["id", "serial_number", "status"],
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
            localizations: {
              fields: ["name", "desc", "locale"],
            },
          },
        },
      },
    });
  },
});
