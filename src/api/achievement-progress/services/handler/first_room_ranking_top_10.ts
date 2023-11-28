import { simpleProgressOptions } from "../achievement-progress";

async function verify(user: User, progress: AchievementProgress) {
  const userRooms = await strapi
    .service("api::user-room.user-room")
    .getUserRooms(user.id);

  const roomIds = userRooms.map((userRoom) => userRoom.room.id);

  let verified = false;

  for (const roomId of roomIds) {
    const ranking = await strapi
      .service("api::leaderboard.leaderboard")
      .getRoomCompletionRankings(roomId);

    if (ranking.findIndex((rank) => rank.id === user.id) < 10) {
      verified = true;
      break;
    }
  }

  const now = new Date();

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
          completion_date: now,
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
