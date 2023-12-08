import { simpleProgressOptions } from "../achievement-progress";

async function verify(user: User, progress: AchievementProgress) {
  const histories = await strapi.entityService.findMany(
    "api::star-point-history.star-point-history",
    {
      filters: {
        star_point: {
          user: { id: user.id },
        },
        detail: "item_sale",
      },
      sort: "createdAt",
      start: 0,
      limit: progress.achievement.goal,
    }
  );

  const count = histories.flatMap((history) => history.inventories).length;

  const updatedProgresses = [];

  const { goal } = progress.achievement;
  const { progress: currentProgress } = progress;

  if (count >= goal) {
    const updated = await strapi.entityService.update(
      "api::achievement-progress.achievement-progress",
      progress.id,
      {
        ...simpleProgressOptions,
        data: {
          progress: goal,
          completed: true,
          completion_date: histories[goal - 1].createdAt,
        },
      }
    );

    updatedProgresses.push(updated);
  } else if (count > currentProgress) {
    await strapi.entityService.update(
      "api::achievement-progress.achievement-progress",
      progress.id,
      {
        data: {
          progress: count,
        },
      }
    );
  }

  return updatedProgresses;
}

export default {
  verify,
};
