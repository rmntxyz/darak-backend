/**
 * character service
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreService(
  "api::character.character",
  ({ strapi }) => ({
    async getCharacterList() {
      const characters = await strapi.entityService.findMany(
        "api::character.character",
        {
          filters: {
            publishedAt: { $ne: null },
          },
          fields: ["name", "desc"],
          populate: {
            image: {
              fields: ["url"],
            },
            localizations: {
              fields: ["name", "desc", "locale"],
            },
          },
        }
      );

      return characters;
    },

    async getCharacterDetail(creatorId: number) {
      const character = await strapi.entityService.findOne(
        "api::character.character",
        creatorId,
        {
          filters: {
            publishedAt: { $ne: null },
          },
          fields: ["name", "desc"],
          populate: {
            image: {
              fields: ["url"],
            },
            items: {
              fields: ["name", "rarity"],
              populate: {
                room: {
                  fields: ["name", "rid", "unlock_conditions"],
                  populate: {
                    image_empty: {
                      fields: ["url"],
                    },
                    localizations: {
                      fields: ["name", "locale"],
                    },
                  },
                },
                image: {
                  fields: ["url"],
                },
                thumbnail: {
                  fields: ["url"],
                },
                localizations: {
                  fields: ["name", "desc", "locale"],
                },
              },
            },
            localizations: {
              fields: ["name", "desc", "locale"],
            },
          },
        }
      );

      return character;
    },
  })
);
