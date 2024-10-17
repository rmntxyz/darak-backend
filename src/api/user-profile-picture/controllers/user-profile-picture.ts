/**
 * user-profile-picture controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::user-profile-picture.user-profile-picture",
  ({ strapi }) => ({
    "get-user-profile-pictures": async (ctx) => {
      const userId = ctx.state.user.id;

      const userProfilePictures = await strapi
        .service("api::user-profile-picture.user-profile-picture")
        .getUserProfilePictures(userId);

      return userProfilePictures;
    },

    "update-profile-picture": async (ctx) => {
      const userId = ctx.state.user.id;
      const { userProfilePictureId } = ctx.request.body;

      if (!userProfilePictureId) {
        return ctx.badRequest("User profile picture id is required");
      }

      const userProfilePicture = await strapi.entityService.findOne(
        "api::user-profile-picture.user-profile-picture",
        userProfilePictureId,
        {
          fields: ["id"],
          populate: {
            user: {
              fields: ["id"],
            },
          },
        }
      );

      if (!userProfilePicture) {
        return ctx.badRequest("User profile picture not found");
      }

      if (userProfilePicture.user.id !== userId) {
        return ctx.badRequest("Profile picture does not belong to the user");
      }

      await strapi.entityService.update(
        "plugin::users-permissions.user",
        userId,
        {
          data: {
            avatar: { id: userProfilePictureId },
          },
        }
      );

      return { message: "Profile picture updated successfully" };
    },
  })
);
