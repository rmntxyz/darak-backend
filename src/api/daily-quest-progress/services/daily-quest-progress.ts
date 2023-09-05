/**
 * daily-quest-progress service
 */

import { factories } from "@strapi/strapi";
import { getRefTimestamp } from "../../../utils";
import verifier from "./verifier";

async function getDailyQuestProgresses(userId: number) {
  const now = new Date();
  const refTimestamp = getRefTimestamp(now);

  return await strapi.entityService.findMany(
    "api::daily-quest-progress.daily-quest-progress",
    {
      populate: {
        daily_quest: {
          populate: { streak_rewards: { populate: ["rewards"] } },
        },
      },
      filters: {
        users_permissions_user: { id: userId },
        createdAt: { $gte: new Date(refTimestamp).toISOString() },
      },
    }
  );
}

export default factories.createCoreService(
  "api::daily-quest-progress.daily-quest-progress",
  ({ strapi }) => ({
    async getTodayQuest(userId: number) {
      const inProgresses = await getDailyQuestProgresses(userId);

      if (inProgresses.length > 0) {
        return inProgresses;
      }

      const dailyQuests = await strapi.db
        .query("api::daily-quest.daily-quest")
        .findMany({});

      const quests = [];

      for (const dailyQuest of dailyQuests) {
        const quest = await strapi.entityService.create(
          "api::daily-quest-progress.daily-quest-progress",
          {
            data: {
              daily_quest: { id: dailyQuest.id },
              progress: 0,
              is_reward_claimed: false,
              is_completed: false,
              completed_date: null,
              users_permissions_user: {
                id: userId,
              },
              publishedAt: new Date(),
            },
          }
        );

        // 쿼리 한 결과랑 같은 폼을 만들어 준다.
        quests.push({ ...quest, daily_quest: dailyQuest });
      }

      return quests;
    },

    async verify(userId: number, progressId: number) {
      let progress = null;

      await strapi.db.transaction(async () => {
        const dailyQuestProgress = await strapi.entityService.findOne(
          "api::daily-quest-progress.daily-quest-progress",
          progressId,
          {
            populate: ["daily_quest"],
          }
        );

        if (!dailyQuestProgress) {
          throw new Error("daily quest progress not found");
        }

        if (!dailyQuestProgress.is_completed) {
          progress = verifier.verify(userId, dailyQuestProgress);
        }

        if (!progress) {
          progress = dailyQuestProgress;
        }
      });

      return progress;
    },

    async verifyAll(userId: number) {
      // get all daily quests
      let progresses = [];

      await strapi.db.transaction(async () => {
        const dailyQuestProgresses = await strapi
          .service("api::daily-quest-progress.daily-quest-progress")
          .getTodayQuest(userId);

        for (const dailyQuestProgress of dailyQuestProgresses) {
          let progress = null;

          if (!dailyQuestProgress.is_completed) {
            progress = verifier.verify(userId, dailyQuestProgress);
          }

          if (!progress) {
            progress = dailyQuestProgress;
          }

          progresses.push(progress);
        }
      });

      return progresses;
    },

    async claimRewards(userId: number, progressId: number) {
      let results = null;

      await strapi.db.transaction(async () => {
        const progress = await strapi.entityService.findOne(
          "api::daily-quest-progress.daily-quest-progress",
          progressId,
          {
            populate: {
              daily_quest: {
                populate: {
                  streak_rewards: {
                    populate: ["rewards"],
                  },
                },
              },
            },
          }
        );

        if (!progress.is_completed) {
          throw new Error("not completed");
        }

        if (progress.is_reward_claimed) {
          throw new Error("already claimed");
        }

        const user = await strapi.entityService.findOne(
          "plugin::users-permissions.user",
          userId,
          {
            fields: ["id"],
            populate: {
              streak: true,
              freebie: true,
            },
          }
        );

        const { current_streak } = user.streak;
        const { streak_rewards } = progress.daily_quest;

        const { rewards } =
          streak_rewards[Math.min(current_streak, streak_rewards.length) - 1];

        for (const reward of rewards) {
          if (reward.type === "freebie") {
            await strapi.entityService.update(
              "api::freebie.freebie",
              user.freebie.id,
              {
                data: {
                  current: user.freebie.current + reward.amount,
                },
              }
            );
          }
        }

        await strapi.entityService.update(
          "api::daily-quest-progress.daily-quest-progress",
          progress.id,
          {
            data: {
              is_reward_claimed: true,
            },
          }
        );

        results = rewards;
      });

      return results;
    },
  })
);
