/**
 * webtoon controller
 */

import { factories } from "@strapi/strapi";
import { applyLocalizations } from "../../../utils";

export default factories.createCoreController(
  "api::webtoon.webtoon",
  ({ strapi }) => ({
    "get-webtoon-list": async (ctx) => {
      const webtoonList = await strapi
        .service("api::webtoon.webtoon")
        .getWebtoonList();

      const { locale } = ctx.query;

      webtoonList.forEach((webtoon) => {
        applyLocalizations(webtoon, locale);

        applyLocalizations(webtoon.creator, locale);

        webtoon.episodes.forEach((episode) => {
          applyLocalizations(episode, locale);
        });

        webtoon.rooms.forEach((room) => {
          applyLocalizations(room, locale);
        });
      });

      return webtoonList;
    },

    "get-webtoon-detail": async (ctx) => {
      const webtoonId = ctx.params.webtoonId;

      if (!webtoonId) {
        return ctx.notFound("webtoonId is not provided");
      }

      const webtoon = await strapi
        .service("api::webtoon.webtoon")
        .getWebtoonDetail(webtoonId);

      return webtoon;
    },
  })
);
