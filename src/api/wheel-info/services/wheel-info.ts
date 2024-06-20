/**
 * wheel-info service
 */

import { factories } from "@strapi/strapi";
import { EXP_MULT_FOR_DUPLICATE, EXP_BY_RARITY } from "../../../constant";

const WheelInfo = {
  DEFAULT: 1,
};

export default factories.createCoreService(
  "api::wheel-info.wheel-info",
  ({ strapi }) => ({
    async getWheelInfo(userId: number) {
      const user = await strapi.entityService.findOne(
        "plugin::users-permissions.user",
        userId,
        {
          fields: ["level"],
        }
      );

      if (!user) {
        throw new Error("user not found");
      }

      // check event and return wheel info

      // check user level and return wheel info

      // TEMP return default wheel info
      const wheelInfo = await strapi.entityService.findOne(
        "api::wheel-info.wheel-info",
        WheelInfo.DEFAULT,
        {
          populate: {
            reward_table: {
              populate: {
                rewards: {
                  fields: ["type", "amount"],
                },
              },
            },
          },
        }
      );

      return wheelInfo;
    },

    async spinWheel(userId: number, wheelInfoId: number) {
      const user = await strapi.entityService.findOne(
        "plugin::users-permissions.user",
        userId,
        {
          populate: {
            wheel_spin: {
              fields: ["amount"],
            },
          },
        }
      );

      if (!user) {
        throw new Error("user not found");
      }

      const wheelInfo: WheelInfo = await strapi.entityService.findOne(
        "api::wheel-info.wheel-info",
        wheelInfoId,
        {
          populate: {
            reward_table: {
              populate: {
                rewards: {
                  fields: ["type", "amount"],
                },
              },
            },
          },
        }
      );

      if (!wheelInfo) {
        throw new Error("wheel info not found");
      }

      if (user.wheel_spin.amount < wheelInfo.cost) {
        throw new Error("not enough wheel spin");
      }

      return await strapi.db.transaction(async ({ trx }) => {
        // update user wheel spin
        await strapi
          .service("api::wheel-spin.wheel-spin")
          .updateWheelSpin(userId, -wheelInfo.cost, "spin");

        const random = Math.random();

        let reward = null;
        let idx = 0;
        let totalProbability = 0;
        for (let i = 0; i < wheelInfo.reward_table.length; i++) {
          const rewardInfo = wheelInfo.reward_table[i];
          totalProbability += rewardInfo.probability;

          if (random < totalProbability) {
            reward = rewardInfo.rewards[0];
            idx = i;
            break;
          }
        }

        const rewards = [];

        switch (reward.type) {
          case "freebie":
            await strapi
              .service("api::freebie.freebie")
              .updateFreebie(userId, reward.amount);
            rewards.push(reward);
            break;
          case "star_point":
            await strapi
              .service("api::star-point.star-point")
              .updateStarPoint(userId, reward.amount, "spin_result");
            rewards.push(reward);
            break;
          case "item":
            const items = await strapi
              .service("api::random-item.random-item")
              .getRandomItemsFromUnlockedRooms(userId, reward.amount);

            const itemIds = items.map((item) => item.id);

            const userItems: Inventory[] = await strapi
              .service("api::random-item.random-item")
              .addItemsToUserInventory(userId, itemIds);

            const userItemIds = userItems.map((userItem) => userItem.id);
            let totalExp = 0;

            for (const userItem of userItems) {
              const itemId = userItem.item.id;
              const roomId = userItem.item.room.id;
              const rarity = userItem.item.rarity;
              const userRoom = await strapi
                .service("api::user-room.user-room")
                .getUserRoom(userId, roomId);

              const isNew = !userRoom.owned_items[itemId];

              let exp = EXP_BY_RARITY[rarity];

              if (!isNew) {
                exp *= EXP_MULT_FOR_DUPLICATE;
              }

              totalExp += exp;

              await strapi
                .service("api::user-room.user-room")
                .updateItems(userRoom, [itemId], []);

              rewards.push({ ...reward, detail: userItem.item, exp });
            }

            await strapi
              .service("api::status.status")
              .updateExp(userId, totalExp);

            await strapi.entityService.create(
              "api::item-acquisition-history.item-acquisition-history",
              {
                data: {
                  type: "spin_result",
                  user: userId,
                  items: { connect: itemIds },
                  inventories: { connect: userItemIds },
                  exp: totalExp,
                  publishedAt: new Date(),
                },
              }
            );

            break;

          // add more reward types here
        }

        return { reward_index: idx, rewards };
      });
    },
  })
);
