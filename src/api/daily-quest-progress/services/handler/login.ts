import { getRefTimestamp } from "../../../../utils";

async function verify(user: User, quest: DailyQuestProgress) {
  let { id, current_login, longest_login, last_login_date } = user.streak;

  const now = new Date();
  const lastRefTimestamp = getRefTimestamp(last_login_date);
  const refTimestamp = getRefTimestamp(now);

  if (lastRefTimestamp === refTimestamp) {
    throw new Error("already login today");
  }

  if (lastRefTimestamp === refTimestamp - 86400000) {
    current_login += 1;
  } else {
    current_login = 1;
  }

  longest_login = Math.max(current_login, longest_login);

  await strapi.service("api::streak.streak").update(id, {
    data: {
      current_login,
      longest_login,
      last_login_date: now,
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
  const { current_login, longest_login } = user.streak;
  const { streak_rewards } = quest.daily_quest;

  const { rewards } =
    streak_rewards[Math.min(current_login, streak_rewards.length) - 1];

  return {
    streak: {
      type: "login",
      current: current_login,
      longest: longest_login,
    },
    rewards,
  };
}

export default {
  verify,
  claimRewards,
};
