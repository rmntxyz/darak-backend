/**
 * wheel-info service
 */

import { factories } from "@strapi/strapi";
import { EXP_MULT_FOR_DUPLICATE, EXP_BY_RARITY } from "../../../constant";
import { Populate } from "@strapi/strapi/lib/services/entity-service/types/params";

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
          Populate: {
            status: { fields: ["level"] },
          },
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
                  fields: ["type", "amount", "tier"],
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
                  fields: ["type", "amount", "tier"],
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

        let rewards = [];
        let idx = 0;
        let totalProbability = 0;
        for (let i = 0; i < wheelInfo.reward_table.length; i++) {
          const rewardInfo = wheelInfo.reward_table[i];
          totalProbability += rewardInfo.probability;

          if (random < totalProbability) {
            rewards = rewardInfo.rewards;
            idx = i;
            break;
          }
        }

        if (rewards.length === 0) {
          throw new Error("no rewards");
        }

        await strapi
          .service("api::reward.reward")
          .claim(userId, rewards, "spin_result");

        return { reward_index: idx, rewards };
      });
    },
  })
);
