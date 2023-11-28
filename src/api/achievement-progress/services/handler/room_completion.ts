import { simpleProgressOptions } from "../achievement-progress";

async function verify(user: User, progress: AchievementProgress) {
  const userRooms = await strapi
    .service("api::user-room.user-room")
    .getUserRooms(user.id);
  const completion_count = userRooms.filter(
    (userRoom) => userRoom.completed
  ).length;
  const now = new Date();

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
            completion_date: now,
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
          completion_date: now,
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
