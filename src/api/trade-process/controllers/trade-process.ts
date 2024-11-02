/**
 * A set of functions called "actions" for `trade-process`
 */

import { ErrorCode, TRADE_ITEM_LIMIT } from "../../../constant";
import { applyLocalizations } from "../../../utils";
import {
  tradeDefaultOptions,
  tradeDetailOptions,
} from "../services/trade-process";

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

    const detail = await strapi
      .service("api::trade-process.trade-process")
      .findTradeDetail(roomId, userId, partnerId);

    const { locale } = ctx.query;

    if (detail) {
      const { me, partner, all_rooms } = detail;

      me.forEach((userItem) => {
        applyLocalizations(userItem.item, locale);
        if (userItem.item.room) {
          applyLocalizations(userItem.item.room, locale);
        }
      });

      partner.forEach((userItem) => {
        applyLocalizations(userItem.item, locale);
        if (userItem.item.room) {
          applyLocalizations(userItem.item.room, locale);
        }
      });

      all_rooms.forEach((room) => {
        applyLocalizations(room, locale);
      });
    }

    return detail;
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

    // item limit exceeded check (max 5 items)
    if (
      proposerItems.length > TRADE_ITEM_LIMIT ||
      partnerItems.length > TRADE_ITEM_LIMIT
    ) {
      return ctx.badRequest(
        `${
          proposerItems.length > TRADE_ITEM_LIMIT ? "proposer" : "partner"
        } item limit exceeded`,
        ErrorCode.TRADE_ITEM_LIMIT_EXCEEDED
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

    // check trading credit
    const tradingCredit = await strapi
      .service("api::trading-credit.trading-credit")
      .getTradingCredit(userId);

    if (tradingCredit.current <= 0) {
      return ctx.badRequest(
        "not enough trading credits",
        ErrorCode.NOT_ENOUGH_TRADING_CREDITS
      );
    }

    const trade: Trade = (await strapi.db.transaction(async ({ trx }) => {
      try {
        await strapi
          .service("api::trading-credit.trading-credit")
          .updateTradingCredit(userId, -1, "trade");

        return await strapi
          .service("api::trade-process.trade-process")
          .proposeTrade(userId, partnerId, proposerItems, partnerItems);
      } catch (error) {
        trx.rollback();
        throw error;
      }
    })) as Trade;

    // send notification to partner
    try {
      const result = await strapi
        .service("api::trade-process.trade-process")
        .sendTradeNotification(trade.id, userId, partnerId, "trade_proposed");
      console.log(result);
    } catch (error) {
      console.error(error);
    }

    return trade;
  },

  // deprecated
  // 처음부터 다시 구현해야 함.
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

    // item limit exceeded check (max 5 items)
    if (
      proposerItems.length > TRADE_ITEM_LIMIT ||
      partnerItems.length > TRADE_ITEM_LIMIT
    ) {
      return ctx.badRequest(
        `${
          proposerItems.length > TRADE_ITEM_LIMIT ? "proposer" : "partner"
        } item limit exceeded`,
        ErrorCode.TRADE_ITEM_LIMIT_EXCEEDED
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

    const trade = (await strapi.entityService.findOne(
      "api::trade.trade",
      tradeId,
      tradeDetailOptions
    )) as Trade;

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

    const status = await strapi.db.transaction(async ({ trx }) => {
      try {
        await strapi
          .service("api::trade-process.trade-process")
          .acceptTrade(trade);
        return await strapi
          .service("api::trade-process.trade-process")
          .changeStatus(trade, "success", userId);
      } catch (error) {
        trx.rollback();
        throw error;
      }
    });

    // send notification to proposer
    try {
      const result = await strapi
        .service("api::trade-process.trade-process")
        .sendTradeNotification(
          trade.id,
          userId,
          trade.proposer.id,
          "trade_accepted"
        );
      console.log(result);
    } catch (error) {
      console.error(error);
    }

    return status;
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

    const trade = (await strapi.entityService.findOne(
      "api::trade.trade",
      tradeId,
      tradeDefaultOptions
    )) as Trade;

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

    const isUserProposer = trade.proposer.id === userId;

    const status = await strapi
      .service("api::trade-process.trade-process")
      .changeStatus(trade, isUserProposer ? "canceled" : "rejected", userId);

    if (trade.status === "proposed") {
      // send notification to proposer or partner
      try {
        const result = await strapi
          .service("api::trade-process.trade-process")
          .sendTradeNotification(
            trade.id,
            userId,
            isUserProposer ? trade.partner.id : trade.proposer.id,
            isUserProposer ? "trade_canceled" : "trade_rejected"
          );
        console.log(result);
      } catch (error) {
        console.error(error);
      }
    }

    return status;
    // else if (trade.status === "counter_proposed") {
    //   return await strapi
    //     .service("api::trade-process.trade-process")
    //     .changeStatus(
    //       trade,
    //       trade.proposer.id === userId ? "rejected" : "cancelec",
    //       userId
    //     );
    // }
  },

  "get-trade-list": async (ctx) => {
    const userId = ctx.state.user?.id;

    if (!userId) {
      return ctx.unauthorized("user is not authenticated");
    }

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

    for (const trade of trades as Trade[]) {
      if (
        (trade.status === "proposed" || trade.status === "counter_proposed") &&
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

    if (trades.length > 0) {
      // localizations
      const { locale } = ctx.query;

      for (const trade of trades as Trade[]) {
        const { proposer_items, partner_items } = trade;

        proposer_items.forEach((userItem) => {
          applyLocalizations(userItem.item, locale);
          if (userItem.item.room) {
            applyLocalizations(userItem.item.room, locale);
          }
        });

        partner_items.forEach((userItem) => {
          applyLocalizations(userItem.item, locale);
          if (userItem.item.room) {
            applyLocalizations(userItem.item.room, locale);
          }
        });
      }
    }

    return trades;
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

    const trade = await strapi.entityService.findOne(
      "api::trade.trade",
      tradeId,
      tradeDetailOptions
    );

    if (trade) {
      // localizations
      const { locale } = ctx.query;

      const { proposer_items, partner_items } = trade;

      proposer_items.forEach((userItem) => {
        applyLocalizations(userItem.item, locale);
        if (userItem.item.room) {
          applyLocalizations(userItem.item.room, locale);
        }
      });

      partner_items.forEach((userItem) => {
        applyLocalizations(userItem.item, locale);
        if (userItem.item.room) {
          applyLocalizations(userItem.item.room, locale);
        }
      });
    }

    return trade;
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

      for (const trade of trades as Trade[]) {
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
