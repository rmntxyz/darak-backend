import { simpleProgressOptions } from "../achievement-progress";

async function verify(user: User, progress: AchievementProgress) {
  const histories = await strapi.db
    .query("api::star-point-history.star-point-history")
    .findMany({
      where: {
        star_point: {
          user: { id: user.id },
        },
        detail: "item_sale",
      },
    });

  const count = histories.flatMap((history) => history.inventories).length;

  const now = new Date();

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
          completion_date: now,
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
