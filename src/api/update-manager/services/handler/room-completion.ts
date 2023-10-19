const RANKING_LIMIT = 5;

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
  const { user, room } = userRoom;

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
        detail: { order },
        publishedAt: new Date(),
      },
    });
  }
}

async function updateOverallRanking() {
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

  if (!leaderboard) {
    await strapi.entityService.create("api::leaderboard.leaderboard", {
      data: {
        name: "overall",
        ranking: overallRanking,
        date: new Date(),
        publishedAt: new Date(),
      },
      fields: ["ranking", "date"],
      populate: {
        records: {
          fields: ["ranking", "date"],
        },
      },
    });

    return;
  }

  const current = leaderboard.ranking;
  const updated = overallRanking;

  const { rankups, newcomers } = compareRankings(current, updated);

  // create platform activity for rankups
  for (const rankup of rankups) {
    const prevRank = current.findIndex((item) => item.id === rankup.id) + 1;

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
          ranking: updated,
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
  const currWithRank = current.map((list, idx) => ({ ...list, rank: idx + 1 }));
  const updatedWithRank = updated.map((list, idx) => ({
    ...list,
    rank: idx + 1,
  }));

  // not in current and in updated
  const newcomers = updatedWithRank.filter(
    (item) => !currWithRank.find((currentItem) => currentItem.id === item.id)
  );

  // in current but rank up
  const rankups = currWithRank.filter((item) => {
    const updatedItem = updatedWithRank.find(
      (updatedItem) => updatedItem.id === item.id
    );
    return updatedItem && updatedItem.rank < item.rank;
  });

  return {
    newcomers,
    rankups,
  };
}
