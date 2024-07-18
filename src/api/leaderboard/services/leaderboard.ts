/**
 * leaderboard service
 */
import { factories } from "@strapi/strapi";
import { RANKING_LIMIT } from "../../../constant";

export default factories.createCoreService(
  "api::leaderboard.leaderboard",
  ({ strapi }) => ({
    async getLeaderboard(name: string) {
      const leaderboard = (
        await strapi.entityService.findMany("api::leaderboard.leaderboard", {
          filters: {
            name,
          },
          fields: ["ranking", "date", "criteria", "ref_date"],
          populate: {
            records: {
              fields: ["ranking", "date"],
            },
          },
        })
      )[0];

      const now = new Date();

      if (!leaderboard) {
        if (name === "overall") {
          const ranking = await strapi
            .service("api::leaderboard.leaderboard")
            .getOverallRoomCompletionRankings(RANKING_LIMIT);

          await strapi.entityService.create("api::leaderboard.leaderboard", {
            data: {
              name,
              ranking,
              date: now,
              publishedAt: now,
            },
          });

          return true;
        } else if (name === "monthly") {
          await strapi.entityService.create("api::leaderboard.leaderboard", {
            data: {
              name,
              publishedAt: now,
            },
          });

          return true;
        }
      }

      return true;
    },

    async updateLeaderboard(name: string) {
      const leaderboard = (
        await strapi.entityService.findMany("api::leaderboard.leaderboard", {
          filters: {
            name,
          },
          fields: ["id"],
        })
      )[0];

      if (!leaderboard) {
        return false;
      }

      let ranking;

      if (name === "overall") {
        ranking = await strapi
          .service("api::leaderboard.leaderboard")
          .getOverallRoomCompletionRankings(RANKING_LIMIT);
      } else {
        // TEMP
        return false;
      }

      await strapi.entityService.update(
        "api::leaderboard.leaderboard",
        leaderboard.id,
        {
          data: {
            ranking,
            date: new Date(),
          },
        }
      );

      return true;
    },

    async getRoomCompletionRankings(roomId: number) {
      const options = {
        filters: {
          completed: true,
          room: { id: roomId },
        },
        fields: ["id", "completion_time"],
        populate: {
          user: {
            fields: ["username"],
          },
        },
        sort: "completion_time",
      };

      const userRooms = await strapi.entityService.findMany(
        "api::user-room.user-room",
        options
      );

      const list = userRooms.map((room) => ({
        id: room.user.id,
        username: room.user.username,
        completion_time: room.completion_time,
      }));

      return list;
    },

    async getRoomCompletionOrder(roomId: number) {
      const options = {
        filters: {
          completed: true,
          room: { id: roomId },
        },
        fields: ["id", "completion_time"],
        populate: {
          user: {
            fields: ["username"],
          },
        },
        sort: "duration",
      };

      const userRooms = await strapi.entityService.findMany(
        "api::user-room.user-room",
        options
      );

      const list = userRooms
        .map((room) => ({
          id: room.user.id,
          username: room.user.username,
          completion_time: room.completion_time,
        }))
        .sort(
          (a, b) =>
            new Date(a.completion_time).getTime() -
            new Date(b.completion_time).getTime()
        );

      return list;
    },

    async getOverallRoomCompletionRankings(limit: number = 10) {
      const rankings = Object.values(await getCollectStatus())
        .sort((a, b) => b.items_count - a.items_count)
        .sort((a, b) => b.completion_count - a.completion_count);

      return rankings.slice(0, limit);
    },

    async updateMonthlyRoomCompletionCriteria() {
      const leaderboard = (
        await strapi.entityService.findMany("api::leaderboard.leaderboard", {
          filters: {
            name: "monthly",
          },
          fields: ["criteria", "ref_date"],
          populate: {
            records: {
              fields: ["ranking", "date"],
            },
          },
        })
      )[0];

      if (!leaderboard) {
        return;
      }

      // count distinct items
      const newCriteria = await getCollectStatus();

      const now = new Date();
      const data: Partial<Leaderboard> = {
        criteria: newCriteria,
        ref_date: now,
      };

      if (leaderboard.criteria) {
        const rankings = rankByStatus(leaderboard.criteria, newCriteria);
        const lastRankings = rankings.slice(0, RANKING_LIMIT);
        data.records = [
          ...leaderboard.records,
          {
            ranking: lastRankings,
            date: leaderboard.ref_date,
          },
        ];
      }

      // update criteria to leaderboard
      return await strapi.entityService.update(
        "api::leaderboard.leaderboard",
        leaderboard.id,
        { data }
      );
    },

    async getMonthlyRoomCompletionRankings(limit: number = 10) {
      const leaderboard = (
        await strapi.entityService.findMany("api::leaderboard.leaderboard", {
          filters: {
            name: "monthly",
          },
          // 현재 ranking은 안 쓴다.
          fields: ["ranking", "criteria", "ref_date"],
        })
      )[0];

      if (!leaderboard) {
        return null;
      }

      const { criteria } = leaderboard;
      const newRanking = rankByStatus(criteria, await getCollectStatus());
      newRanking
        .sort((a, b) => b.items_count - a.items_count)
        .sort((a, b) => b.completion_count - a.completion_count);

      return {
        reference_date: leaderboard.ref_date,
        rankings: newRanking.slice(0, limit),
      };
    },

    async getOverallExpRankings(size: number = 30) {
      const rankings = await strapi.entityService.findMany(
        "api::status.status",
        {
          fields: ["exp", "level"],
          populate: {
            user: {
              fields: ["username"],
            },
          },
          sort: { exp: "desc" },
          limit: size,
        }
      );

      let prevRank = 0;
      let prevExp = null;
      for (let i = 0; i < rankings.length; i++) {
        const rank = rankings[i];

        if (rank.exp === prevExp) {
          rank.rank = prevRank;
        } else {
          rank.rank = i + 1;
          prevRank = rank.rank;
          prevExp = rank.exp;
        }
      }

      return rankings;
    },

    async getRankForOverallExp(userId: number): Promise<ExpRank> {
      const user = await strapi.entityService.findOne(
        "plugin::users-permissions.user",
        userId,
        {
          fields: ["username"],
          populate: {
            status: {
              fields: ["exp", "level"],
            },
          },
        }
      );

      const rank =
        (await strapi.db.query("api::status.status").count({
          where: {
            exp: {
              $gt: user.status.exp,
            },
          },
        })) + 1;

      return {
        exp: user.status.exp,
        level: user.status.level,
        user: {
          id: userId,
          username: user.username,
        },
        rank,
      };
    },

    // async getMonthlyExpRankings(page: number = 1, limit: number = 50) {

    // }
  })
);

async function getCollectStatus(): Promise<CollectionStatusByUser> {
  // get all user-rooms
  const userRooms = await strapi.entityService.findMany(
    "api::user-room.user-room",
    {
      fields: ["id", "owned_items", "completed", "completion_time"],
      populate: {
        user: {
          fields: ["username"],
        },
      },
    }
  );

  const list: { [id: number]: CollectionStatus } = userRooms.reduce(
    (acc, room: UserRoom) => {
      const userId = room.user.id;

      if (!acc[userId]) {
        acc[userId] = {
          id: userId,
          username: room.user.username,
          completion_count: 0,
          items_count: 0,
        };
      }
      // if (room.completed) 로 체크하지 않는 이유는
      // 이미 한 번 완성했던 적이 있는 사람은 카운팅에서 제외하기 위함이다
      if (room.completion_time !== null) {
        acc[userId].completion_count += 1;
      }
      // 여기서 filter를 하지 않는 이유는
      // 이미 한 번 해당 아이템을 소유했던 적이 있는 사람은 카운팅에서 제외하기 위함이다.
      acc[userId].items_count += Object.values(room.owned_items).length;
      // .filter( (v) => v > 0).length;

      return acc;
    },
    {}
  );

  return list;
}

function rankByStatus(
  criteria: CollectionStatusByUser,
  current: CollectionStatusByUser
): CollectionStatus[] {
  const users = Object.entries(current)
    .map(([id, status]) => ({
      ...status,
      completion_count:
        status.completion_count - (criteria[id]?.completion_count || 0),
      items_count: status.items_count - (criteria[id]?.items_count || 0),
    }))
    .filter((user) => user.completion_count > 0 || user.items_count > 0);

  return users;
}
