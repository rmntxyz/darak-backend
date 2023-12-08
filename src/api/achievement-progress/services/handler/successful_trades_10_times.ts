import { simpleProgressOptions } from "../achievement-progress";

async function verify(user: User, progress: AchievementProgress) {
  const { goal } = progress.achievement;

  const trades = await strapi.entityService.findMany("api::trade.trade", {
    filters: {
      $or: [{ proposer: { id: user.id } }, { partner: { id: user.id } }],
      status: "success",
    },
    populate: {
      history: true,
      proposer: true,
      partner: true,
    },
    start: 0,
    limit: goal,
  });

  const updatedProgresses = [];

  const count = trades.length;
  const { progress: currentProgress } = progress;

  if (count >= goal) {
    // latest date in trade history
    const latest = trades
      .map((trade) => trade.history[trade.history.length - 1])
      .sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0];

    const updated = await strapi.entityService.update(
      "api::achievement-progress.achievement-progress",
      progress.id,
      {
        ...simpleProgressOptions,
        data: {
          progress: goal,
          completed: true,
          completion_date: latest.date,
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
