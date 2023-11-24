import streak from "./streak";
import {
  simpleProgressOptions,
  progressOptions,
} from "../achievement-progress";

const Handler = { streak };

export default {
  create: async (userId: number, achievement: Achievement) => {
    const milestone_progresses = [];
    for (const milestone of achievement.milestones) {
      const { id } = await strapi.entityService.create(
        "api::achievement-progress.achievement-progress",
        {
          data: {
            progress: 0,
            reward_claimed: false,
            completed: false,
            user: { id: userId },
            achievement: { id: milestone.id },
            publishedAt: new Date(),
          },
        }
      );

      milestone_progresses.push(id);
    }

    return strapi.entityService.create(
      "api::achievement-progress.achievement-progress",
      {
        ...progressOptions,
        data: {
          progress: 0,
          reward_claimed: false,
          completed: false,
          user: { id: userId },
          achievement: { id: achievement.id },
          milestone_progresses,
          publishedAt: new Date(),
        },
      }
    );
  },

  createMilestone: async (
    userId: number,
    parent: AchievementProgress,
    milestone: Achievement
  ) => {
    return strapi.entityService.create(
      "api::achievement-progress.achievement-progress",
      {
        ...simpleProgressOptions,
        data: {
          progress: 0,
          reward_claimed: false,
          completed: false,
          user: { id: userId },
          achievement: { id: milestone.id },
          belongs_to: { id: parent.id },
          publishedAt: new Date(),
        },
      }
    );
  },

  verify: async (user: User, progress: AchievementProgress) => {
    const { aid } = progress.achievement;
    const handler = Handler[aid];

    if (!handler) {
      return null;
    }

    return await handler.verify(user, progress);
  },

  claimRewards: async (user: User, progress: AchievementProgress) => {
    const now = new Date();

    const rewardList = [];
    const { milestone_progresses, completed, reward_claimed } = progress;

    for (const sub of milestone_progresses) {
      if (!sub.completed || sub.reward_claimed) {
        continue;
      }

      const updated = await strapi.entityService.update(
        "api::achievement-progress.achievement-progress",
        sub.id,
        {
          ...simpleProgressOptions,
          data: {
            reward_claimed: true,
            reward_claim_date: now,
          },
        }
      );

      const { rewards } = sub.achievement;
      rewardList.push(...rewards);
    }

    if (completed && !reward_claimed) {
      const updated = await strapi.entityService.update(
        "api::achievement-progress.achievement-progress",
        progress.id,
        {
          ...simpleProgressOptions,
          data: {
            reward_claimed: true,
            reward_claim_date: now,
          },
        }
      );

      const { rewards } = progress.achievement;
      rewardList.push(...rewards);
    }

    return rewardList;
  },
};
