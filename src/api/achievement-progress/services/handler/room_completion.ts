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

    if (completion_count >= goal) {
      const updated = await strapi.entityService.update(
        "api::achievement-progress.achievement-progress",
        sub.id,
        {
          data: {
            completed: true,
            completed_date: now,
          },
        }
      );

      updatedProgresses.push(updated);
    } else {
      break;
    }
  }

  const { goal } = progress.achievement;

  if (goal && completion_count >= goal) {
    const updated = await strapi.entityService.update(
      "api::achievement-progress.achievement-progress",
      progress.id,
      {
        data: {
          completed: true,
          completed_date: now,
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
