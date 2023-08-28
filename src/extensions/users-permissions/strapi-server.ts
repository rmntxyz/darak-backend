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
        populate: ["items", "freebie", "rooms", "quest_progress", "followings"],
      }
    );

    const freebie = await strapi
      .service("api::freebie.freebie")
      .refresh(user.freebie.id);

    ctx.body = sanitizeOutput({ ...user, freebie });
  };

  return plugin;
};
