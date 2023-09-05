import { getRefTimestamp } from "../../../../utils";

async function verify(user: User, quest: DailyQuestProgress) {
  const now = new Date();
  const refTimestamp = getRefTimestamp(now);

  // check today's draw history
  const history = await strapi.entityService.findMany(
    "api::draw-history.draw-history",
    {
      start: 0,
      limit: 1,
      filters: {
        users_permissions_user: { id: user.id },
        createdAt: { $gte: new Date(refTimestamp).toISOString() },
      },
    }
  );

  if (history.length === 0) {
    return null;
  }

  let { id, current_draw, longest_draw, last_draw_date } = user.streak;

  const lastRefTimestamp = getRefTimestamp(last_draw_date);

  if (lastRefTimestamp === refTimestamp) {
    throw new Error("already draw today");
  }

  if (lastRefTimestamp === refTimestamp - 86400000) {
    current_draw += 1;
  } else {
    current_draw = 1;
  }

  longest_draw = Math.max(current_draw, longest_draw);

  await strapi.service("api::streak.streak").update(id, {
    data: {
      current_draw,
      longest_draw,
      last_draw_date: now,
    },
  });

  return await strapi
    .service("api::daily-quest-progress.daily-quest-progress")
    .update(quest.id, {
      data: {
        progress: quest.progress + 1,
        is_completed: true,
        completed_date: now,
      },
    });
}

async function claimRewards(user: User, quest: DailyQuestProgress) {
  const { current_draw } = user.streak;
  const { streak_rewards } = quest.daily_quest;

  const { rewards } =
    streak_rewards[Math.min(current_draw, streak_rewards.length) - 1];

  return {
    streak: {
      type: "draw",
      current: current_draw,
    },
    rewards,
  };
}

export default {
  verify,
  claimRewards,
};
