import { getRefTimestamp } from "../../../../utils";

export default async function (user: User, quest: DailyQuestProgress) {
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
  } else {
    current_streak = 1;
  }

  longest_streak = Math.max(current_streak, longest_streak);

  await strapi.service("api::streak.streak").update(id, {
    data: {
      current_streak,
      longest_streak,
      last_login_date: now,
    },
  });

  const q = await strapi
    .service("api::daily-quest-progress.daily-quest-progress")
    .update(quest.id, {
      data: {
        progress: quest.progress + 1,
        is_completed: true,
        completed_date: now,
      },
    });

  quest.is_completed = true;
  quest.completed_date = now;
}
