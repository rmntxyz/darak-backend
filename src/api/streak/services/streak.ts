/**
 * streak service
 */

import { factories } from "@strapi/strapi";
import { getRefTimestamp } from "../../../utils";

export default factories.createCoreService(
  "api::streak.streak",
  ({ strapi }) => ({
    async refresh(streak: Streak) {
      let { id, current_streak, longest_streak, last_login_date } = streak;

      const now = new Date();
      const lastRefTimestamp = getRefTimestamp(last_login_date);
      const refTimestamp = getRefTimestamp(now);

      if (lastRefTimestamp === refTimestamp) {
        return streak;
      }

      if (lastRefTimestamp === refTimestamp - 86400000) {
        current_streak += 1;
        longest_streak = Math.max(current_streak, longest_streak);
      } else {
        current_streak = 1;
      }

      return await strapi.service("api::streak.streak").update(id, {
        data: {
          current_streak,
          longest_streak,
          last_login_date: now,
        },
      });
    },
  })
);
