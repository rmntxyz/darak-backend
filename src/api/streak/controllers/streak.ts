/**
 * streak controller
 */

import { factories } from "@strapi/strapi";
import { EXP_MULT_FOR_DUPLICATE, EXP_TABLE } from "../../../constant";

export default factories.createCoreController(
  "api::streak.streak",
  ({ strapi }) => ({
    "get-streak-status": async (ctx) => {
      const userId = ctx.state.user?.id;

      if (!userId) {
        return ctx.unauthorized("user is not authenticated");
      }

      const streak = await strapi
        .service("api::streak.streak")
        .getCurrentStreak(userId);

      if (!streak) {
        return ctx.notFound("no current streak");
      }

      const streakReward = (
        await strapi.entityService.findMany(
          "api::streak-reward.streak-reward",
          {
            filters: {
              type: "default",
            },
            populate: {
              rewards: {
                populate: {
                  reward: true,
                },
              },
            },
          }
        )
      )[0];

      return { streak, rewards: streakReward.rewards };
    },

    "check-in": async (ctx) => {
      const userId = ctx.state.user?.id;

      if (!userId) {
        return ctx.unauthorized("user is not authenticated");
      }

      const streak: Streak = await strapi
        .service("api::streak.streak")
        .getCurrentStreak(userId);

      if (!streak) {
        return ctx.notFound("no current streak");
      }

      if (!streak.reward_claimed) {
        const defaultStreakReward: StreakReward = (
          await strapi.entityService.findMany(
            "api::streak-reward.streak-reward",
            {
              filters: {
                type: "default",
              },
              populate: {
                rewards: {
                  populate: {
                    reward: true,
                  },
                },
              },
            }
          )
        )[0];

        if (!defaultStreakReward) {
          return ctx.notFound("no streak reward");
        }

        const rewardTable = defaultStreakReward.rewards;

        // streak.streak_count 와 rewardTable의 reward중에 day가 같은 reward를 찾는다.
        let { reward } = rewardTable.find(
          (reward) => reward.day === streak.streak_count
        );

        if (!reward) {
          return ctx.notFound("no reward for streak count");
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
              .updateStarPoint(userId, reward.amount, "check-in");
            rewards.push(reward);
            break;

          case "wheel_spin":
            await strapi
              .service("api::wheel-spin.wheel-spin")
              .updateWheelSpin(userId, reward.amount, "check-in");
            rewards.push(reward);
            break;

          case "item_uncommon":
          case "item_rare":
            const targetRarity = reward.type.split("_")[1];

            const items = await strapi
              .service("api::random-item.random-item")
              .getRandomItemsFromUnlockedRooms(userId, reward.amount, [
                targetRarity,
              ]);
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

              let exp = EXP_TABLE[rarity];

              if (!isNew) {
                exp *= EXP_MULT_FOR_DUPLICATE;
              }

              totalExp += exp;

              await strapi
                .service("api::user-room.user-room")
                .updateItems(userRoom, [itemId], []);

              rewards.push({ ...reward, detail: userItem.item, exp });
            }

            await strapi.entityService.create(
              "api::item-acquisition-history.item-acquisition-history",
              {
                data: {
                  type: "spin",
                  user: userId,
                  items: { connect: itemIds },
                  inventories: { connect: userItemIds },
                  exp: totalExp,
                  publishedAt: new Date(),
                },
              }
            );
            break;

          default:
            break;
        }

        // streak의 reward_claimed를 true로 변경한다.
        await strapi.entityService.update("api::streak.streak", streak.id, {
          data: {
            reward_claimed: true,
          },
        });

        return rewards;
      }

      return [];
    },
  })
);
