import {
  progressOptions,
  simpleProgressOptions,
} from "../achievement-progress";

async function create(userId: number, achievement: Achievement) {
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
}

async function createMilestone(
  userId: number,
  achievementId: number,
  parentProgressId: number
) {
  return strapi.entityService.create(
    "api::achievement-progress.achievement-progress",
    {
      ...simpleProgressOptions,
      data: {
        progress: 0,
        reward_claimed: false,
        completed: false,
        user: { id: userId },
        achievement: { id: achievementId },
        belongs_to: { id: parentProgressId },
        publishedAt: new Date(),
      },
    }
  );
}

async function verify(user: User, progress: AchievementProgress) {
  const { longest_draw } = user.streak;
  const now = new Date();

  const updatedProgresses = [];
  const { milestone_progresses } = progress;

  for (const sub of milestone_progresses) {
    if (sub.completed) {
      continue;
    }

    const { goal } = sub.achievement;

    if (longest_draw >= goal) {
      const updated = await strapi.entityService.update(
        "api::achievement-progress.achievement-progress",
        sub.id,
        {
          ...simpleProgressOptions,
          data: {
            completed: true,
            completion_date: now,
          },
        }
      );

      updatedProgresses.push(updated);
    }
  }

  const { goal } = progress.achievement;

  if (goal && longest_draw >= goal) {
    const updated = await strapi.entityService.update(
      "api::achievement-progress.achievement-progress",
      progress.id,
      {
        ...simpleProgressOptions,
        data: {
          completed: true,
          completion_date: now,
        },
      }
    );

    updatedProgresses.push(updated);
  }

  return updatedProgresses;
}

async function claimRewards(userId: number, progress: AchievementProgress) {}

export default {
  create,
  createMilestone,
  verify,
  claimRewards,
};
