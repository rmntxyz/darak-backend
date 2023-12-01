import { simpleProgressOptions } from "../achievement-progress";

async function verify(user: User, progress: AchievementProgress) {
  const count = await strapi.db.query("api::trade.trade").count({
    where: {
      $or: [{ proposer: { id: user.id } }, { partner: { id: user.id } }],
      status: "success",
    },
  });

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
