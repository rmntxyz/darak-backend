/**
 * reward service
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreService(
  "api::reward.reward",
  ({ strapi }) => ({
    claim: async (user: User, rewards: Reward[]) => {
      for (const reward of rewards) {
        const { amount } = reward;

        if (reward.type === "freebie") {
          await strapi.entityService.update(
            "api::freebie.freebie",
            user.freebie.id,
            {
              data: {
                current: user.freebie.current + amount,
              },
            }
          );
        } else if (reward.type === "star_point") {
          await strapi
            .service("api::star-point.star-point")
            .updateStarPoint(user.star_point, amount, "achievement_reward");
        } else if (reward.type === "item") {
          const { item, amount } = reward;

          const { current_serial_number } = item;

          await strapi.entityService.update("api::item.item", item.id, {
            fields: ["id", "name", "desc", "rarity", "current_serial_number"],
            populate: {
              thumbnail: {
                fields: ["url"],
              },
            },
            data: { current_serial_number: current_serial_number + 1 },
          });

          const userItem = await strapi.entityService.create(
            "api::inventory.inventory",
            {
              data: {
                users_permissions_user: user.id,
                serial_number: current_serial_number + 1,
                item: item.id,
                publishedAt: new Date(),
              },
              fields: ["serial_number"],
              populate: {
                item: {
                  fields: ["rarity"],
                },
                users_permissions_user: { fields: ["id"] },
              },
            }
          );

          await strapi
            .service("api::update-manager.update-manager")
            .updateItemAquisition(userItem);

          const userRoom = await strapi
            .service("api::user-room.user-room")
            .getUserRoom(user.id, item.room.id);

          await strapi
            .service("api::user-room.user-room")
            .updateItems(userRoom, [item.id], []);
        }
      }
    },
  })
);
