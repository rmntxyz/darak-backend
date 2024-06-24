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

  const max = userQuest.daily_quest.total_progress;
  const prev = userQuest.progress;
  const current = drawHistory.length;

  if (current === prev) {
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
