import streak from "./streak";
import { simpleProgressOptions } from "../achievement-progress";

const Handler = { streak };

export default {
  create: async (userId: number, achievement: Achievement) => {
    const { aid } = achievement;
    const handler = Handler[aid];

    if (!handler) {
      return null;
    }

    return await handler.create(userId, achievement);
  },

  createMilestone: async (
    userId: number,
    parent: AchievementProgress,
    milestone: Achievement
  ) => {
    const { aid } = parent.achievement;
    const handler = Handler[aid];

    if (!handler) {
      return null;
    }

    return await handler.createMilestone(userId, milestone.id, parent.id);
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
    const { aid } = progress.achievement;
    const handler = Handler[aid];

    if (!handler) {
      return null;
    }

    await handler.claimRewards(user, progress);

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
