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

export default {
  verify,
};
