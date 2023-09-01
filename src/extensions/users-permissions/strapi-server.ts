import bootstrap from "./server/bootstrap";
import providersRegistry from "./server/services/providers-registry";
import providers from "./server/services/providers";
import { getRefTimestamp } from "../../utils";

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
            populate: {
              item: { fields: ["id"] },
            },
          },
          freebie: true,
          streak: true,
          rooms: true,
          daily_quest_progress: {
            populate: {
              streak_rewards: true,
            },
          },
          followings: true,
        },
      }
    );

    const freebie = await strapi
      .service("api::freebie.freebie")
      .refresh(user.freebie);

    const dailyQuestProgresses = await strapi
      .service("api::daily-quest-progress.daily-quest-progress")
      .getTodayQuest(user.id);

    console.log(dailyQuestProgresses);
    // check streak
    // const streak = await strapi
    //   .service("api::streak.streak")
    //   .refresh(user.streak);

    // cosnt daily_quest_progress = await strapi

    ctx.body = sanitizeOutput({ ...user, freebie });
  };

  return plugin;
};
