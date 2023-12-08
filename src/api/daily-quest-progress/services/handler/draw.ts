import { getRefTimestamp } from "../../../../utils";
import { progressDefaultOptions } from "../daily-quest-progress";

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
    return quest;
  }

  let { id, current_draw, longest_draw, last_draw_date } = user.streak;

  const lastRefTimestamp = getRefTimestamp(last_draw_date);

  if (lastRefTimestamp === refTimestamp) {
    // 만약 퀘스트 완료는 했는데 보상을 받지 못한 경우에 생겼다고 가정한다.
    // claim_rewards가 실패한 경우가 해당된다.
    // is_completed 만 false로 변경하고 진입하면 여기로 들어오게 된다.
    // is_completed만 true로 변경시켜준다.
    // 그러면 이후에 claim_rewards가 실행될 것이다.
    return await strapi
      .service("api::daily-quest-progress.daily-quest-progress")
      .update(quest.id, {
        ...progressDefaultOptions,
        data: {
          is_completed: true,
        },
      });
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
      ...progressDefaultOptions,
      data: {
        progress: quest.progress + 1,
        is_completed: true,
        completed_date: now,
      },
    });
}

async function claimRewards(user: User, quest: DailyQuestProgress) {
  const { current_draw, longest_draw } = user.streak;
  const { streak_rewards } = quest.daily_quest;

  const { rewards } =
    streak_rewards[Math.min(current_draw, streak_rewards.length) - 1];

  return {
    streak: {
      type: "draw",
      current: current_draw,
      longest: longest_draw,
    },
    rewards,
  };
}

export default {
  verify,
  claimRewards,
};
