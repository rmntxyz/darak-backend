/**
 * A set of functions called "actions" for `test`
 */

export default {
  test1: async (ctx, next) => {
    const { itemId } = ctx.params;

    const item = await strapi.entityService.findOne("api::item.item", itemId);
    const { current_serial_number } = item;

    // wait 5 seconds
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const updatedItem = await strapi.entityService.update(
      "api::item.item",
      itemId,
      {
        fields: ["current_serial_number"],
        data: {
          current_serial_number: current_serial_number + 1,
        },
      }
    );

    return updatedItem;
  },

  test2: async (ctx, next) => {
    const { itemId } = ctx.params;

    return await strapi.db.transaction(async ({ trx }) => {
      const [{ current_serial_number }] = await strapi.db
        .connection("items")
        .transacting(trx)
        .forUpdate()
        .where("id", itemId)
        .select("current_serial_number");

      // wait 5 seconds
      await new Promise((resolve) => setTimeout(resolve, 5000));

      return await strapi.entityService.update("api::item.item", itemId, {
        fields: ["current_serial_number"],
        data: {
          current_serial_number: current_serial_number + 1,
        },
      });
    });
  },
};
