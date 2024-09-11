export default {
  // request: async (effectName: string, userId: number) => {},
  applyEffect: async (effect: UserStatusEffect, userId: number) => {},
  refresh: async (effect: UserStatusEffect) => {
    if (effect.status_effect.duration === 0) {
      return;
    }

    const { id, end_time, active } = effect;

    if (active && end_time) {
      const now = (Date.now() / 1000) | 0;
      if (now >= end_time) {
        return await strapi.entityService.update(
          "api::user-status-effect.user-status-effect",
          id,
          {
            data: {
              active: false,
            },
            fields: [],
          }
        );
      }
    }

    return effect;
  },
};
