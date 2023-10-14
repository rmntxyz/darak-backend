/**
 * user-room service
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreService(
  "api::user-room.user-room",
  ({ strapi }) => ({
    async updateItems(
      userRoom: UserRoom,
      itemsToAdd: number[],
      itemsToRemove: number[]
    ) {
      const { id, start_time, owned_items, item_details } = userRoom;

      for (const itemId of itemsToAdd) {
        if (!owned_items[itemId]) {
          owned_items[itemId] = 0;
        }
        owned_items[itemId] += 1;
      }

      for (const itemId of itemsToRemove) {
        if (owned_items[itemId]) {
          owned_items[itemId] -= 1;
        }
      }

      const completion_rate = Math.round(
        (Object.values(owned_items).filter(Boolean).length /
          item_details.total) *
          100
      );

      const completed = completion_rate === 100;

      const data: Partial<UserRoom> = {
        owned_items,
        completion_rate,
        completed,
      };

      if (completed) {
        const now = new Date();
        data.completion_time = now;
        data.duration = now.getTime() - new Date(start_time).getTime();
      }

      return strapi.entityService.update("api::user-room.user-room", id, {
        data,
      });
    },
  })
);
