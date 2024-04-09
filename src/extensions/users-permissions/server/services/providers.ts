"use strict";

/**
 * Module dependencies
 */

// Public node modules.
import _ from "lodash";
import urlJoin from "url-join";

// ts-ignore
import utils from "@strapi/utils";
const { getAbsoluteServerUrl } = utils;
import { getService } from "@strapi/plugin-users-permissions/server/utils";

export default ({ strapi }) => {
  /**
   * Helper to get profiles
   *
   * @param {String}   provider
   */

  const getProfile = async (provider, query) => {
    const accessToken = query.access_token || query.code || query.oauth_token;

    const providers = await strapi
      .store({ type: "plugin", name: "users-permissions", key: "grant" })
      .get();

    return getService("providers-registry").run({
      provider,
      query,
      accessToken,
      providers,
    });
  };

  /**
   * Connect thanks to a third-party provider.
   *
   *
   * @param {String}    provider
   * @param {String}    accessToken
   *
   * @return  {*}
   */

  const connect = async (provider, query) => {
    const accessToken = query.access_token || query.code || query.oauth_token;

    if (!accessToken) {
      throw new Error("No access_token.");
    }

    // Get the profile.
    const profile = await getProfile(provider, query);

    const email = _.toLower(profile.email);

    // We need at least the mail.
    if (!email) {
      throw new Error("Email was not available.");
    }

    let users = await strapi.query("plugin::users-permissions.user").findMany({
      where: { email },
    });

    const advancedSettings = await strapi
      .store({ type: "plugin", name: "users-permissions", key: "advanced" })
      .get();

    const user = _.find(users, { provider });

    if (_.isEmpty(user) && !advancedSettings.allow_register) {
      throw new Error("Register action is actually not available.");
    }

    if (!_.isEmpty(user)) {
      return user;
    }

    if (users.length && advancedSettings.unique_email) {
      throw new Error("Email is already taken.");
    }

    const date = new Date();
    const createdFreebie = await strapi.entityService.create(
      "api::freebie.freebie",
      {
        data: {
          max: 7,
          current: 7,
          last_charged_at: (date.getTime() / 1000) | 0,
          charge_interval: 3600,
          publishedAt: date,
        },
      }
    );

    const createdStreak = await strapi.entityService.create(
      "api::streak.streak",
      {
        data: {
          current_login: 0,
          longest_login: 0,
          last_login_date: new Date(0),
          current_draw: 0,
          longest_draw: 0,
          last_draw_date: new Date(0),
          publishedAt: date,
        },
      }
    );

    const createdStarPoint = await strapi.entityService.create(
      "api::star-point.star-point",
      {
        data: {
          amount: 0,
          publishedAt: date,
        },
      }
    );

    const createdWheelSpin = await strapi.entityService.create(
      "api::wheel-spin.wheel-spin",
      {
        data: {
          amount: 0,
          publishedAt: date,
        },
      }
    );

    const createdTradingCredit = await strapi.entityService.create(
      "api::trading-credit.trading-credit",
      {
        data: {
          amount: 0,
          publishedAt: date,
        },
      }
    );

    // Retrieve default role.
    const defaultRole = await strapi
      .query("plugin::users-permissions.role")
      .findOne({ where: { type: advancedSettings.default_role } });

    // Create the new user.
    const newUser = {
      ...profile,
      email, // overwrite with lowercased email
      provider,
      role: defaultRole.id,
      confirmed: true,
      freebie: createdFreebie.id,
      streak: createdStreak.id,
      star_point: createdStarPoint.id,
      wheel_spin: createdWheelSpin.id,
      trading_credit: createdTradingCredit.id,
      level: 1,
      experience: 0,
    };

    const createdUser = await strapi
      .query("plugin::users-permissions.user")
      .create({ data: newUser });

    const achievement_progresses = await strapi
      .services("api::achievement-progress.achievement-progress")
      .createAchievementProgress([createdUser.id]);

    return { ...createdUser, achievement_progresses };
  };

  const buildRedirectUri = (provider = "") => {
    const apiPrefix = strapi.config.get("api.rest.prefix");
    return urlJoin(
      getAbsoluteServerUrl(strapi.config),
      apiPrefix,
      "connect",
      provider,
      "callback"
    );
  };

  return {
    connect,
    buildRedirectUri,
  };
};
