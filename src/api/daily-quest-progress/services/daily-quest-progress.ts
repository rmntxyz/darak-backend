/**
 * daily-quest-progress service
 */

import { factories } from "@strapi/strapi";
import { getDayFromRefDate, getRefTimestamp } from "../../../utils";
import progressHandler from "./handler";
import { DAYS } from "../../../constant";

export default factories.createCoreService(
  "api::daily-quest-progress.daily-quest-progress",
  ({ strapi }) => ({
    async getTodayQuests(userId: number) {
      return await strapi.db.transaction(async ({ trx }) => {
        const progresses = (await getDailyQuestProgresses(
          userId
        )) as DailyQuestProgress[];

        if (progresses!.length === 0) {
          const dayIndex = getDayFromRefDate(new Date());

          const day = DAYS[dayIndex];

          const dailyQuests = await strapi.entityService.findMany(
            "api::daily-quest.daily-quest",
            {
              filters: {
                days: {
                  $contains: day,
                },
              },
              fields: ["qid", "total_progress", "name"],
              populate: {
                rewards: true,
                localizations: {
                  fields: ["name", "locale"],
                },
              },
            }
          );

          for (const dailyQuest of dailyQuests) {
            // lock daily quest
            await strapi.db
              .connection("daily_quests")
              .transacting(trx)
              .forUpdate()
              .where("id", dailyQuest.id)
              .select("*");

            let progress = (
              await strapi.entityService.findMany(
                "api::daily-quest-progress.daily-quest-progress",
                {
                  ...progressDefaultOptions,
                  filters: {
                    users_permissions_user: { id: userId },
                    daily_quest: { id: dailyQuest.id },
                  },
                }
              )
            )[0];

            if (!progress) {
              progress = await strapi.entityService.create(
                "api::daily-quest-progress.daily-quest-progress",
                {
                  ...progressDefaultOptions,
                  data: {
                    daily_quest: { id: dailyQuest.id },
                    progress: 0,
                    is_reward_claimed: false,
                    is_completed: false,
                    completed_date: null,
                    ref_timestamp: (getRefTimestamp(new Date()) / 1000) | 0,
                    users_permissions_user: {
                      id: userId,
                    },
                    publishedAt: new Date(),
                  },
                }
              );
            }

            // 쿼리 한 결과랑 같은 폼을 만들어 준다.
            progresses.push(progress);
          }
        }

        for (const progress of progresses) {
          this.refresh(progress);

          if (!progress.is_completed) {
            const verified = await progressHandler.verify(userId, progress);
            Object.assign(progress, verified);
          }
        }

        return progresses;
      });
    },

    async refresh(progress: DailyQuestProgress) {
      const today_timestamp = (getRefTimestamp(new Date()) / 1000) | 0;

      if (progress.ref_timestamp === today_timestamp) {
        return progress;
      }

      await strapi.entityService.update(
        "api::daily-quest-progress.daily-quest-progress",
        progress.id,
        {
          data: {
            progress: 0,
            is_reward_claimed: false,
            is_completed: false,
            completed_date: null,
            ref_timestamp: today_timestamp,
          },
        }
      );
    },

    async verify(userId: number, progressId: number) {
      let progress = null;

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

      return progress;
    },

    // async verifyAll(userId: number) {
    //   // get all daily quests
    //   let progresses: any = [];

    //   await strapi.db.transaction(async () => {
    //     const dailyQuestProgresses = await strapi
    //       .service("api::daily-quest-progress.daily-quest-progress")
    //       .getTodayQuests(userId);

    //     const user = await strapi.entityService.findOne(
    //       "plugin::users-permissions.user",
    //       userId,
    //       {
    //         fields: ["id"],
    //       }
    //     );

    //     for (const dailyQuestProgress of dailyQuestProgresses) {
    //       let progress = null;

    //       if (!dailyQuestProgress.is_completed) {
    //         progress = await progressHandler.verify(user, dailyQuestProgress);
    //       }

    //       if (!progress) {
    //         progress = dailyQuestProgress;
    //       }

    //       progresses.push(progress);
    //     }
    //   });

    //   return progresses;
    // },

    async claimRewards(userId: number, progressId: number) {
      let results: any = null;

      await strapi.db.transaction(async () => {
        // TODO: need lock
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

export const progressDefaultOptions = {
  fields: ["progress", "is_completed", "is_reward_claimed", "completed_date"],
  populate: {
    daily_quest: {
      fields: ["qid", "total_progress", "name"],
      populate: {
        rewards: true,
        localizations: {
          fields: ["name", "locale"],
        },
      },
    },
  },
};

async function getDailyQuestProgresses(userId: number) {
  const now = new Date();
  const refTimestamp = (getRefTimestamp(now) / 1000) | 0;

  return await strapi.entityService.findMany(
    "api::daily-quest-progress.daily-quest-progress",
    {
      ...progressDefaultOptions,
      filters: {
        users_permissions_user: { id: userId },
        ref_timestamp: refTimestamp,
      },
    }
  );
}
