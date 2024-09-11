export default {
  verify: async (userEffect: UserStatusEffect, userId: number, data: any) => {
    const { attacker, target, ref } = data;

    if (!attacker || !target) {
      return false;
    }

    if (userId !== attacker.id) {
      return false;
    }

    const {
      status_effect: { max_stack },
      stack,
    } = userEffect;

    if (stack >= max_stack) {
      return false;
    }

    const drawHistory = await strapi.entityService.findOne(
      "api::draw-history.draw-history",
      ref,
      {
        fields: ["id", "multiply", "draw_result"],
        populate: {
          users_permissions_user: {
            fields: ["id"],
          },
        },
      }
    );

    if (drawHistory.draw_result.type !== "attack") {
      return false;
    }

    if (drawHistory.users_permissions_user.id !== userId) {
      return false;
    }

    return true;
  },
};
