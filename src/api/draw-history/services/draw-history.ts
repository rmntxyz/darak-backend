/**
 * draw-history service
 */

import { factories } from "@strapi/strapi";
import { getRefTimestamp } from "../../../utils";

export default factories.createCoreService(
  "api::draw-history.draw-history",
  ({ strapi }) => ({
    getDailyDrawCount: async (userId: number) => {
      const now = new Date();
      const refTime = getRefTimestamp(now);
      const histories = await strapi.entityService.findMany(
        "api::draw-history.draw-history",
        {
          filters: {
            users_permissions_user: userId,
            createdAt: { $gte: new Date(refTime).toISOString() },
          },
          populate: {
            draw: {
              fields: ["currency_type"],
              populate: {
                room: {
                  fields: ["id"],
                },
              },
            },
          },
        }
      );

      /*
      {
        [roomId]: {
          [drawId]: {
            currency_type: "star_point",
            count: 0,
          }
        }
      }
      */

      const result = histories.reduce((acc, history) => {
        const roomId = history.draw.room.id;
        const drawId = history.draw.id;
        const currencyType = history.draw.currency_type;

        if (!acc[roomId]) {
          acc[roomId] = {};
        }

        if (!acc[roomId][drawId]) {
          acc[roomId][drawId] = {
            currency_type: currencyType,
            count: 0,
          };
        }

        acc[roomId][drawId].count += 1;

        return acc;
      }, {});

      return result;
    },

    getDailyDrawCountByRoom: async (userId: number, roomId: number) => {
      const now = new Date();
      const refTime = getRefTimestamp(now);
      const histories = await strapi.entityService.findMany(
        "api::draw-history.draw-history",
        {
          filters: {
            users_permissions_user: userId,
            createdAt: { $gte: new Date(refTime).toISOString() },
            draw: { room: { id: roomId } },
          },
          populate: {
            draw: {
              fields: ["currency_type"],
              populate: {
                room: {
                  fields: ["id", "rid"],
                },
              },
            },
          },
        }
      );

      const result = histories.reduce((acc, history) => {
        const drawId = history.draw.id;
        const currencyType = history.draw.currency_type;

        if (!acc[drawId]) {
          acc[drawId] = {
            currency_type: currencyType,
            count: 0,
          };
        }

        acc[drawId].count += 1;

        return acc;
      }, {});

      return result;
    },
  })
);
