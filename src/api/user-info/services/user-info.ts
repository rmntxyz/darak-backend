/**
 * user-info service
 */

import { REACTIVATION_PERIOD } from "../../../constant";

export default ({ strapi }) => ({
  updateUserInfo: async (userId, username, avatar) => {
    // create data if name or avatar is exist
    const data: { username?: string; avatar?: string } = {};

    if (username) {
      data.username = username;
    }

    if (avatar) {
      data.avatar = avatar;
    }

    const user = await strapi.entityService.update(
      "plugin::users-permissions.user",
      userId,
      { data }
    );

    return user;
  },

  deactivateUser: async (userId) => {
    const user = await strapi.entityService.update(
      "plugin::users-permissions.user",
      userId,
      {
        fields: ["deactivated", "deactivated_at"],
        data: {
          deactivated: true,
          deactivated_at: new Date(),
        },
      }
    );

    return user;
  },

  reactivateUser: async (userId) => {
    const user = await strapi.entityService.findOne(
      "plugin::users-permissions.user",
      userId,
      {
        fields: ["deactivated", "deactivated_at"],
      }
    );

    if (!user.deactivated) {
      throw new Error("User is not deactivated");
    }

    // 15 days
    if (
      Date.now() - new Date(user.deactivated_at).getTime() >
      REACTIVATION_PERIOD
    ) {
      throw new Error("Deactivated user can be reactivated within 15 days");
    }

    return await strapi.entityService.update(
      "plugin::users-permissions.user",
      userId,
      {
        fields: ["deactivated", "deactivated_at"],
        data: {
          deactivated: false,
          deactivated_at: null,
        },
      }
    );
  },
});
