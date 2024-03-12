/**
 * creator service
 */

import { factories } from "@strapi/strapi";

const defaultCreatorOptions = {
  fields: ["name", "cid", "email", "twitter", "instagram"],
  populate: {
    profile_image: {
      fields: ["url"],
    },
    cover_image: {
      fields: ["url"],
    },
    rooms: {
      filters: { publishedAt: { $ne: null } },
      fields: ["rid", "name", "desc", "start_date", "end_date"],
      populate: {
        items: {
          fields: ["id", "rarity", "category"],
        },
        image_empty: {
          fields: ["url"],
        },
        localizations: {
          fields: ["name", "desc", "locale"],
        },
      },
    },
    webtoons: {
      filters: { publishedAt: { $ne: null } },
      fields: ["title", "webtoon_id", "desc", "volume", "release_date"],
      populate: {
        cover_image: {
          fields: ["url"],
        },
        webtoon_outlinks: {
          fields: ["platform", "url"],
        },
        episodes: {
          fields: ["title", "episode_number", "episode_id"],
          populate: {
            thumbnail: {
              fields: ["url"],
            },
            // images: {
            //   fields: ["url"],
            // },
            localizations: {
              fields: ["title", "locale"],
            },
          },
        },
        localizations: {
          fields: ["title", "desc", "locale"],
        },
      },
    },
    localizations: {
      fields: ["name", "desc", "locale"],
    },
  },
};

export default factories.createCoreService(
  "api::creator.creator",
  ({ strapi }) => ({
    async getCreatorList() {
      const list = await strapi.entityService.findMany("api::creator.creator", {
        ...defaultCreatorOptions,
        filters: { publishedAt: { $ne: null } },
      });

      return list;
    },

    async getCreatorDetail(creatorId: string) {
      const creator = (
        await strapi.entityService.findMany("api::creator.creator", {
          ...defaultCreatorOptions,
          filters: { publishedAt: { $ne: null }, cid: creatorId },
        })
      )[0];

      return creator;
    },
  })
);
