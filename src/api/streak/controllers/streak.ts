/**
 * streak controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::streak.streak",
  ({ strapi }) => ({
    "get-streak-status": async (ctx) => {
      const userId = ctx.state.user?.id;

      if (!userId) {
        return ctx.unauthorized("user is not authenticated");
      }

      const streak = await strapi
        .service("api::streak.streak")
        .getCurrentStreaks(userId);

      if (!streak) {
        return ctx.notFound("no current streak");
      }

      return streak;
    },

    "check-in": async (ctx) => {
      const userId = ctx.state.user?.id;

      if (!userId) {
        return ctx.unauthorized("user is not authenticated");
      }

      const streak: Streak = await strapi
        .service("api::streak.streak")
        .getCurrentStreaks(userId);

      if (!streak) {
        return ctx.notFound("no current streak");
      }

      if (!streak.reward_claimed) {
        const defaultStreakReward: StreakReward = (
          await strapi.entityService.findMany(
            "api::streak-reward.streak-reward",
            {
              filters: {
                type: "default",
              },
            }
          )
        )[0];

        if (!defaultStreakReward) {
          return ctx.notFound("no streak reward");
        }

        const rewardTable = defaultStreakReward.rewards;

        // streak.streak_count 와 rewardTable의 reward중에 day가 같은 reward를 찾는다.

        const { reward } = rewardTable.find(
          (reward) => reward.day === streak.streak_count
        );

        if (!reward) {
          return ctx.notFound("no reward for streak count");
        }

        // reward를 user에게 지급한다.

        switch (reward.type) {
          case "freebie":
            await strapi
              .service("api::freebie.freebie")
              .updateFreebie(userId, reward.amount);
            break;
          case "star_point":
            await strapi
              .service("api::star-point.star-point")
              .updateStarPoint(userId, reward.amount, "check-in");
            break;
          case "wheel_spin":
            break;
          case "item_uncommon":
            break;
          case "item_rare":
            break;
          default:
            break;
        }

        // streak의 reward_claimed를 true로 변경한다.
        await strapi.entityService.update("api::streak.streak", streak.id, {
          data: {
            reward_claimed: true,
          },
        });
      }

      return [];
    },
  })
);
