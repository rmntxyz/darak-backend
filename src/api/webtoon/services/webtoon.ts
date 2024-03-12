/**
 * webtoon service
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreService(
  "api::webtoon.webtoon",
  ({ strapi }) => ({
    async getWebtoonList() {
      const list = await strapi.entityService.findMany("api::webtoon.webtoon", {
        filters: { publishedAt: { $ne: null } },
        populate: {
          creator: {
            fields: ["name", "desc", "cid", "email", "twitter", "instagram"],
            populate: {
              profile_image: {
                fields: ["url"],
              },
              localizations: {
                fields: ["name", "desc", "locale"],
              },
            },
          },
          cover_image: {
            fields: ["url"],
          },
          rooms: {
            fields: ["rid", "name"],
            populate: {
              image_complete: {
                fields: ["url"],
              },
              localizations: {
                fields: ["name", "locale"],
              },
            },
          },
          webtoon_outlinks: {
            fields: ["platform", "url"],
          },
          episodes: {
            fields: ["title", "episode_number", "episode_id"],
            populate: {
              localizations: {
                fields: ["title", "locale"],
              },
            },
          },
          localizations: {
            fields: ["title", "desc", "locale"],
          },
        },
      });

      return list;
    },

    async getWebtoonDetail(webtoonId: string) {
      const webtoons = await strapi.entityService.findMany(
        "api::webtoon.webtoon",
        {
          filters: { webtoon_id: webtoonId, publishedAt: { $ne: null } },
          populate: {
            creator: {
              fields: ["name", "desc", "cid", "email", "twitter", "instagram"],
              populate: {
                profile_image: {
                  fields: ["url"],
                },
                cover_image: {
                  fields: ["url"],
                },
                localizations: {
                  fields: ["name", "desc", "locale"],
                },
              },
            },
            cover_image: {
              fields: ["url"],
            },
            rooms: {
              fields: ["rid", "name"],
              populate: {
                image_complete: {
                  fields: ["url"],
                },
                localizations: {
                  fields: ["name", "locale"],
                },
              },
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
                images: {
                  fields: ["url"],
                },
                localizations: {
                  fields: ["title", "locale"],
                },
              },
            },
            localizations: {
              fields: ["title", "desc", "locale"],
            },
          },
        }
      );

      if (webtoons.length === 0) {
        throw new Error(`webtoon ${webtoonId} not found`);
      }

      return webtoons[0];
    },
  })
);
