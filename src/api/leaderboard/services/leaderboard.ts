/**
 * leaderboard service
 */
import { factories } from "@strapi/strapi";

export default factories.createCoreService(
  "api::leaderboard.leaderboard",
  ({ strapi }) => ({
    async findRoomCompletionRankings(roomId: number) {
      const options = {
        filters: {
          completed: true,
          room: { id: roomId },
        },
        fields: ["id", "duration"],
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
          duration: room.duration,
        }))
        .sort((a, b) => a.duration - b.duration);

      return list;
    },

    async findRoomCompletionOrder(roomId: number) {
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

    async findOverallRoomCompletionRankings(limit: number = 20) {
      const options = {
        filters: {
          completed: true,
        },
        fields: ["id", "duration"],
        populate: {
          user: {
            fields: ["username"],
          },
        },
      };

      const userRooms = await strapi.entityService.findMany(
        "api::user-room.user-room",
        options
      );

      // reduce by user.id
      const list: { [id: number]: any[] } = userRooms.reduce((acc, room) => {
        if (!acc[room.user.id]) {
          acc[room.user.id] = [];
        }
        acc[room.user.id].push(room);
        return acc;
      }, {});

      const rankings = Object.entries(list)
        .map(([id, rooms]) => ({
          id,
          username: rooms[0].user.username,
          completion_count: rooms.length,
          duration: Math.round(
            rooms.reduce((acc, room) => acc + +room.duration, 0) / rooms.length
          ),
        }))
        .sort((a, b) => a.duration - b.duration)
        .sort((a, b) => b.completion_count - a.completion_count);

      return rankings.slice(0, limit);
    },
  })
);
