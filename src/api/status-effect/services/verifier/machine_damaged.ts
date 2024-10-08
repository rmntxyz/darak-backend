import { ErrorCode } from "../../../../constant";

export default {
  verify: async (
    userEffect: UserStatusEffect,
    data: { attacker?: number; drawHistory?: DrawHistory } = {}
  ): Promise<boolean> => {
    const { attacker, drawHistory } = data;

    const {
      status_effect: { max_stack },
      stack,
    } = userEffect;

    if (stack >= max_stack) {
      throw ErrorCode.TARGET_STACK_EXCEEDED;
    }

    if (drawHistory.draw_result.type !== "attack") {
      throw ErrorCode.INVALID_DRAW_TYPE;
    }

    if (drawHistory.users_permissions_user.id !== attacker) {
      throw ErrorCode.NOT_OWNER_OF_DRAW_HISTORY;
    }

    if (drawHistory.reviewed) {
      throw ErrorCode.ALREADY_REVIEWED;
    } else {
      await strapi.entityService.update(
        "api::draw-history.draw-history",
        drawHistory.id,
        {
          data: {
            reviewed: true,
          },
        }
      );
    }

    return true;
  },
};
