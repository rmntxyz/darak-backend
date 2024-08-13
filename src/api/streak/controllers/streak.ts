/**
 * streak controller
 */

import { factories } from "@strapi/strapi";
import { EXP_MULT_FOR_DUPLICATE, EXP_BY_RARITY } from "../../../constant";

export default factories.createCoreController(
  "api::streak.streak",
  ({ strapi }) => ({
    "get-streak-status": async (ctx) => {
      const userId = ctx.state.user?.id;

      if (!userId) {
        return ctx.unauthorized("user is not authenticated");
      }

      let streak = await strapi.service("api::streak.streak").getStreak(userId);

      if (!streak) {
        return ctx.notFound("no current streak");
      }

      streak = await strapi.service("api::streak.streak").refresh(streak);

      const streakReward = (
        await strapi.entityService.findMany(
          "api::streak-reward.streak-reward",
          {
            filters: {
              type: "default",
            },
            populate: {
              reward_table: {
                populate: {
                  rewards: true,
                },
              },
            },
          }
        )
      )[0];

      return { streak, reward_table: streakReward.reward_table };
    },

    "check-in": async (ctx) => {
      const userId = ctx.state.user?.id;

      if (!userId) {
        return ctx.unauthorized("user is not authenticated");
      }

      let streak: Streak = await strapi
        .service("api::streak.streak")
        .getStreak(userId);

      if (!streak) {
        return ctx.notFound("no current streak");
      }

      streak = await strapi.service("api::streak.streak").refresh(streak);

      if (!streak.reward_claimed) {
        const defaultStreakReward: StreakReward = (
          await strapi.entityService.findMany(
            "api::streak-reward.streak-reward",
            {
              filters: {
                type: "default",
              },
              populate: {
                reward_table: {
                  populate: {
                    rewards: true,
                  },
                },
              },
            }
          )
        )[0];

        if (!defaultStreakReward) {
          return ctx.notFound("no streak reward");
        }

        const rewardTable = defaultStreakReward.reward_table;

        // streak.streak_count 와 rewardTable의 reward중에 day가 같은 reward를 찾는다.
        let { rewards } = rewardTable.find(
          (reward) => reward.day === streak.streak_count
        );

        if (!rewards || rewards.length === 0) {
          return ctx.notFound("no reward for streak count");
        }

        await strapi
          .service("api::reward.reward")
          .claim(userId, rewards, "check_in");

        // streak의 reward_claimed를 true로 변경한다.
        await strapi.entityService.update("api::streak.streak", streak.id, {
          data: {
            reward_claimed: true,
          },
        });

        return rewards;
      }

      return [];
    },
  })
);
