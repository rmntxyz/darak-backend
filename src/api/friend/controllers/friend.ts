/**
 * A set of functions called "actions" for `friend`
 */

import { ErrorCode, MAX_FRIENDS } from "../../../constant";
import fs from "fs";
export default {
  list: async (ctx) => {
    const userId = ctx.state.user.id;

    return strapi.service("api::friend.friend").getFriends(userId);
  },

  listWithRequests: async (ctx) => {
    const userId = ctx.state.user.id;

    const friends = await strapi
      .service("api::friend.friend")
      .getFriends(userId);
    const requests = await strapi
      .service("api::friend.friend")
      .getRequests(userId);

    return {
      friends,
      requests,
    };
  },

  request: async (ctx) => {
    const { to } = ctx.request.body;
    const userId = ctx.state.user.id;

    try {
      if (!to) {
        throw ErrorCode.INVALID_REQUEST;
      }
      const isExist = await strapi.entityService.findMany(
        "api::friend.friend",
        {
          filters: {
            $or: [
              {
                user: { id: userId },
                friend: { id: to },
              },
              {
                user: { id: to },
                friend: { id: userId },
              },
            ],
          },
        }
      );

      if (isExist.length > 0) {
        throw ErrorCode.FRIEND_ALREADY_EXIST;
      }

      const friends = await strapi.entityService.findMany(
        "api::friend.friend",
        {
          filters: {
            user: { id: userId },
          },
        }
      );

      if (friends.length >= MAX_FRIENDS) {
        throw ErrorCode.MAX_FRIENDS_REACHED;
      }

      const date = new Date();

      return await strapi.entityService.create("api::friend.friend", {
        data: {
          user: { id: userId },
          friend: { id: to },
          request_date: date,
          accepted: false,
          publishedAt: date,
        },
      });
    } catch (err) {
      return ctx.badRequest(err.message, err);
    }
  },

  delete: async (ctx) => {
    const { friendId } = ctx.params;

    try {
      if (!friendId) {
        throw ErrorCode.FRIEND_ID_REQUIRED;
      }

      const { pair } = await strapi.entityService.delete(
        "api::friend.friend",
        friendId,
        {
          populate: {
            pair: {
              fields: ["id"],
            },
          },
        }
      );

      if (pair) {
        await strapi.entityService.delete("api::friend.friend", pair.id);
      }

      ctx.body = "ok";
    } catch (err) {
      return ctx.badRequest(err.message, err);
    }
  },

  accept: async (ctx) => {
    const { friendId } = ctx.request.body;
    const userId = ctx.state.user.id;
    // friendId

    try {
      if (!friendId) {
        throw ErrorCode.FRIEND_ID_REQUIRED;
      }

      const friend = await strapi.entityService.findOne(
        "api::friend.friend",
        friendId,
        {
          populate: {
            user: {
              fields: ["id"],
            },
            friend: {
              fields: ["id"],
            },
          },
        }
      );

      if (friend.friend?.id !== userId) {
        throw ErrorCode.INVALID_REQUEST;
      }

      const myFriends = await strapi.entityService.findMany(
        "api::friend.friend",
        {
          filters: {
            user: { id: userId },
          },
        }
      );

      if (myFriends.length >= MAX_FRIENDS) {
        throw ErrorCode.MAX_FRIENDS_REACHED;
      }

      const friendsOfFriend = await strapi.entityService.findMany(
        "api::friend.friend",
        {
          filters: {
            user: { id: friend.id },
          },
        }
      );

      if (friendsOfFriend.length > 0) {
        throw ErrorCode.FRIEND_MAX_FRIENDS_REACHED;
      }

      return await strapi.db.transaction(async ({ trx }) => {
        // lock friend
        const [{ accepted }] = await strapi.db
          .connection("friends")
          .transacting(trx)
          .forUpdate()
          .where("id", friendId);

        if (accepted) {
          throw ErrorCode.FRIEND_ALREADY_EXIST;
        }

        const date = new Date();
        const myNewFriend = await strapi.entityService.create(
          "api::friend.friend",
          {
            data: {
              user: { id: userId },
              friend: { id: friend.user.id },
              accepted: true,
              accept_date: date,
              pair: { id: friendId },
              publishedAt: date,
            },
            fields: ["id"],
          }
        );

        await strapi.entityService.update("api::friend.friend", friendId, {
          data: {
            accepted: true,
            accept_date: date,
            pair: { id: myNewFriend.id },
          },
        });

        return myNewFriend;
      });
    } catch (err) {
      return ctx.badRequest(err.message, err);
    }
  },
  addByLink: async (ctx) => {
    ctx.set("Content-Type", "text/html");
    ctx.body = fs.readFileSync(`public/link/index.html`, "utf8");
  },
};
