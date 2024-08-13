/**
 * streak service
 */

import { factories } from "@strapi/strapi";
import { getRefTimestamp } from "../../../utils";
import { CHECK_IN_RESET_DAYS, ONE_DAY } from "../../../constant";

export default factories.createCoreService(
  "api::streak.streak",
  ({ strapi }) => ({
    async getStreak(userId: number) {
      let streak = (
        await strapi.entityService.findMany("api::streak.streak", {
          filters: {
            users_permissions_user: { id: userId },
          },
        })
      )[0];

      if (!streak) {
        streak = await strapi.entityService.create("api::streak.streak", {
          data: {
            users_permissions_user: userId,
            streak_count: 0,
            current_login: 0,
            longest_login: 0,
            last_login_date: new Date(0),
            publishedAt: new Date(),
            reward_claimed: false,

            current_draw: 0,
            longest_draw: 0,
            last_draw_date: new Date(0),
          },
        });
      }

      return streak;
    },

    async refresh(streak: Streak) {
      let { id, current_login, longest_login, last_login_date, streak_count } =
        streak;

      const now = new Date();
      const lastRefTimestamp = getRefTimestamp(last_login_date);
      const refTimestamp = getRefTimestamp(now);

      if (lastRefTimestamp === refTimestamp) {
        return streak;
      }

      if (refTimestamp - lastRefTimestamp === ONE_DAY) {
        current_login = current_login + 1;
      } else {
        current_login = 1;
      }

      longest_login = Math.max(current_login, longest_login);

      streak_count = (streak_count % CHECK_IN_RESET_DAYS) + 1;

      return await strapi.service("api::streak.streak").update(id, {
        data: {
          current_login,
          longest_login,
          streak_count,
          last_login_date: now,
          reward_claimed: false,
        },
      });
    },
  })
);
