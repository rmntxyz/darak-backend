import { simpleProgressOptions } from "../achievement-progress";

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
    const { progress: subProgress } = sub;

    if (longest_draw >= goal) {
      const updated = await strapi.entityService.update(
        "api::achievement-progress.achievement-progress",
        sub.id,
        {
          ...simpleProgressOptions,
          data: {
            progress: goal,
            completed: true,
            completion_date: now,
          },
        }
      );

      updatedProgresses.push(updated);
    } else if (longest_draw !== subProgress) {
      await strapi.entityService.update(
        "api::achievement-progress.achievement-progress",
        sub.id,
        {
          data: {
            progress: longest_draw,
          },
        }
      );
    }
  }

  const { goal } = progress.achievement;
  const { progress: currentProgress } = progress;

  if (goal && longest_draw >= goal) {
    // completed
    const updated = await strapi.entityService.update(
      "api::achievement-progress.achievement-progress",
      progress.id,
      {
        ...simpleProgressOptions,
        data: {
          progress: goal,
          completed: true,
          completion_date: now,
        },
      }
    );

    updatedProgresses.push(updated);
  } else if (longest_draw !== currentProgress) {
    // not completed, but progress is updated
    await strapi.entityService.update(
      "api::achievement-progress.achievement-progress",
      progress.id,
      {
        data: {
          progress: longest_draw,
        },
      }
    );
  }

  return updatedProgresses;
}

export default {
  verify,
};
