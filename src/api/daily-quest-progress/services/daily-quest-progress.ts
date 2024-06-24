/**
 * daily-quest-progress service
 */

import { factories } from "@strapi/strapi";
import { getDayFromRefDate, getRefTimestamp } from "../../../utils";
import progressHandler from "./handler";
import { DAYS } from "../../../constant";

export const progressDefaultOptions = {
  fields: ["progress", "is_completed", "is_reward_claimed", "completed_date"],
  populate: {
    daily_quest: {
      fields: ["qid", "total_progress", "name"],
      populate: {
        rewards: true,
      },
    },
  },
};

async function getDailyQuestProgresses(userId: number) {
  const now = new Date();
  const refTimestamp = getRefTimestamp(now);

  return await strapi.entityService.findMany(
    "api::daily-quest-progress.daily-quest-progress",
    {
      ...progressDefaultOptions,
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

      if (inProgresses!.length > 0) {
        return inProgresses;
      }

      const dayIndex = getDayFromRefDate(new Date());
      const day = DAYS[dayIndex];

      const dailyQuests = await strapi.entityService.findMany(
        "api::daily-quest.daily-quest",
        {
          // filters: {
          //   days: {
          //     $contains: day,
          //   },
          // },
          populate: {
            rewards: true,
          },
        }
      );

      const quests: any[] = [];

      for (const dailyQuest of dailyQuests) {
        const quest = await strapi.entityService.create(
          "api::daily-quest-progress.daily-quest-progress",
          {
            ...progressDefaultOptions,
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
          progressDefaultOptions
        );

        if (!dailyQuestProgress) {
          throw new Error("daily quest progress not found");
        }

        if (!dailyQuestProgress.is_completed) {
          const user = await strapi.entityService.findOne(
            "plugin::users-permissions.user",
            userId,
            {
              fields: ["id"],
            }
          );

          progress = await progressHandler.verify(user, dailyQuestProgress);
        }

        if (!progress) {
          progress = dailyQuestProgress;
        }
      });

      return progress;
    },

    async verifyAll(userId: number) {
      // get all daily quests
      let progresses: any = [];

      await strapi.db.transaction(async () => {
        const dailyQuestProgresses = await strapi
          .service("api::daily-quest-progress.daily-quest-progress")
          .getTodayQuest(userId);

        const user = await strapi.entityService.findOne(
          "plugin::users-permissions.user",
          userId,
          {
            fields: ["id"],
            populate: {
              streak: true,
            },
          }
        );

        for (const dailyQuestProgress of dailyQuestProgresses) {
          let progress = null;

          if (!dailyQuestProgress.is_completed) {
            progress = await progressHandler.verify(user, dailyQuestProgress);
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
      let results: any = null;

      await strapi.db.transaction(async () => {
        const progress = await strapi.entityService.findOne(
          "api::daily-quest-progress.daily-quest-progress",
          progressId,
          progressDefaultOptions
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

        const rewards = await progressHandler.claimRewards(user, progress);

        await strapi.entityService.update(
          "api::daily-quest-progress.daily-quest-progress",
          progress.id,
          {
            data: {
              is_reward_claimed: true,
            },
          }
        );

        results = { rewards };
      });

      return results;
    },
  })
);
