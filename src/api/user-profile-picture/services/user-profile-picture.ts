/**
 * user-profile-picture service
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreService(
  "api::user-profile-picture.user-profile-picture",
  ({ strapi }) => ({
    async getUserProfilePictures(userId) {
      const { user_profile_pictures } = await strapi.entityService.findOne(
        "plugin::users-permissions.user",
        userId,
        {
          fields: ["id"],
          populate: {
            user_profile_pictures: userProfilePicturesOptions,
          },
        }
      );

      return user_profile_pictures;
    },

    async addUserProfilePictures(userId, profilePictureIds) {
      const { user_profile_pictures } = await strapi.entityService.findOne(
        "plugin::users-permissions.user",
        userId,
        {
          fields: ["id"],
          populate: {
            user_profile_pictures: {
              fields: ["id"],
              populate: {
                profile_picture: {
                  fields: ["id"],
                },
              },
            },
          },
        }
      );

      const filtered = profilePictureIds.filter((id) => {
        return !user_profile_pictures.some(
          (userProfilePicture) => userProfilePicture.profile_picture?.id === id
        );
      });

      if (filtered.length === 0) {
        return [];
      }

      return await strapi.db.transaction(async (trx) => {
        const results = await Promise.all(
          filtered.map(async (id) => {
            const [{ current_serial_number }] = await strapi.db
              .connection("profile_pictures")
              .transacting(trx)
              .forUpdate()
              .where("id", id)
              .select("current_serial_number");

            await strapi.entityService.update(
              "api::profile-picture.profile-picture",
              id,
              {
                data: { current_serial_number: current_serial_number + 1 },
              }
            );

            return strapi.entityService.create(
              "api::user-profile-picture.user-profile-picture",
              {
                data: {
                  user: { id: userId },
                  profile_picture: { id: id },
                  serial_number: current_serial_number + 1,
                  publishedAt: new Date(),
                },
              }
            );
          })
        );

        const createdIds = results.map((result) => result.id);

        await strapi.entityService.update(
          "plugin::users-permissions.user",
          userId,
          {
            data: {
              user_profile_pictures: {
                connect: createdIds,
              },
            },
          }
        );

        return createdIds;
      });
    },
  })
);

export const userProfilePicturesOptions = {
  fields: ["claim_date", "serial_number"],
  populate: {
    profile_picture: {
      fields: ["name", "desc"],
      populate: {
        image: {
          fields: ["url"],
        },
      },
    },
  },
};
