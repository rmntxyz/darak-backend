/**
 * creator controller
 */

import { factories } from "@strapi/strapi";
import { applyLocalizations } from "../../../utils";

export default factories.createCoreController(
  "api::creator.creator",
  ({ strapi }) => ({
    "get-creator-list": async (ctx) => {
      const creatorList = await strapi
        .service("api::creator.creator")
        .getCreatorList();

      const { locale } = ctx.query;

      creatorList.forEach((creator) => {
        applyLocalizations(creator, locale);

        creator.rooms.forEach((room) => {
          applyLocalizations(room, locale);
        });

        creator.webtoons.forEach((webtoon) => {
          applyLocalizations(webtoon, locale);

          webtoon.episodes.forEach((episode) => {
            applyLocalizations(episode, locale);
          });
        });
      });

      return creatorList;
    },
    "get-creator-detail": async (ctx) => {
      const creatorId = ctx.params.creatorId;

      if (!creatorId) {
        return ctx.notFound("creatorId is not provided");
      }

      const creator = await strapi
        .service("api::creator.creator")
        .getCreatorDetail(creatorId);

      if (creator) {
        const { locale } = ctx.query;

        applyLocalizations(creator, locale);

        creator.rooms.forEach((room) => {
          applyLocalizations(room, locale);
        });

        creator.webtoons.forEach((webtoon) => {
          applyLocalizations(webtoon, locale);

          webtoon.episodes.forEach((episode) => {
            applyLocalizations(episode, locale);
          });
        });
      }

      return creator;
    },
  })
);
