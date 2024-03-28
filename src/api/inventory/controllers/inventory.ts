/**
 * inventory controller
 */

import { factories } from "@strapi/strapi";
import { ErrorCode } from "../../../constant";

export default factories.createCoreController(
  "api::inventory.inventory",
  ({ strapi }) => ({
    // sell inventory item by inventory id
    sell: async (ctx) => {
      const userId = ctx.state.user?.id;

      if (!userId) {
        return ctx.unauthorized("user is not authenticated");
      }

      const userItems: number[] = JSON.parse(ctx.request.body.data);

      if (!Array.isArray(userItems) || userItems.length === 0) {
        return ctx.badRequest("invalid userItems");
      }

      // get inventories by inventory id
      const inventories: Inventory[] = await strapi.entityService.findMany(
        "api::inventory.inventory",
        {
          filters: {
            id: userItems,
          },
          fields: ["status"],
          populate: {
            users_permissions_user: {
              fields: ["id"],
            },
          },
        }
      );

      if (inventories.some((inventory) => inventory.status === "trading")) {
        const invalid = inventories.find(
          (inventory) => inventory.status === "trading"
        );
        return ctx.badRequest(
          `item(${invalid.id}) status is invalid: ${invalid.status}`,
          ErrorCode.INVALID_ITEMS_STATUS
        );
      }

      if (
        inventories.some(
          (inventory) => inventory.users_permissions_user?.id !== userId
        )
      ) {
        const notOwned = inventories.find(
          (inventory) => inventory.users_permissions_user?.id !== userId
        );
        return ctx.badRequest(
          `item(${notOwned.id}) not owned by user`,
          ErrorCode.ITEM_NOT_OWNED
        );
      }

      return await strapi
        .service("api::inventory.inventory")
        .sell(userId, userItems);
    },

    "sell-by-item-id": async (ctx) => {
      const userId = ctx.state.user?.id;

      if (!userId) {
        return ctx.unauthorized("user is not authenticated");
      }

      const data: { [itemId: number]: number } = JSON.parse(
        ctx.request.body.data
      );

      const userItems = [];
      for (const itemId in data) {
        if (typeof data[itemId] !== "number") {
          return ctx.badRequest("invalid data", ErrorCode.NON_NUMERIC_INPUT);
        }

        const quantity = data[itemId];

        // get inventories by user id and item id
        const inventories: Inventory[] = await strapi.entityService.findMany(
          "api::inventory.inventory",
          {
            filters: {
              users_permissions_user: { id: userId },
              item: { id: itemId },
            },
            fields: ["id", "serial_number", "status"],
            sort: {
              serial_number: "desc",
            },
          }
        );

        const filtered = inventories.filter(
          (inventory) => inventory.status !== "trading"
        );

        if (filtered.length < quantity) {
          return ctx.badRequest("invalid quantity", ErrorCode.NOT_ENOUGH_ITEMS);
        }

        const userItemIds = filtered.map((inventory) => inventory.id);
        userItems.push(...userItemIds.slice(0, quantity));
      }

      return await strapi
        .service("api::inventory.inventory")
        .sell(userId, userItems);
    },

    transfer: async (ctx) => {},
    "grant-item": async (ctx) => {},
  })
);
