/**
 * achievement-progress service
 */

import { factories } from "@strapi/strapi";

import progressHandler from "./handler";

export default factories.createCoreService(
  "api::achievement-progress.achievement-progress",
  ({ strapi }) => ({
    async createAchievementProgress(userIds: number[]) {
      const achievements = await strapi.entityService.findMany(
        "api::achievement.achievement",
        {
          ...achievementOptions,
          filters: {
            publishedAt: { $ne: null },
            $or: [{ type: "general" }, { type: "milestone" }],
          },
        }
      );

      for (const userId of userIds) {
        const inProgresses = await strapi.entityService.findMany(
          "api::achievement-progress.achievement-progress",
          {
            ...progressOptions,
            filters: {
              user: { id: userId },
            },
          }
        );

        const progressMap = inProgresses.reduce((acc, progress) => {
          const aid = progress.achievement.aid;

          if (!acc[aid]) {
            acc[aid] = progress;
          }

          return acc;
        }, {});

        for (const achievement of achievements) {
          if (!progressMap[achievement.aid]) {
            const progress = await progressHandler.create(userId, achievement);
            progressMap[achievement.aid] = progress;
          } else {
            const progress = progressMap[achievement.aid];
            for (const milestone of achievement.milestones) {
              if (!progressMap[milestone.aid]) {
                const milestonProgress = await progressHandler.createMilestone(
                  userId,
                  progress,
                  milestone
                );

                progress.milestone_progresses.push(milestonProgress);
              }
            }
          }
        }
      }
    },

    async getAchievementList(userId: number) {
      const inProgresses = await strapi.entityService.findMany(
        "api::achievement-progress.achievement-progress",
        {
          ...progressOptions,
          filters: {
            user: { id: userId },
            achievement: {
              $or: [{ type: "general" }, { type: "milestone" }],
            },
          },
        }
      );

      const progressMap = inProgresses.reduce((acc, progress) => {
        const aid = progress.achievement.aid;

        if (!acc[aid]) {
          acc[aid] = progress;
        }

        return acc;
      }, {});

      return progressMap;
    },

    async getVerifiedList(userId: number) {
      await this.verifyAll(userId);
      return this.getAchievementList(userId);
    },

    async verify(userId: number, aid: number) {
      return await strapi.db.transaction(async () => {
        const progress = (
          await strapi.entityService.findMany(
            "api::achievement-progress.achievement-progress",
            {
              ...progressOptions,
              filters: {
                user: { id: userId },
                achievement: { aid },
              },
            }
          )
        )[0];

        if (!progress) {
          throw new Error("achievement progress not found");
        }

        if (!progress.completed) {
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

          const completed = await progressHandler.verify(user, progress);

          return completed;
        } else {
          return [];
        }
      });
    },

    async verifyAll(userId: number) {
      return await strapi.db.transaction(async () => {
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

        const progresses = await strapi.entityService.findMany(
          "api::achievement-progress.achievement-progress",
          {
            ...progressOptions,
            filters: {
              user: { id: userId },
              achievement: {
                $or: [{ type: "general" }, { type: "milestone" }],
              },
            },
          }
        );

        const completedList = [];

        for (const progress of progresses) {
          if (!progress.completed) {
            const completed = await progressHandler.verify(user, progress);

            if (completed.length > 0) {
              completedList.push(...completed);
            }
          }
        }

        return completedList;
      });
    },

    async claimRewards(userId: number, aid: number) {
      return await strapi.db.transaction(async () => {
        const progress = (
          await strapi.entityService.findMany(
            "api::achievement-progress.achievement-progress",
            {
              ...progressOptions,
              filters: {
                user: { id: userId },
                achievement: { aid },
              },
            }
          )
        )[0];

        if (!progress) {
          throw new Error("achievement progress not found");
        }

        if (!progress.completed) {
          throw new Error("not completed");
        }

        if (progress.reward_claimed) {
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
              star_point: true,
            },
          }
        );

        const collected = await progressHandler.collectRewards(user, progress);
        const rewards = collected.flatMap((col) => col.rewards);

        await strapi.service("api::reward.reward").claim(user, rewards);

        return rewards;
      });
    },

    claimAllRewards: async (userId: number) => {
      return await strapi.db.transaction(async () => {
        const progresses = await strapi.entityService.findMany(
          "api::achievement-progress.achievement-progress",
          {
            ...progressOptions,
            filters: {
              user: { id: userId },
              achievement: {
                $or: [{ type: "general" }, { type: "milestone" }],
              },
            },
          }
        );

        const user = await strapi.entityService.findOne(
          "plugin::users-permissions.user",
          userId,
          {
            fields: ["id"],
            populate: {
              streak: true,
              freebie: true,
              star_point: true,
            },
          }
        );

        const rewardList = [];

        for (const progress of progresses) {
          const collected = await progressHandler.collectRewards(
            user,
            progress
          );

          rewardList.push(...collected);
        }

        const rewords = rewardList.flatMap((col) => col.rewards);

        await strapi.service("api::reward.reward").claim(user, rewords);

        return rewardList;
      });
    },

    readStatus: async (progressId: number) => {
      return await strapi.entityService.update(
        "api::achievement-progress.achievement-progress",
        progressId,
        {
          ...simpleProgressOptions,
          data: {
            read: true,
          },
        }
      );
    },

    readAllStatus: async (userId: number) => {
      return await strapi.db.transaction(async () => {
        const results = [];
        const inProgresses = await strapi.entityService.findMany(
          "api::achievement-progress.achievement-progress",
          {
            ...progressOptions,
            filters: {
              user: { id: userId },
            },
          }
        );

        for (const progress of inProgresses) {
          if (progress.completed && !progress.read) {
            const result = await strapi
              .service("api::achievement-progress.achievement-progress")
              .readStatus(progress.id);

            results.push(result);
          }
        }

        return results;
      });
    },
  })
);

export const achievementOptions = {
  fields: ["aid", "goal", "title", "desc", "type"],
  populate: {
    badge: {
      fields: ["name", "desc"],
      populate: {
        image: {
          fields: ["url"],
        },
      },
    },
    milestones: {
      fields: ["aid", "goal", "title", "desc"],
    },
    rewards: {
      fields: ["type", "amount"],
      populate: {
        item: {
          fields: ["name", "rarity", "desc", "current_serial_number"],
          populate: {
            thumbnail: {
              fields: ["url"],
            },
            room: {
              fields: ["name"],
            },
          },
        },
      },
    },
  },
};

export const simpleProgressOptions = {
  fields: [
    "progress",
    "completed",
    "reward_claimed",
    "completion_date",
    "read",
  ],
  populate: {
    achievement: achievementOptions,
  },
};

export const progressOptions = {
  fields: [
    "progress",
    "completed",
    "reward_claimed",
    "completion_date",
    "read",
  ],
  populate: {
    milestone_progresses: {
      fields: ["progress", "completed", "reward_claimed", "completion_date"],
      populate: {
        achievement: achievementOptions,
      },
    },
    achievement: {
      fields: achievementOptions.fields,
      populate: {
        ...achievementOptions.populate,
        milestones: achievementOptions,
      },
    },
  },
};
