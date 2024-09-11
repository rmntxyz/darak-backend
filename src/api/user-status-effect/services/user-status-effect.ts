/**
 * user-status-effect service
 */

import { factories } from "@strapi/strapi";
import { StatusEffectOptions } from "../../status-effect/services/status-effect";

export default factories.createCoreService(
  "api::user-status-effect.user-status-effect",
  ({ strapi }) => ({
    async getUserStatusEffect(userId: number, effectName: string) {
      const effect = await strapi
        .service("api::status-effect.status-effect")
        .getStatusEffect(effectName);

      if (!effect) {
        throw new Error("StatusEffect not found");
      }

      let userStatusEffect = (
        await strapi.entityService.findMany(
          "api::user-status-effect.user-status-effect",
          {
            filters: {
              user: { id: userId },
              status_effect: { id: effect.id },
            },
            ...UserStatusEffectOptions,
          }
        )
      )[0];

      if (!userStatusEffect) {
        userStatusEffect = await strapi.entityService.create(
          "api::user-status-effect.user-status-effect",
          {
            data: {
              user: { id: userId },
              status_effect: { id: effect.id },
              start_time: 0,
              end_time: 0,
              stack: 0,
              active: false,
            },
            ...UserStatusEffectOptions,
          }
        );
      }

      return userStatusEffect;
    },

    async activate(
      userId: number,
      userEffect: UserStatusEffect,
      stackToAdd: number = 1
    ) {
      let {
        id,
        start_time,
        end_time,
        stack,
        status_effect: { duration, max_stack },
      } = userEffect;

      // renew start_time and end_time
      start_time = (Date.now() / 1000) | 0;
      end_time = duration > 0 ? start_time + duration : 0;

      if (max_stack > 1 && stack < max_stack) {
        stack = Math.min(stack + stackToAdd, max_stack);
      }

      const updated = await strapi.entityService.update(
        "api::user-status-effect.user-status-effect",
        id,
        {
          data: {
            start_time,
            end_time,
            stack,
            active: true,
          },
        }
      );

      return updated;
    },

    async getActiveEffects(userId: number) {
      const userEffects = await strapi.entityService.findMany(
        "api::user-status-effect.user-status-effect",
        {
          filters: {
            user: { id: userId },
            active: true,
          },
          ...UserStatusEffectOptions,
        }
      );

      for (const effect of userEffects) {
        await this.refresh(effect);
      }

      return userEffects.filter((effect) => effect.active);
    },

    async refresh(userEffect: UserStatusEffect) {
      if (userEffect.status_effect.duration === 0) {
        return userEffect;
      }

      const { id, end_time, active } = userEffect;

      if (active && end_time) {
        const now = (Date.now() / 1000) | 0;
        if (now >= end_time) {
          await strapi.entityService.update(
            "api::user-status-effect.user-status-effect",
            id,
            {
              data: {
                active: false,
              },
              ...UserStatusEffectOptions,
            }
          );

          userEffect.active = false;
        }
      }

      return userEffect;
    },
  })
);

export const UserStatusEffectOptions = {
  fields: ["start_time", "end_time", "stack", "active"],
  populate: {
    status_effect: {
      ...StatusEffectOptions,
    },
    user: {
      fields: ["id"],
    },
  },
};
