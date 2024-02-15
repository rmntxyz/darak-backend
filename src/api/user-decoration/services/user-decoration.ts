/**
 * user-decoration service
 */

import { factories } from "@strapi/strapi";

const decorationDefaultOptions = {
  fields: ["id", "items", "deco_items", "texts", "lines", "snapshot"],
  populate: {
    items: {
      fields: ["id", "item", "attribute"],
      populate: {
        item: {
          fields: ["name", "image", "desc", "rarity"],
        },
      },
    },
    deco_items: {
      fields: ["id", "deco_item", "attribute"],
      populate: {
        deco_item: {
          fields: ["name", "image", "desc"],
        },
      },
    },
    texts: {
      fields: ["id", "text", "attribute"],
    },
    lines: {
      fields: ["id", "attribute"],
    },
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
