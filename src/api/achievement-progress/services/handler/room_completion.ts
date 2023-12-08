import { simpleProgressOptions } from "../achievement-progress";

async function verify(user: User, progress: AchievementProgress) {
  const userRooms = await strapi
    .service("api::user-room.user-room")
    .getUserRooms(user.id);

  const completed = userRooms
    .filter((userRoom) => userRoom.completed)
    .sort(
      (a, b) =>
        new Date(a.completion_time).getTime() -
        new Date(b.completion_time).getTime()
    );

  const completion_count = completed.length;

  const updatedProgresses = [];
  const { milestone_progresses } = progress;

  for (const sub of milestone_progresses) {
    if (sub.completed) {
      continue;
    }

    const { goal } = sub.achievement;
    const { progress: subProgress } = sub;

    if (completion_count >= goal) {
      const updated = await strapi.entityService.update(
        "api::achievement-progress.achievement-progress",
        sub.id,
        {
          ...simpleProgressOptions,
          data: {
            progress: goal,
            completed: true,
            completion_date: completed[goal - 1].completion_time,
          },
        }
      );

      updatedProgresses.push(updated);
    } else if (completion_count !== subProgress) {
      await strapi.entityService.update(
        "api::achievement-progress.achievement-progress",
        sub.id,
        {
          data: {
            progress: completion_count,
          },
        }
      );
    }
  }

  const { goal } = progress.achievement;
  const { progress: currentProgress } = progress;

  if (goal && completion_count >= goal) {
    // completed
    const updated = await strapi.entityService.update(
      "api::achievement-progress.achievement-progress",
      progress.id,
      {
        ...simpleProgressOptions,
        data: {
          progress: goal,
          completed: true,
          completion_date: completed[goal - 1].completion_time,
        },
      }
    );

    updatedProgresses.push(updated);
  } else if (completion_count !== currentProgress) {
    // not completed, but progress is updated
    await strapi.entityService.update(
      "api::achievement-progress.achievement-progress",
      progress.id,
      {
        data: {
          progress: completion_count,
        },
      }
    );
  }

  return updatedProgresses;
}

export default {
  verify,
};
