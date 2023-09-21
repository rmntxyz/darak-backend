/**
 * user-info service
 */

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
});
