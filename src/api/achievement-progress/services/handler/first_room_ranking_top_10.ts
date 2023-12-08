import { simpleProgressOptions } from "../achievement-progress";

async function verify(user: User, progress: AchievementProgress) {
  const userRooms = await strapi
    .service("api::user-room.user-room")
    .getUserRooms(user.id);

  const filtered = userRooms
    .filter((r) => r.completion_time && r.completion_time !== null)
    .map((r) => ({
      roomId: r.room.id,
      completion_time: r.completion_time,
    }));

  let verified = false;
  let minCompletionTime = new Date().getTime();

  for (const { roomId, completion_time } of filtered) {
    const ranking = await strapi
      .service("api::leaderboard.leaderboard")
      .getRoomCompletionRankings(roomId);

    if (ranking.findIndex((rank) => rank.id === user.id) < 10) {
      verified = true;
      minCompletionTime = Math.min(
        minCompletionTime,
        new Date(completion_time).getTime()
      );
    }
  }

  const updatedProgresses = [];

  if (verified) {
    const updated = await strapi.entityService.update(
      "api::achievement-progress.achievement-progress",
      progress.id,
      {
        ...simpleProgressOptions,
        data: {
          progress: 1,
          completed: true,
          completion_date: minCompletionTime,
        },
      }
    );

    updatedProgresses.push(updated);
  }

  return updatedProgresses;
}

export default {
  verify,
};
