/**
 * notice controller
 */

import { factories } from "@strapi/strapi";
import { applyLocalizations } from "../../../utils";

export default factories.createCoreController(
  "api::notice.notice",
  ({ strapi }) => ({
    "get-notice": async (ctx) => {
      const { locale } = ctx.query;

      const notices = await strapi.entityService.findMany(
        "api::notice.notice",
        {
          filters: {
            publishedAt: { $ne: null },
          },
          sort: { order: "desc" },
          populate: {
            title_image: {
              fields: ["url"],
            },
            banner_image: {
              fields: ["url"],
            },
            bg_image: {
              fields: ["url"],
            },
            localizations: {
              fields: ["title", "content", "locale"],
              populate: {
                title_image: {
                  fields: ["url"],
                },
                banner_image: {
                  fields: ["url"],
                },
                bg_image: {
                  fields: ["url"],
                },
              },
            },
          },
        }
      );

      notices.forEach((notice) => {
        applyLocalizations(notice, locale);
      });

      return notices;
    },
  })
);
