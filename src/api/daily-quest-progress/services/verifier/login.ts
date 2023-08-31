import { getRefTimestamp } from "../../../../utils";

export default async function (quest: DailyQuest, user: User) {
  const { streak } = user;
  let { id, current_streak, longest_streak, last_login_date } = streak;

  const now = new Date();
  const lastRefTimestamp = getRefTimestamp(last_login_date);
  const refTimestamp = getRefTimestamp(now);

  if (lastRefTimestamp === refTimestamp) {
    return;
  }

  if (lastRefTimestamp === refTimestamp - 86400000) {
    // 86400000 = 24 * 60 * 60 * 1000 = 1 day
    current_streak += 1;
    longest_streak = Math.max(current_streak, longest_streak);
  } else {
    current_streak = 1;
  }

  await strapi.service("api::streak.streak").update(id, {
    data: {
      current_streak,
      longest_streak,
      last_login_date: now,
    },
  });

  // create new daily quest progress
  return await strapi.entityService.create(
    "api::daily-quest-progress.daily-quest-progress",
    {
      daily_quest: quest,
      progress: 1,
      is_reward_claimed: false,
      is_completed: true,
      completed_date: now,
      users_permissions_user: {
        id: user.id,
      },
    }
  );
}
