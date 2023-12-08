import { getRefTimestamp } from "../../../../utils";
import { simpleProgressOptions } from "../achievement-progress";

async function verify(user: User, progress: AchievementProgress) {
  const { longest_draw } = user.streak;

  const updatedProgresses = [];
  const { milestone_progresses } = progress;

  const completed = await strapi.entityService.findMany(
    "api::daily-quest-progress.daily-quest-progress",
    {
      fields: ["completed_date"],
      filters: {
        users_permissions_user: { id: user.id },
        is_completed: true,
        daily_quest: { id: 2 },
      },
    }
  );

  const streakHistory = [];
  let streakCount = 1;

  for (let i = 0; i < completed.length; i++) {
    const current = completed[i];
    const next = completed[i + 1];

    const currStamp = getRefTimestamp(current.completed_date);
    const nextStamp = next ? getRefTimestamp(next.completed_date) : null;

    if (nextStamp && nextStamp - currStamp === 86400000) {
      streakCount++;
    } else {
      streakHistory.push({ start_idx: i - streakCount + 1, streakCount });
      streakCount = 1;
    }
  }

  for (const sub of milestone_progresses) {
    if (sub.completed) {
      continue;
    }

    const { goal } = sub.achievement;
    const { progress: subProgress } = sub;

    if (longest_draw >= goal) {
      // find streak range on streakHistory
      const range =
        streakHistory.find((range) => range.streakCount >= goal) ||
        streakHistory[0];

      const { start_idx } = range;
      const { completed_date } = completed[start_idx + goal - 1];

      const updated = await strapi.entityService.update(
        "api::achievement-progress.achievement-progress",
        sub.id,
        {
          ...simpleProgressOptions,
          data: {
            progress: goal,
            completed: true,
            completion_date: completed_date,
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
    // find streak range on streakHistory
    const range =
      streakHistory.find((range) => range.streakCount >= goal) ||
      streakHistory[0];

    const { start_idx } = range;
    const { completed_date } = completed[start_idx + goal - 1];

    // completed
    const updated = await strapi.entityService.update(
      "api::achievement-progress.achievement-progress",
      progress.id,
      {
        ...simpleProgressOptions,
        data: {
          progress: goal,
          completed: true,
          completion_date: completed_date,
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
