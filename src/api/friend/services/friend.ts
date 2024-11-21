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
          user: userId,
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

  getRequests: async (userId: string) => {
    // 나를 친구 추가한 사람들 (수락 대기중)
    const friendRequests = await strapi.entityService.findMany(
      "api::friend.friend",
      {
        filters: {
          friend: userId,
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
