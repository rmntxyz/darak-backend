/**
 * activity service
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreService(
  "api::activity.activity",
  ({ strapi }) => ({
    async findActivityList(category: string, duration: number, limit: number) {
      const date = new Date();
      date.setDate(date.getDate() - duration);

      const options = {
        filters: {
          category,
          createdAt: { $gte: date.toISOString() },
        },
        fields: ["id", "category", "type", "detail", "createdAt"],
        populate: {
          user: {
            fields: ["id", "username"],
          },
          room: {
            fields: ["id", "name", "rid"],
          },
          item: {
            fields: ["id", "name", "rarity"],
            populate: {
              room: {
                fields: ["id", "name", "rid"],
              },
            },
          },
        },
        sort: { createdAt: "desc" },
        limit,
      };

      const activities = await strapi.entityService.findMany(
        "api::activity.activity",
        options
      );

      return activities;
    },
  })
);
