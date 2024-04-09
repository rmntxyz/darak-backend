/**
 * trading-credit service
 */

import { factories } from "@strapi/strapi";
import { ErrorCode } from "../../../constant";

export default factories.createCoreService(
  "api::trading-credit.trading-credit",
  ({ strapi }) => ({
    async getTradingCredit(userId: number) {
      let tradingCredit = (
        await strapi.entityService.findMany(
          "api::trading-credit.trading-credit",
          {
            filters: {
              user: { id: userId },
            },
            fields: ["amount"],
          }
        )
      )[0];

      if (!tradingCredit) {
        tradingCredit = await strapi.entityService.create(
          "api::trading-credit.trading-credit",
          {
            data: {
              amount: 0,
              max: 3,
              user: { id: userId },
              publishedAt: new Date(),
            },
            fields: ["amount"],
          }
        );
      }

      return tradingCredit;
    },

    async updateTradingCredit(
      userId: number,
      change: number,
      detail: TradingCreditChangeDetail
    ) {
      return await strapi.db.transaction(async ({ trx }) => {
        const [tradingCredit] = await strapi.db
          .connection("trading_credits")
          .transacting(trx)
          .forUpdate()
          .join(
            "trading_credits_user_links",
            "trading_credits.id",
            "trading_credits_user_links.trading_credit_id"
          )
          .where("trading_credits_user_links.user_id", userId)
          .select("trading_credits.*");

        if (tradingCredit.amount + change < 0) {
          throw ErrorCode.NOT_ENOUGH_TRADING_CREDITS;
        }

        const updated = await strapi.entityService.update(
          "api::trading-credit.trading-credit",
          tradingCredit.id,
          {
            data: {
              amount: Math.min(
                tradingCredit.amount + change,
                tradingCredit.max
              ),
            },
            fields: ["amount", "max"],
          }
        );

        await strapi.entityService.create(
          "api::trading-credit-history.trading-credit-history",
          {
            data: {
              change,
              detail,
              result: updated.amount,
              date: new Date(),
              trading_credit: { id: updated.id },
              publishedAt: new Date(),
            },
          }
        );

        return updated;
      });
    },
  })
);
