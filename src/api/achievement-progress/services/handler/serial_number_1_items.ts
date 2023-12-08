import { simpleProgressOptions } from "../achievement-progress";

async function verify(user: User, progress: AchievementProgress) {
  const userItems = await strapi.entityService.findMany(
    "api::inventory.inventory",
    {
      fields: ["updatedAt"],
      filters: {
        serial_number: 1,
        users_permissions_user: { id: user.id },
        item: { $or: [{ rarity: "rare" }, { rarity: "unique" }] },
      },
      sort: "updatedAt",
      start: 0,
      limit: progress.achievement.goal,
    }
  );

  const count = userItems.length;

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
          completion_date: userItems[goal - 1].updatedAt,
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
