import { RANKING_LIMIT } from "../../../../constant";

export default {
  update: async (userRoom: UserRoom) => {
    // check room completion order and create platform activity
    await updateRoomCompletion(userRoom);

    // check overall room completion ranking and create platform activity
    await updateOverallRanking();

    return;
  },
};

async function updateRoomCompletion(userRoom: UserRoom) {
  const { user, room, completion_time } = userRoom;

  // create platform activity for completion
  if (userRoom.completed) {
    const list = await strapi
      .service("api::leaderboard.leaderboard")
      .findRoomCompletionOrder(room.id);
    const order = list.findIndex((item) => item.id === user.id) + 1;

    return strapi.entityService.create("api::activity.activity", {
      data: {
        category: "platform",
        type: "room_completion",
        user,
        room,
        detail: { order, completion_time },
        publishedAt: new Date(),
      },
    });
  }
}

export async function updateOverallRanking() {
  const overallRanking = await strapi
    .service("api::leaderboard.leaderboard")
    .findOverallRoomCompletionRankings(RANKING_LIMIT);

  const leaderboard = (
    await strapi.entityService.findMany("api::leaderboard.leaderboard", {
      filters: {
        name: "overall",
      },
      fields: ["ranking", "date"],
      populate: {
        records: {
          fields: ["ranking", "date"],
        },
      },
    })
  )[0];

  const current = leaderboard.ranking.map((list, idx) => ({
    ...list,
    rank: idx + 1,
  }));
  const updated = overallRanking.map((list, idx) => ({
    ...list,
    rank: idx + 1,
  }));

  const { rankups, newcomers } = compareRankings(current, updated);

  // create platform activity for rankups
  for (const rankup of rankups) {
    const prevRank = current.find((item) => item.id === rankup.id).rank;

    await strapi.entityService.create("api::activity.activity", {
      data: {
        category: "platform",
        type: "rank_up",
        user: { id: rankup.id },
        detail: {
          from: prevRank,
          to: rankup.rank,
        },
        publishedAt: new Date(),
      },
    });
  }

  // create platform activity for newcomers
  for (const newcomer of newcomers) {
    await strapi.entityService.create("api::activity.activity", {
      data: {
        category: "platform",
        type: "newcomer",
        user: { id: newcomer.id },
        detail: { rank: newcomer.rank },
        publishedAt: new Date(),
      },
    });
  }

  if (rankups.length !== 0 || newcomers.length !== 0) {
    // update leaderboard
    await strapi.entityService.update(
      "api::leaderboard.leaderboard",
      leaderboard.id,
      {
        data: {
          ranking: overallRanking,
          date: new Date(),
          records: [
            ...leaderboard.records,
            {
              ranking: leaderboard.ranking,
              date: leaderboard.date,
            },
          ],
        },
        fields: ["ranking", "date"],
        populate: {
          records: {
            fields: ["ranking", "date"],
          },
        },
      }
    );
  }
}

function compareRankings(current: Ranking, updated: Ranking) {
  // not in current and in updated
  const newcomers = updated.filter(
    (item) => !current.find((currentItem) => currentItem.id === item.id)
  );

  // in current but rank up
  const rankups = updated.filter((updatedItem) => {
    const item = current.find((item) => updatedItem.id === item.id);
    return item && updatedItem.rank < item.rank;
  });

  return {
    newcomers,
    rankups,
  };
}
