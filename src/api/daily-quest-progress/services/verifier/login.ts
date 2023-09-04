import { getRefTimestamp } from "../../../../utils";

export default async function (userId: number, quest: DailyQuestProgress) {
  const now = new Date();
  const refTimestamp = getRefTimestamp(now);

  // check today's draw history
  const history = await strapi.entityService.findMany(
    "api::draw-history.draw-history",
    {
      filters: {
        users_permissions_user: { id: userId },
        createdAt: { $gte: new Date(refTimestamp).toISOString() },
      },
    }
  );

  if (history.length === 0) {
    return null;
  }

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
