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
      throw new Error("Max stack reached");
    }

    if (drawHistory.draw_result.type !== "attack") {
      throw new Error("Invalid draw type");
    }

    if (drawHistory.users_permissions_user.id !== attacker) {
      throw new Error("User is not the owner of the draw history");
    }

    if (drawHistory.reviewed) {
      throw new Error("Draw history already reviewed");
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
