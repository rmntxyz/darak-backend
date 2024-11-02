/**
 * A set of functions called "actions" for `random-capsule`
 */

import { ErrorCode, AVAILABLE_MULTIPLY } from "../../../constant";
import { applyLocalizations } from "../../../utils";

export default {
  gacha: async (ctx, next) => {
    const userId = ctx.state.user?.id;

    if (!userId) {
      return ctx.unauthorized("user is not authenticated");
    }

    let { drawId, multiply } = JSON.parse(ctx.request.body.data);

    if (!drawId) {
      return ctx.badRequest("drawId is required");
    }

    if (!multiply) {
      multiply = 1;
    }

    if (!AVAILABLE_MULTIPLY.includes(multiply)) {
      return ctx.badRequest("invalid multiply", ErrorCode.INVALID_MULTIPLY);
    }

    const draw = (await strapi.entityService.findOne("api::draw.draw", drawId, {
      populate: {
        room: {
          fields: ["start_date", "end_date", "id"],
        },
      },
    })) as Draw;

    if (!draw) {
      return ctx.badRequest("not found drawId", ErrorCode.DRAW_NOT_FOUND);
    }

    const { room, currency_type } = draw;
    const now = new Date().toISOString();

    if (room.start_date > now) {
      return ctx.internalServerError(
        "not started yet",
        ErrorCode.DRAW_NOT_STARTED
      );
    }

    if (room.end_date < now) {
      return ctx.internalServerError("already ended", ErrorCode.DRAW_ENDED);
    }

    if (currency_type === "freebie") {
      const gachaInfos = await strapi.entityService.findMany(
        "api::gacha-info.gacha-info",
        {
          fields: ["probability", "type"],
          populate: {
            reward_table: {
              populate: {
                rewards: {
                  fields: ["type", "amount", "tier"],
                },
              },
            },
          },
        }
      );

      try {
        const result = await strapi
          .service("api::random-capsule.random-capsule")
          .drawWithCoin(userId, gachaInfos, draw, multiply);

        if (result) {
          const { locale } = ctx.query;

          result.rewards.forEach((reward) => {
            if (reward.type === "item") {
              applyLocalizations(reward.detail, locale);
            }
          });
        }

        return result;
      } catch (error) {
        console.error(error);
        return ctx.badRequest("draw with coin failed", error);
      }
    } else if (currency_type === "star_point") {
      try {
        const result = await strapi
          .service("api::random-capsule.random-capsule")
          .drawWithStarPoint(userId, draw, multiply);

        if (result) {
          const { locale } = ctx.query;

          result.rewards.forEach((reward) => {
            if (reward.type === "item") {
              applyLocalizations(reward.detail, locale);
            }
          });
        }

        return result;
      } catch (error) {
        console.error(error);
        return ctx.badRequest("draw with star point failed", error);
      }
    }
  },

  // "star-gatcha": async (ctx, next) => {
  //   const userId = ctx.state.user?.id;

  //   if (!userId) {
  //     return ctx.unauthorized("user is not authenticated");
  //   }

  //   let { drawId, multiply } = JSON.parse(ctx.request.body.data);

  //   if (!drawId) {
  //     return ctx.badRequest("drawId is required");
  //   }

  //   if (!multiply) {
  //     multiply = 1;
  //   }
  // }
};
