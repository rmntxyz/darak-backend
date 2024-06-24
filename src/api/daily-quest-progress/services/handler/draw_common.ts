import { getRefTimestamp } from "../../../../utils";
import { progressDefaultOptions } from "../daily-quest-progress";

async function verify(userId: number, userQuest: DailyQuestProgress) {
  const now = new Date();
  const refTimestamp = getRefTimestamp(now);
  const max = userQuest.daily_quest.total_progress;

  const itemHistory = await strapi.entityService.findMany(
    "api::item-acquisition-history.item-acquisition-history",
    {
      start: 0,
      limit: max,
      filters: {
        user: { id: userId },
        type: "gacha_result",
        items: { rarity: "common" },
        createdAt: { $gte: new Date(refTimestamp).toISOString() },
      },
      populate: {
        items: true,
      },
    }
  );

  const prev = userQuest.progress;
  const current = itemHistory.length;

  if (current !== max && current === prev) {
    return userQuest;
  }

  let data;

  if (current < max) {
    // 만약 progress가 max보다 작으면 progress를 업데이트
    data = {
      progress: current,
    };
  } else {
    // 만약 progress가 max랑 같으면 quest를 완료로 변경
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

export default {
  verify,
};
