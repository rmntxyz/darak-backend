/**
 * wheel-info service
 */

import { factories } from "@strapi/strapi";

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

        switch (reward.type) {
          case "freebie":
            await strapi
              .service("api::freebie.freebie")
              .updateFreebie(userId, reward.amount);
            break;
          case "star_point":
            await strapi
              .service("api::star-point.star-point")
              .updateStarPoint(userId, reward.amount, "spin");
            break;
          case "item":
            const items = await strapi
              .service("api::random-item.random-item")
              .getRandomItems(userId, reward.amount);

            const itemIds = items.map((item) => item.id);

            // add items to user inventory

            let userItems = [];

            for (const itemId of itemIds) {
              const [{ current_serial_number }] = await strapi.db
                .connection("items")
                .transacting(trx)
                .forUpdate()
                .where("id", itemId)
                .select("current_serial_number");

              const updatedItem = await strapi.entityService.update(
                "api::item.item",
                itemId,
                {
                  data: { current_serial_number: current_serial_number + 1 },
                }
              );

              const userItem = await strapi.entityService.create(
                "api::inventory.inventory",
                {
                  data: {
                    users_permissions_user: userId,
                    serial_number: current_serial_number + 1,
                    item: itemId,
                    publishedAt: new Date(),
                  },
                  fields: ["serial_number"],
                  populate: {
                    item: {
                      fields: ["name", "desc", "rarity", "attribute"],
                      populate: {
                        thumbnail: {
                          fields: ["url"],
                        },
                        room: {
                          fields: ["name", "rid"],
                        },
                      },
                    },
                    users_permissions_user: { fields: ["id"] },
                  },
                }
              );

              userItems.push(userItem);
            }
            reward = { ...reward, items: userItems };
            break;

          // add more reward types here
        }

        return { reward_index: idx, reward };
      });
    },
  })
);
