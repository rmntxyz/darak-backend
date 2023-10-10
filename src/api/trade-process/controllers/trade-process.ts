/**
 * A set of functions called "actions" for `trade-process`
 */

import { ErrorCode } from "../../../constant";
import {
  tradeDefaultOptions,
  tradeDetailOptions,
} from "../services/trade-process";

const DAY_LIMIT = 3;

export default {
  "get-item-owners": async (ctx) => {
    const userId = ctx.state.user?.id;

    if (!userId) {
      return ctx.unauthorized("user is not authenticated");
    }

    const { itemId } = ctx.params;

    if (!itemId) {
      return ctx.badRequest("itemId is requrired");
    }

    const { page } = ctx.query;

    return await strapi
      .service("api::trade-process.trade-process")
      .findItemOwners(itemId, page);
  },

  "get-non-item-owners": async (ctx) => {
    const userId = ctx.state.user?.id;

    if (!userId) {
      return ctx.unauthorized("user is not authenticated");
    }

    const { itemId } = ctx.params;

    if (!itemId) {
      return ctx.badRequest("itemId is requrired");
    }

    const { page } = ctx.query;

    return await strapi
      .service("api::trade-process.trade-process")
      .findNonItemOwners(itemId, page);
  },

  "get-trade-detail": async (ctx) => {
    // me and partner's inventory info

    const userId = ctx.state.user?.id;

    if (!userId) {
      return ctx.unauthorized("user is not authenticated");
    }

    const { roomId, partnerId } = ctx.params;

    if (!roomId || !partnerId) {
      return ctx.badRequest("roomId and partnerId parameters are required");
    }

    return await strapi
      .service("api::trade-process.trade-process")
      .findTradeDetail(roomId, userId, partnerId);
  },

  "propose-trade": async (ctx) => {
    const userId = ctx.state.user?.id;

    if (!userId) {
      return ctx.unauthorized("user is not authenticated");
    }

    let { partnerId, proposerItems, partnerItems } = JSON.parse(
      ctx.request.body.data
    );

    if (
      !partnerId ||
      !(Array.isArray(proposerItems) && proposerItems.length > 0) ||
      !(Array.isArray(partnerItems) && partnerItems.length > 0)
    ) {
      return ctx.badRequest(
        "Invalid Request Parameters",
        ErrorCode.INVALID_TRADE_ITEMS
      );
    }

    return await strapi.db.transaction(async () => {
      const count = await strapi
        .service("api::trade-process.trade-process")
        .getDailyTradeCount(userId);

      if (count >= DAY_LIMIT) {
        return ctx.badRequest(
          "daily trade limit exceeded",
          ErrorCode.DAILY_TRADE_LIMIT_EXCEEDED
        );
      }

      // check if user has enough items in inventory to trade
      const proposerItemsInInventory = await strapi
        .service("api::trade-process.trade-process")
        .checkUserItems(proposerItems, userId);

      if (!proposerItemsInInventory) {
        return ctx.badRequest(
          "your items are not in inventory",
          ErrorCode.PROPOSER_ITEMS_NOT_FOUND
        );
      }

      const partnerItemsInInventory = await strapi
        .service("api::trade-process.trade-process")
        .checkUserItems(partnerItems, partnerId);

      if (!partnerItemsInInventory) {
        return ctx.badRequest(
          "partner's items are not in inventory",
          ErrorCode.PARTNER_ITEMS_NOT_FOUND
        );
      }

      return await strapi
        .service("api::trade-process.trade-process")
        .proposeTrade(userId, partnerId, proposerItems, partnerItems);
    });
  },

  "counter-propose-trade": async (ctx) => {
    const userId = ctx.state.user?.id;

    if (!userId) {
      return ctx.unauthorized("user is not authenticated");
    }

    const { tradeId } = ctx.params;

    if (!tradeId) {
      return ctx.badRequest("tradeId is requrired");
    }

    let { partnerItems, proposerItems } = JSON.parse(ctx.request.body.data);

    if (
      !(Array.isArray(proposerItems) && proposerItems.length > 0) ||
      !(Array.isArray(partnerItems) && partnerItems.length > 0)
    ) {
      return ctx.badRequest(
        "Invalid Request Parameters",
        ErrorCode.INVALID_TRADE_ITEMS
      );
    }

    return await strapi.db.transaction(async () => {
      // get trade
      const trade = await strapi.entityService.findOne(
        "api::trade.trade",
        tradeId,
        tradeDefaultOptions
      );

      if (!trade) {
        return ctx.badRequest("trade not found");
      }

      if (userId !== trade.partner.id) {
        return ctx.badRequest(
          "only partner can counter propose",
          ErrorCode.ONLY_PARTNER_CAN_COUNTER_PROPOSE
        );
      }

      if (trade.status !== "proposed") {
        return ctx.badRequest(
          "trade is not in proposed status",
          ErrorCode.INVALID_TRADE_STATUS
        );
      }

      if (new Date(trade.expires).getTime() < Date.now()) {
        await strapi
          .service("api::trade-process.trade-process")
          .changeStatus(trade, "expired", userId);

        return ctx.badRequest("trade is expired", ErrorCode.TRADE_EXPIRED);
      }

      // check if user has enough items in inventory to trade
      const proposerItemsInInventory = await strapi
        .service("api::trade-process.trade-process")
        .checkUserItems(proposerItems, trade.proposer.id);

      if (!proposerItemsInInventory) {
        return ctx.badRequest(
          "proposer's items are not in inventory",
          ErrorCode.PROPOSER_ITEMS_NOT_FOUND
        );
      }

      const partnerItemsInInventory = await strapi
        .service("api::trade-process.trade-process")
        .checkUserItems(partnerItems, userId);

      if (!partnerItemsInInventory) {
        return ctx.badRequest(
          "partner's items are not in inventory",
          ErrorCode.PARTNER_ITEMS_NOT_FOUND
        );
      }

      return await strapi
        .service("api::trade-process.trade-process")
        .counterProposeTrade(trade, proposerItems, partnerItems);
    });
  },

  "accept-trade": async (ctx) => {
    const userId = ctx.state.user?.id;

    if (!userId) {
      return ctx.unauthorized("user is not authenticated");
    }

    const { tradeId } = ctx.params;

    if (!tradeId) {
      return ctx.badRequest("tradeId parameter is required");
    }

    return await strapi.db.transaction(async () => {
      const trade = await strapi.entityService.findOne(
        "api::trade.trade",
        tradeId,
        tradeDefaultOptions
      );

      if (!trade) {
        return ctx.badRequest("trade not found");
      }

      if (trade.proposer.id !== userId && trade.partner.id !== userId) {
        return ctx.badRequest(
          "you are not participant",
          ErrorCode.NOT_PARTICIPANT
        );
      }

      if (trade.status !== "proposed" && trade.status !== "counter_proposed") {
        return ctx.badRequest(
          "trade is not in proposed or counter proposed status",
          ErrorCode.INVALID_TRADE_STATUS
        );
      }

      if (trade.status === "proposed" && trade.proposer.id === userId) {
        return ctx.badRequest(
          "only partner can accept proposal",
          ErrorCode.ONLY_PARTNER_CAN_ACCEPT_PROPOSAL
        );
      }

      if (trade.status === "counter_proposed" && trade.partner.id === userId) {
        return ctx.badRequest(
          "only proposer can accept counter-proposal",
          ErrorCode.ONLY_PROPOSER_CAN_ACCEPT_COUNTER_PROPOSAL
        );
      }

      if (new Date(trade.expires).getTime() < Date.now()) {
        await strapi
          .service("api::trade-process.trade-process")
          .changeStatus(trade, "expired", userId);

        return ctx.badRequest("trade is expired", ErrorCode.TRADE_EXPIRED);
      }

      // check if user has enough items in inventory to trade
      const proposerItemsInInventory = await strapi
        .service("api::trade-process.trade-process")
        .checkUserItems(
          trade.proposer_items.map((item) => item.id),
          trade.proposer.id
        );

      if (!proposerItemsInInventory) {
        await strapi
          .service("api::trade-process.trade-process")
          .changeStatus(trade, "failed");

        return ctx.badRequest(
          "proposer items are not in inventory",
          ErrorCode.PROPOSER_ITEMS_NOT_FOUND
        );
      }

      const partnerItemsInInventory = await strapi
        .service("api::trade-process.trade-process")
        .checkUserItems(
          trade.partner_items.map((item) => item.id),
          trade.partner.id
        );

      if (!partnerItemsInInventory) {
        await strapi
          .service("api::trade-process.trade-process")
          .changeStatus(trade, "failed");

        return ctx.badRequest(
          "partner items are not in inventory",
          ErrorCode.PARTNER_ITEMS_NOT_FOUND
        );
      }

      await strapi
        .service("api::trade-process.trade-process")
        .acceptTrade(trade);

      return await strapi
        .service("api::trade-process.trade-process")
        .changeStatus(trade, "success", userId);
    });
  },

  "cancel-trade": async (ctx) => {
    const userId = ctx.state.user?.id;

    if (!userId) {
      return ctx.unauthorized("user is not authenticated");
    }

    const { tradeId } = ctx.params;

    if (!tradeId) {
      return ctx.badRequest("tradeId parameter is required");
    }

    return await strapi.db.transaction(async () => {
      const trade = await strapi.entityService.findOne(
        "api::trade.trade",
        tradeId,
        tradeDefaultOptions
      );

      if (!trade) {
        return ctx.badRequest("trade not found");
      }

      if (trade.proposer.id !== userId && trade.partner.id !== userId) {
        return ctx.badRequest(
          "you are not participant",
          ErrorCode.NOT_PARTICIPANT
        );
      }

      if (trade.status !== "proposed" && trade.status !== "counter_proposed") {
        return ctx.badRequest(
          "trade is not in proposed or counter proposed status",
          ErrorCode.INVALID_TRADE_STATUS
        );
      }

      if (new Date(trade.expires).getTime() < Date.now()) {
        await strapi
          .service("api::trade-process.trade-process")
          .changeStatus(trade, "expired", userId);

        return ctx.badRequest("trade is expired", ErrorCode.TRADE_EXPIRED);
      }

      if (trade.status === "proposed") {
        return await strapi
          .service("api::trade-process.trade-process")
          .changeStatus(
            trade,
            trade.proposer.id === userId ? "canceled" : "rejected",
            userId
          );
      } else if (trade.status === "counter_proposed") {
        return await strapi
          .service("api::trade-process.trade-process")
          .changeStatus(
            trade,
            trade.proposer.id === userId ? "rejected" : "cancelec",
            userId
          );
      }
    });
  },

  "get-trade-list": async (ctx) => {
    const userId = ctx.state.user?.id;

    if (!userId) {
      return ctx.unauthorized("user is not authenticated");
    }

    return await strapi.db.transaction(async () => {
      // filter by userId
      const trades = await strapi.entityService.findMany("api::trade.trade", {
        ...tradeDetailOptions,
        sort: { updatedAt: "desc" },
        filters: {
          $or: [{ proposer: { id: userId } }, { partner: { id: userId } }],
        },
      });

      // check expires
      const now = Date.now();
      const promises = [];

      for (const trade of trades) {
        if (
          (trade.status === "proposed" ||
            trade.status === "counter_proposed") &&
          new Date(trade.expires).getTime() < now
        ) {
          const promise = strapi
            .service("api::trade-process.trade-process")
            .changeStatus(trade, "expired", userId)
            .then((result) => {
              Object.assign(trade, result);
            });

          promises.push(promise);
        }
      }

      await Promise.all(promises);

      return trades;
    });
  },

  "get-trade": async (ctx) => {
    const userId = ctx.state.user?.id;

    if (!userId) {
      return ctx.unauthorized("user is not authenticated");
    }

    const { tradeId } = ctx.params;

    if (!tradeId) {
      return ctx.badRequest("tradeId parameter is required");
    }

    return await strapi.entityService.findOne(
      "api::trade.trade",
      tradeId,
      tradeDetailOptions
    );
  },

  "read-trade-status": async (ctx) => {
    const userId = ctx.state.user?.id;

    if (!userId) {
      return ctx.unauthorized("user is not authenticated");
    }

    const { tradeId } = ctx.params;

    if (tradeId) {
      // update trade by tradeId
      const trade = await strapi.entityService.findOne(
        "api::trade.trade",
        tradeId,
        tradeDefaultOptions
      );

      if (!trade) {
        return ctx.badRequest("trade not found");
      }

      if (trade.proposer.id === userId) {
        if (!trade.proposer_read) {
          return await strapi.entityService.update(
            "api::trade.trade",
            tradeId,
            {
              ...tradeDefaultOptions,
              data: {
                proposer_read: true,
              },
            }
          );
        }
      } else if (trade.partner.id === userId) {
        if (!trade.partner_read) {
          return await strapi.entityService.update(
            "api::trade.trade",
            tradeId,
            {
              ...tradeDefaultOptions,
              data: {
                partner_read: true,
              },
            }
          );
        }
      } else {
        return null;
      }
    } else {
      // update all trade status
      const trades = await strapi.entityService.findMany("api::trade.trade", {
        ...tradeDefaultOptions,
        sort: { updatedAt: "asc" },
        filters: {
          $or: [{ proposer: { id: userId } }, { partner: { id: userId } }],
        },
      });

      const list = [];

      for (const trade of trades) {
        if (trade.proposer.id === userId) {
          if (!trade.proposer_read) {
            const updated = await strapi.entityService.update(
              "api::trade.trade",
              trade.id,
              {
                ...tradeDefaultOptions,
                data: {
                  proposer_read: true,
                },
              }
            );

            list.push(updated);
          }
        } else if (trade.partner.id === userId) {
          if (!trade.partner_read) {
            const updated = await strapi.entityService.update(
              "api::trade.trade",
              trade.id,
              {
                ...tradeDefaultOptions,
                data: {
                  partner_read: true,
                },
              }
            );

            list.push(updated);
          }
        }
      }

      return list;
    }
  },
};
