/**
 * inventory controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::inventory.inventory",
  ({ strapi }) => ({
    // sell inventory item by inventory id
    sell: async (ctx) => {
      const userId = ctx.state.user?.id;

      if (!userId) {
        return ctx.unauthorized("user is not authenticated");
      }

      const { userItems }: { userItems: number[] } = JSON.parse(
        ctx.request.body.data
      );

      if (!Array.isArray(userItems) || userItems.length === 0) {
        return ctx.badRequest("invalid userItems");
      }

      return await strapi
        .service("api::inventory.inventory")
        .sell(userId, userItems);
    },
    "sell-by-item-id": async (ctx) => {},
    transfer: async (ctx) => {},
    "grant-item": async (ctx) => {},
  })
);
