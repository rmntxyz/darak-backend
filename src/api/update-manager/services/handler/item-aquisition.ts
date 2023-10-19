export default {
  update: async (userItem: Inventory) => {
    const { serial_number, item, users_permissions_user: user } = userItem;

    // if (serial_number === 1) {
    //   await strapi.entityService.create("api::activity.activity", {
    //     data: {
    //       category: "platform",
    //       type: "item_#1",
    //       user: { id: user.id },
    //       item: { id: item.id },
    //       detail: {},
    //       publishedAt: new Date(),
    //     },
    //   });
    // }

    if (item.rarity === "unique") {
      await strapi.entityService.create("api::activity.activity", {
        data: {
          category: "platform",
          type: "unique_item",
          user: { id: user.id },
          item: { id: item.id },
          detail: { serial_number },
          publishedAt: new Date(),
        },
      });
    }

    return;
  },
};
