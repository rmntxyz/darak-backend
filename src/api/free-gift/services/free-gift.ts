/**
 * free-gift service
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreService(
  "api::free-gift.free-gift",
  ({ strapi }) => ({
    getFreeGiftInfo: async (userId: string) => {
      const { free_gift } = await strapi.entityService.findOne(
        "plugin::users-permissions.user",
        userId,
        {
          fields: ["id"],
          populate: {
            free_gift: {
              fields: ["id", "last_claimed_at", "interval"],
            },
          },
        }
      );

      if (!free_gift) {
        return strapi.entityService.create("api::free-gift.free-gift", {
          data: {
            user: { id: userId },
            claim_count: 0,
            last_claimed_at: (Date.now() / 1000) | 0,
            interval: 8 * 60 * 60,
            publishedAt: new Date(),
          },
          fields: ["id", "last_claimed_at", "interval"],
        });
      }

      return free_gift;
    },

    claimFreeGift: async (userId: string) => {
      // atomic operation
      return strapi.db.transaction(async ({ trx }) => {
        let [freeGift] = await strapi.db
          .connection("free_gifts")
          .transacting(trx)
          .forUpdate()
          .join(
            "free_gifts_user_links",
            "free_gifts.id",
            "free_gifts_user_links.free_gift_id"
          )
          .where("free_gifts_user_links.user_id", userId)
          .select("free_gifts.*");

        // check if free-gift is ready
        const { id, claim_count, interval, last_claimed_at } = freeGift;

        const now = (Date.now() / 1000) | 0;

        if (now - last_claimed_at < interval) {
          throw new Error("free-gift is not ready");
        }

        const reward_list = await strapi.entityService.findMany(
          "api::free-gift-reward.free-gift-reward",
          {
            fields: ["id"],
            populate: {
              rewards: {
                fields: ["id", "type", "amount"],
              },
            },
          }
        );

        const length = reward_list.length;
        const idx = claim_count % length;
        const { rewards } = reward_list[idx];

        await strapi
          .service("api::reward.reward")
          .claim(userId, rewards, "free_gift");

        // update free-gift
        await strapi.entityService.update("api::free-gift.free-gift", id, {
          data: {
            claim_count: claim_count + 1,
            last_claimed_at: (Date.now() / 1000) | 0,
          },
        });

        return rewards;
      });
    },
  })
);
