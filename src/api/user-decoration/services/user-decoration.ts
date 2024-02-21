/**
 * user-decoration service
 */

import { factories } from "@strapi/strapi";

const decorationDefaultOptions = {
  fields: ["id"],
  populate: {
    user_items: {
      populate: {
        user_item: {
          fields: ["serial_number", "status"],
          populate: {
            item: {
              fields: ["id"],
            },
            users_permissions_user: {
              fields: ["id"],
            },
          },
        },
      },
    },
    deco_items: {
      populate: {
        deco_item: {
          fields: ["name", "desc"],
          populate: {
            image: {
              fields: ["url"],
            },
          },
        },
      },
    },
    texts: true,
    lines: true,
    user: { fields: ["id"] },
    snapshot: { fields: ["url"] },
  },
};

export default factories.createCoreService(
  "api::user-decoration.user-decoration",
  ({ strapi }) => ({
    async findUserDecorations(userId: string) {
      return strapi.entityService.findMany(
        "api::user-decoration.user-decoration",
        {
          ...decorationDefaultOptions,
          filters: {
            user: { id: userId },
          },
        }
      );
    },

    async createUserDecoration(userId: string) {
      const userDecoration = await strapi.entityService.create(
        "api::user-decoration.user-decoration",
        {
          ...decorationDefaultOptions,
          data: {
            user: { id: userId },
            items: [],
            deco_items: [],
            texts: [],
            lines: [],
            snapshot: {
              url: "",
            },
          },
        }
      );

      return userDecoration;
    },

    async updateUserDecoration(decoId: string, data: any) {
      const userDecoration = await strapi.entityService.update(
        "api::user-decoration.user-decoration",
        decoId,
        {
          ...decorationDefaultOptions,
          data,
        }
      );

      return userDecoration;
    },
  })
);
