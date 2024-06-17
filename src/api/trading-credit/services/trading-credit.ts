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
          }
        )
      )[0];

      if (tradingCredit) {
        tradingCredit = recalculate(tradingCredit);
      } else {
        tradingCredit = await strapi.entityService.create(
          "api::trading-credit.trading-credit",
          {
            data: {
              current: 2,
              max: 2,
              last_charged_at: (Date.now() / 1000) | 0,
              charge_interval: 3600 * 12,
              charge_amount: 1,
              user: { id: userId },
              publishedAt: new Date(),
            },
          }
        );
      }

      return tradingCredit;
    },

    async refresh(tradingCredit: TradingCredit) {
      const refreshed = recalculate(tradingCredit);

      if (refreshed.current !== tradingCredit.current) {
        await strapi.entityService.update(
          "api::trading-credit.trading-credit",
          tradingCredit.id,
          {
            data: {
              current: refreshed.current,
              last_charged_at: refreshed.last_charged_at,
            },
          }
        );
      }

      return refreshed;
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

        if (tradingCredit.current + change < 0) {
          throw ErrorCode.NOT_ENOUGH_TRADING_CREDITS;
        }

        const updated = await strapi.entityService.update(
          "api::trading-credit.trading-credit",
          tradingCredit.id,
          {
            data: {
              current: Math.min(
                tradingCredit.current + change,
                tradingCredit.max
              ),
            },
          }
        );

        await strapi.entityService.create(
          "api::trading-credit-history.trading-credit-history",
          {
            data: {
              change,
              detail,
              result: updated.current,
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

function recalculate(tradingCredit: TradingCredit) {
  let { current, max, last_charged_at, charge_interval, charge_amount } =
    tradingCredit;

  if (current < max) {
    // 현재 시간
    const now = (Date.now() / 1000) | 0;
    // 충전 가능한 갯수
    const limit_charges = max - current;

    const diff_time = now - last_charged_at;
    const multiple = Math.floor(diff_time / charge_interval);
    const charges = Math.min(multiple * charge_amount, limit_charges);

    if (multiple > 0) {
      current += charges;
      last_charged_at += multiple * charge_interval;

      tradingCredit = { ...tradingCredit, current, last_charged_at };
    }
  }

  return tradingCredit;
}
