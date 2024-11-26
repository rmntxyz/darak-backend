/**
 * friend service
 */

import { TargetUserOptions } from "../../attack/services/attack";

export default () => ({
  getFriends: async (userId: string) => {
    // 내 친구 목록 (내가 친구 추가한 사람들)
    const myFriends = await strapi.entityService.findMany(
      "api::friend.friend",
      {
        filters: {
          user: { id: userId },
          accepted: true,
        },
        fields: ["id"],
        populate: {
          friend: TargetUserOptions,
        },
      }
    );

    return myFriends;
  },

  isAlreadyFriend: async (userId: string, to: string) => {
    const isExist = await strapi.entityService.findMany("api::friend.friend", {
      filters: {
        user: { id: userId },
        friend: { id: to },
      },
    });

    return isExist.length > 0;
  },

  isAlreadyRequested: async (userId: string, to: string) => {
    const isExist = await strapi.entityService.findMany("api::friend.friend", {
      filters: {
        user: { id: to },
        friend: { id: userId },
      },
    });

    return isExist.length > 0;
  },

  getRequests: async (userId: string) => {
    // 나를 친구 추가한 사람들 (수락 대기중)
    const friendRequests = await strapi.entityService.findMany(
      "api::friend.friend",
      {
        filters: {
          friend: { id: userId },
          accepted: false,
        },
        fields: ["id"],
        populate: {
          user: TargetUserOptions,
        },
      }
    );

    return friendRequests;
  },
});
