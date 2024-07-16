/**
 * reward service
 */

import { factories } from "@strapi/strapi";
import { EXP_BY_RARITY, EXP_MULT_FOR_DUPLICATE } from "../../../constant";

export default factories.createCoreService(
  "api::reward.reward",
  ({ strapi }) => ({
    claim: async (userId: number, rewards: Reward[], reason: string) => {
      for (const reward of rewards) {
        switch (reward.type) {
          case "freebie":
            await strapi
              .service("api::freebie.freebie")
              .updateFreebie(userId, reward.amount);
            break;

          case "star_point":
            await strapi
              .service("api::star-point.star-point")
              .updateStarPoint(userId, reward.amount, reason);
            break;

          case "wheel_spin":
            await strapi
              .service("api::wheel-spin.wheel-spin")
              .updateWheelSpin(userId, reward.amount, reason);
            break;

          case "relay_token":
            const relays = await strapi
              .service("api::relay.relay")
              .getCurrentRelays();
            const relay = relays.find((relay) => relay.type === "relay_only");
            if (relay) {
              await strapi
                .service("api::user-relay-token.user-relay-token")
                .updateRelayToken(userId, relay.id, reward.amount);
            }
            break;

          case "item":
          case "item_common":
          case "item_uncommon":
          case "item_rare":
          case "item_unique":
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

              let exp = EXP_BY_RARITY[rarity];

              if (!isNew) {
                exp *= EXP_MULT_FOR_DUPLICATE;
              }

              totalExp += exp;

              await strapi
                .service("api::user-room.user-room")
                .updateItems(userRoom, [itemId], []);

              reward.detail = userItem.item;
              reward.exp = exp;
            }

            await strapi
              .service("api::status.status")
              .updateExp(userId, totalExp);

            await strapi.entityService.create(
              "api::item-acquisition-history.item-acquisition-history",
              {
                data: {
                  type: reason,
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
      }

      return rewards;
    },
  })
);
