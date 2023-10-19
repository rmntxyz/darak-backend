/**
 * activity controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::activity.activity",
  ({ strapi }) => ({
    "get-activity-list": async (ctx) => {
      try {
        const category = ctx.params.category || "platform";
        const duration = +ctx.query.duration || 7;
        const limit = +ctx.query.limit || 20;

        const activities = await strapi
          .service("api::activity.activity")
          .findActivityList(category, duration, limit);

        return activities;
      } catch (err) {
        return ctx.forbidden("failed to get activity list.", {
          errors: err.message,
        });
      }
    },
  })
);
