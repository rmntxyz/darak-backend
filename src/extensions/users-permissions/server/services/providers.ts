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
import { createRoomixUID } from "../../../../utils";

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
      throw new Error(`Email is already taken. (${users[0].provider})`);
    }

    let username = profile.username;

    if (!username) {
      throw new Error("Username was not available.");
    }

    users = await strapi.query("plugin::users-permissions.user").findMany({
      where: { username },
    });

    if (users.length) {
      username = `${username}#${users.length}`;
    }

    const date = new Date();
    const createdFreebie = await strapi.entityService.create(
      "api::freebie.freebie",
      {
        data: {
          max: 30,
          current: 30,
          last_charged_at: (date.getTime() / 1000) | 0,
          charge_interval: 3600,
          charge_amount: 3,
          publishedAt: date,
        },
      }
    );

    const createdStreak = await strapi.entityService.create(
      "api::streak.streak",
      {
        data: {
          streak_count: 0,
          current_login: 0,
          longest_login: 0,
          last_login_date: new Date(0),
          publishedAt: date,

          current_draw: 0,
          longest_draw: 0,
          last_draw_date: new Date(0),
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
          max: 2,
          current: 2,
          last_charged_at: (date.getTime() / 1000) | 0,
          charge_interval: 3600 * 12,
          charge_amount: 1,
          publishedAt: date,
        },
      }
    );

    const createdStatus = await strapi.entityService.create(
      "api::status.status",
      {
        data: {
          level: 1,
          exp: 0,
          level_up_reward_claimed: true,
          level_up_reward_claim_history: [{ date: new Date(), level: 1 }],
          publishedAt: new Date(),
        },
        fields: ["id", "level", "exp", "level_up_reward_claimed"],
        populate: {
          level_up_reward_claim_history: {
            sort: "level:asc",
          },
        },
      }
    );

    // Retrieve default role.
    const defaultRole = await strapi
      .query("plugin::users-permissions.role")
      .findOne({ where: { type: advancedSettings.default_role } });

    // Create the new user.
    const newUser = {
      username,
      email, // overwrite with lowercased email
      provider,
      role: defaultRole.id,
      confirmed: true,
      status: createdStatus.id,
      freebie: createdFreebie.id,
      streak: createdStreak.id,
      star_point: createdStarPoint.id,
      wheel_spin: createdWheelSpin.id,
      trading_credit: createdTradingCredit.id,
      deactivated: false,
    };

    const createdUser = await strapi
      .query("plugin::users-permissions.user")
      .create({ data: newUser });

    const handle = createRoomixUID(createdUser.id);
    await strapi
      .service("api::user-info.user-info")
      .updateUserInfo(createdUser.id, { handle });

    const achievement_progresses = await strapi
      .service("api::achievement-progress.achievement-progress")
      .createAchievementProgress([createdUser.id]);

    // 가입시 컨디션이 없는 유저룸 생성
    await strapi
      .service("api::user-room.user-room")
      .createUserRoomsWithoutUnlockCondition(createdUser.id);

    // 가입시 유저 프로필 사진 생성
    const profilePictures = await strapi.entityService.findMany(
      "api::profile-picture.profile-picture",
      {
        fields: ["id"],
        filters: {
          publishedAt: { $ne: null },
          type: "default",
        },
      }
    );
    const pictureIds = profilePictures.map((picture) => picture.id);
    await strapi
      .service("api::user-profile-picture.user-profile-picture")
      .addUserProfilePictures(createdUser.id, pictureIds);

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
