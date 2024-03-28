/**
 * A set of functions called "actions" for `random-capsule`
 */

import { ErrorCode } from "../../../constant";

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

    const draw = (await strapi.entityService.findOne("api::draw.draw", drawId, {
      populate: {
        room: {
          fields: ["start_date", "end_date", "id"],
        },
      },
    })) as Draw;

    if (!draw) {
      throw ErrorCode.DRAW_NOT_FOUND;
    }

    const { room, currency_type } = draw;
    const now = new Date().toISOString();

    if (room.start_date > now) {
      throw ErrorCode.DRAW_NOT_STARTED;
    }

    if (room.end_date < now) {
      throw ErrorCode.DRAW_ENDED;
    }

    if (currency_type === "freebie") {
      const gachaInfo = await strapi.entityService.findOne(
        "api::gacha-info.gacha-info",
        1,
        {
          fields: ["probability"],
          populate: {
            rewards: {
              populate: {
                reward: {
                  fields: ["type", "amount"],
                },
              },
            },
          },
        }
      );

      const result = await strapi
        .service("api::random-capsule.random-capsule")
        .drawWithCoin(userId, gachaInfo, draw, multiply);

      return result;
    } else if (currency_type === "star_point") {
      const result = await strapi
        .service("api::random-capsule.random-capsule")
        .drawWithStarPoint(userId, draw, multiply);

      return result;
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
