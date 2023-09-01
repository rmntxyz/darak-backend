/**
 * daily-quest-progress service
 */

import { factories } from "@strapi/strapi";
import { getRefTimestamp } from "../../../utils";
import verifier from "./verifier";

export default factories.createCoreService(
  "api::daily-quest-progress.daily-quest-progress",
  ({ strapi }) => ({
    async getTodayQuest(userId: number) {
      const now = new Date();
      const refTimestamp = getRefTimestamp(now);

      const inProgresses = await strapi.entityService.findMany(
        "api::daily-quest-progress.daily-quest-progress",
        {
          populate: ["daily_quest"],
          filters: {
            users_permissions_user: { id: userId },
            createdAt: { $gte: new Date(refTimestamp).toISOString() },
          },
        }
      );

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
              publishedAt: now,
            },
          }
        );

        // 쿼리 한 결과랑 같은 폼을 만들어 준다.
        quests.push({ ...quest, daily_quest: dailyQuest });
      }

      return quests;
    },

    async verifyDailyQuest(user: User) {
      // get all daily quests
      const dailyQuests = await strapi.db
        .query("api::daily-quest.daily-quest")
        .findMany({});

      console.log(dailyQuests);

      const progresses = [];

      for (const dailyQuest of dailyQuests) {
        const { qid } = dailyQuest;

        switch (qid) {
          case "login":
            // const result = await verifyLogin(dailyQuest, user);
            // progresses.push(result);
            break;
          default:
            break;
        }
      }

      return progresses;
    },

    async claimRewards(user: User) {},
  })
);
