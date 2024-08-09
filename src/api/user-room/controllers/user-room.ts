/**
 * user-room controller
 */

import { factories } from "@strapi/strapi";
import { applyLocalizations } from "../../../utils";

export default factories.createCoreController(
  "api::user-room.user-room",
  ({ strapi }) => ({
    "unlock-room": async (ctx) => {
      const userId = ctx.state.user?.id;

      if (!userId) {
        return ctx.unauthorized("user is not authenticated");
      }

      const { roomId } = ctx.request.body;

      if (!roomId) {
        return ctx.badRequest("roomId is required");
      }

      try {
        return await strapi
          .service("api::user-room.user-room")
          .unlockRoom(userId, roomId);
      } catch (error) {
        return ctx.badRequest(error.message);
      }
    },

    "is-initial-completion": async (ctx) => {
      const userId = ctx.state.user?.id;

      if (!userId) {
        return ctx.unauthorized("user is not authenticated");
      }

      const roomId = ctx.params.roomId;

      if (!roomId) {
        const userRooms = await strapi
          .service("api::user-room.user-room")
          .getUserRooms(userId);

        const filtered = userRooms.filter((userRoom) => {
          const { completed, initial_completion_checked } = userRoom;
          return completed && !initial_completion_checked;
        });

        if (filtered.length === 0) {
          return [];
        }

        //localizations
        const { locale } = ctx.query;

        filtered.forEach((userRoom) => {
          applyLocalizations(userRoom.room, locale);
        });

        await strapi.db.query("api::user-room.user-room").updateMany({
          where: {
            id: filtered.map((userRoom) => userRoom.id),
          },
          data: {
            initial_completion_checked: true,
          },
        });

        await Promise.all(
          filtered.map((userRoom) =>
            strapi
              .service("api::reward.reward")
              .claim(userId, userRoom.room.complete_rewards, "room_complete")
          )
        );

        const result = filtered.map((userRoom) => ({
          id: userRoom.room.id,
          name: userRoom.room.name,
          rid: userRoom.room.rid,
          image_complete: userRoom.room.image_complete.url,
          rewards: userRoom.room.complete_rewards,
        }));

        return result;
      } else {
        const userRoom = await strapi
          .service("api::user-room.user-room")
          .getUserRoom(userId, roomId, false);

        if (!userRoom) {
          return [];
        }

        const { id, completed, initial_completion_checked } = userRoom;

        const isInitalCompletion = completed && !initial_completion_checked;

        if (!isInitalCompletion) {
          return [];
        }

        await strapi.entityService.update("api::user-room.user-room", id, {
          data: {
            initial_completion_checked: true,
          },
        });

        await strapi
          .service("api::reward.reward")
          .claim(userId, userRoom.room.complete_rewards, "room_complete");

        //localizations
        const { locale } = ctx.query;
        applyLocalizations(userRoom.room, locale);

        return [
          {
            id: userRoom.room.id,
            name: userRoom.room.name,
            rid: userRoom.room.rid,
            image_complete: userRoom.room.image_complete.url,
            rewards: userRoom.room.complete_rewards,
          },
        ];
      }
    },
  })
);
