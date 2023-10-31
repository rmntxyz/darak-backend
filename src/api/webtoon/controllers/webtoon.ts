/**
 * webtoon controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::webtoon.webtoon",
  ({ strapi }) => ({
    "get-webtoon-list": async (ctx) => {
      const webtoonList = await strapi
        .service("api::webtoon.webtoon")
        .getWebtoonList();
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
