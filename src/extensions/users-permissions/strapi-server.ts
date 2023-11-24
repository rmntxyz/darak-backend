import bootstrap from "./server/bootstrap";
import providersRegistry from "./server/services/providers-registry";
import providers from "./server/services/providers";

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
          freebie: true,
          streak: true,
          star_point: {
            fields: ["amount"],
          },
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

    if (user.star_point === null) {
      user.star_point = await strapi
        .service("api::star-point.star-point")
        .getStarPoint(user.id);
    }

    const freebie = await strapi
      .service("api::freebie.freebie")
      .refresh(user.freebie);

    //refresh streak
    // await strapi.service("api::streak.streak").refresh(user.streak);

    // const dailyQuestProgresses = await strapi
    //   .service("api::daily-quest-progress.daily-quest-progress")
    //   .getTodayQuest(user.id);

    const dailyQuestProgresses = await strapi
      .service("api::daily-quest-progress.daily-quest-progress")
      .getTodayQuest(user.id);

    const achievementProgresses = await strapi
      .service("api::achievement-progress.achievement-progress")
      .getAchievementList(user.id);

    const dailyTradeCount = await strapi
      .service("api::trade-process.trade-process")
      .getDailyTradeCount(user.id);

    const dailyDrawCount = await strapi
      .service("api::draw-history.draw-history")
      .getDailyDrawCount(user.id);

    ctx.body = sanitizeOutput({
      ...user,
      freebie,
      achievement_progresses: achievementProgresses,
      daily_quest_progresses: dailyQuestProgresses,
      daily_trade_count: dailyTradeCount,
      daily_draw_count: dailyDrawCount,
    });
  };

  return plugin;
};
