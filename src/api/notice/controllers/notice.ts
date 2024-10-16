/**
 * notice controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::notice.notice",
  ({ strapi }) => ({
    "get-notice": async (ctx) => {
      const notices = await strapi.entityService.findMany(
        "api::notice.notice",
        {
          filters: {
            publishedAt: { $ne: null },
          },
          sort: { order: "desc" },
        }
      );

      return notices;
    },
  })
);
