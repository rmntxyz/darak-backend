import bootstrap from "./server/bootstrap";
import providersRegistry from "./server/services/providers-registry";
import providers from "./server/services/providers";
import { applyLocalizations } from "../../utils";

module.exports = (plugin) => {
  // for kakao login
  plugin.bootstrap = bootstrap;
  plugin.services["providers-registry"] = providersRegistry;
  plugin.services["providers"] = providers;

  const sanitizeOutput = (user) => {
    const {
      password,
      resetPasswordToken,
      confirmationToken,
      ...sanitizedUser
    } = user; // be careful, you need to omit other private attributes yourself
    return sanitizedUser;
  };

  plugin.controllers.user.me = async (ctx) => {
    if (!ctx.state.user) {
      return ctx.unauthorized();
    }

    const user = await strapi.entityService.findOne(
      "plugin::users-permissions.user",
      ctx.state.user.id,
      {
        populate: {
          inventory: {
            fields: ["serial_number"],
            populate: {
              item: { fields: ["id"] },
            },
          },
          status: true,
          freebie: true,
          streak: true,
          free_gift: true,
          shield: true,
          star_point: {
            fields: ["amount"],
          },
          wheel_spin: {
            fields: ["amount"],
          },
          trading_credit: true,
          rooms: {
            fields: ["name", "desc", "rid"],
            populate: {
              image_complete: {
                fields: ["url"],
                populate: ["url"],
              },
            },
          },
          followings: true,
        },
      }
    );

    if (!user) {
      return ctx.unauthorized();
    }

    if (user.freebie === null) {
      user.freebie = await strapi
        .service("api::freebie.freebie")
        .getFreebie(user.id);
    }

    // TEMP
    if (user.star_point === null) {
      user.star_point = await strapi
        .service("api::star-point.star-point")
        .getStarPoint(user.id);
    }

    // TEMP
    if (user.wheel_spin === null) {
      user.wheel_spin = await strapi
        .service("api::wheel-spin.wheel-spin")
        .getWheelSpin(user.id);
    }

    if (user.shield === null) {
      user.shield = await strapi
        .service("api::shield.shield")
        .getShield(user.id);
    }

    // TEMP
    if (user.trading_credit === null) {
      user.trading_credit = await strapi
        .service("api::trading-credit.trading-credit")
        .getTradingCredit(user.id);
    }

    if (user.status === null) {
      user.status = await strapi
        .service("api::status.status")
        .getStatus(user.id);
    }

    if (user.free_gift === null) {
      user.free_gift = await strapi
        .service("api::free-gift.free-gift")
        .getFreeGiftInfo(user.id);
    }

    if (user.streak === null) {
      user.streak = await strapi
        .service("api::streak.streak")
        .getStreak(user.id);
    }

    const freebie = await strapi
      .service("api::freebie.freebie")
      .refresh(user.freebie);

    const trading_credit = await strapi
      .service("api::trading-credit.trading-credit")
      .refresh(user.trading_credit);

    const dailyQuestProgresses = await strapi
      .service("api::daily-quest-progress.daily-quest-progress")
      .getTodayQuests(user.id);

    dailyQuestProgresses.forEach((progress) => {
      applyLocalizations(progress.daily_quest, ctx.query.locale);
    });

    const achievementProgresses = await strapi
      .service("api::achievement-progress.achievement-progress")
      .getAchievementList(user.id);

    const streak = await strapi
      .service("api::streak.streak")
      .refresh(user.streak);

    // const dailyTradeCount = await strapi
    //   .service("api::trade-process.trade-process")
    //   .getDailyTradeCount(user.id);

    // const dailyDrawCount = await strapi
    //   .service("api::draw-history.draw-history")
    //   .getDailyDrawCount(user.id);

    const relays = await strapi
      .service("api::relay.relay")
      .getCurrentRelays(user.id);

    const gachaInfo = await strapi
      .service("api::gacha-info.gacha-info")
      .getGachaInfo();

    const statusEffects = await strapi
      .service("api::user-status-effect.user-status-effect")
      .getActiveEffects(user.id);

    statusEffects.forEach((effect) => {
      const { status_effect } = effect;
      applyLocalizations(effect.status_effect, ctx.query.locale);

      const { details } = status_effect;
      details.forEach((detail) => {
        applyLocalizations(detail, ctx.query.locale);
      });
    });

    ctx.body = sanitizeOutput({
      ...user,
      freebie,
      trading_credit,
      relays,
      streak,
      achievement_progresses: achievementProgresses,
      daily_quest_progresses: dailyQuestProgresses,
      daily_trade_count: 0,
      daily_draw_count: 0,
      gacha_info: gachaInfo,
      user_status_effects: statusEffects,
    });
  };

  plugin.controllers.auth.saveDeviceToken = async (ctx) => {
    var res = await strapi.entityService.update(
      "plugin::users-permissions.user",
      ctx.state.user.id,
      {
        data: { device_token: ctx.request.body.token },
      }
    );
    ctx.body = res;
  };

  plugin.routes["content-api"].routes.push({
    method: "POST",
    path: "/auth/device-token",
    handler: "auth.saveDeviceToken",
    config: {
      prefix: "",
      policies: [],
    },
  });

  plugin.controllers.user.saveLanguage = async (ctx) => {
    var res = await strapi.entityService.update(
      "plugin::users-permissions.user",
      ctx.state.user.id,
      {
        data: { language: ctx.request.body.code },
      }
    );
    ctx.body = res;
  };

  plugin.routes["content-api"].routes.push({
    method: "POST",
    path: "/users/language",
    handler: "user.saveLanguage",
    config: {
      prefix: "",
      policies: [],
    },
  });

  return plugin;
};
