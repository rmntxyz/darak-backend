import { getRefTimestamp } from "../../../../utils";
import { progressDefaultOptions } from "../daily-quest-progress";

async function verify(user: User, userQuest: DailyQuestProgress) {
  const now = new Date();
  const refTimestamp = getRefTimestamp(now);

  // check today's draw history
  const drawHistory = await strapi.entityService.findMany(
    "api::draw-history.draw-history",
    {
      start: 0,
      limit: 5,
      filters: {
        users_permissions_user: { id: user.id },
        createdAt: { $gte: new Date(refTimestamp).toISOString() },
      },
    }
  );

  const itemHistory = await strapi.entityService.findMany(
    "api::item-acquisition-history.item-acquisition-history",
    {
      start: 0,
      limit: 5,
      filters: {
        user: { id: user.id },
        type: "gacha_result",
        createdAt: { $gte: new Date(refTimestamp).toISOString() },
      },
    }
  );

  const max = userQuest.daily_quest.total_progress;
  const prev = userQuest.progress;
  const current = drawHistory.length + itemHistory.length;

  if (current === prev) {
    return userQuest;
  }

  let data;

  if (current < max) {
    data = {
      progress: current,
    };
  } else {
    data = {
      progress: max,
      is_completed: true,
      completed_date: now,
    };
  }

  return await strapi
    .service("api::daily-quest-progress.daily-quest-progress")
    .update(userQuest.id, {
      ...progressDefaultOptions,
      data,
    });
}

async function claimRewards(user: User, userQuest: DailyQuestProgress) {
  if (!userQuest.is_completed) {
    throw new Error("Quest is not completed yet");
  }

  if (userQuest.is_reward_claimed) {
    throw new Error("Rewards already claimed");
  }

  const { rewards } = userQuest.daily_quest;

  await strapi
    .service("api::reward.reward")
    .claim(user.id, rewards, "daily_quest_reward");

  return rewards;
}

export default {
  verify,
  claimRewards,
};
