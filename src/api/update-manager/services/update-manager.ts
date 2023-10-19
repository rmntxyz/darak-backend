/**
 * update-manager service
 */

import roomCompletion from "./handler/room-completion";
import itemAquisition from "./handler/item-aquisition";

export default ({ strapi }) => ({
  updateRoomCompletion: async (userRoom: UserRoom) => {
    await roomCompletion.update(userRoom);
    return;
  },

  updateItemAquisition: async (userItem: Inventory) => {
    await itemAquisition.update(userItem);
    return;
  },
});
