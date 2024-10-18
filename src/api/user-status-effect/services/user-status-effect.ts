/**
 * user-status-effect service
 */

import { factories } from "@strapi/strapi";
import { StatusEffectOptions } from "../../status-effect/services/status-effect";

export default factories.createCoreService(
  "api::user-status-effect.user-status-effect",
  ({ strapi }) => ({
    async getUserStatusEffect(userId: number, effectSymbol: string) {
      const effect = await strapi
        .service("api::status-effect.status-effect")
        .getStatusEffect(effectSymbol);

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
              publishedAt: new Date(),
            },
            ...UserStatusEffectOptions,
          }
        );
      }

      this.refresh(userStatusEffect);

      return userStatusEffect;
    },

    async updateStack(
      userEffect: UserStatusEffect,
      change: number = 1,
      from: number = null
    ) {
      let {
        id,
        start_time,
        end_time,
        stack,
        active,
        status_effect: { duration, max_stack },
      } = userEffect;

      const newStack = Math.max(0, Math.min(stack + change, max_stack));

      if (stack === newStack) {
        return userEffect;
      }

      // lock user status effect
      return await strapi.db.transaction(async ({ trx }) => {
        const [lockedUserEffect] = await strapi.db
          .connection("user_status_effects")
          .transacting(trx)
          .forUpdate()
          .where("id", id)
          .select("*");

        if (newStack === 0) {
          start_time = 0;
          end_time = 0;
          active = false;
        } else if (newStack > 0 && stack === 0) {
          start_time = (Date.now() / 1000) | 0;
          end_time = duration > 0 ? start_time + duration : 0;
          active = true;
        } else if (newStack > 0 && stack > 0) {
          if (duration > 0) {
            end_time = (Date.now() / 1000) | (0 + duration);
          }
        }

        stack = newStack;

        const updated = await strapi.entityService.update(
          "api::user-status-effect.user-status-effect",
          id,
          {
            data: {
              start_time,
              end_time,
              stack,
              active,
              from: from,
            },
            ...UserStatusEffectOptions,
          }
        );

        return updated;
      });
    },

    async getActiveEffects(userId: number) {
      const { user_status_effects } = await strapi.entityService.findOne(
        "plugin::users-permissions.user",
        userId,
        {
          fields: ["id"],
          populate: {
            user_status_effects: {
              ...UserStatusEffectOptions,
            },
          },
        }
      );

      const { REPAIR_COST } = await strapi
        .service("api::config.config")
        .getConfig();

      for (const effect of user_status_effects) {
        await this.refresh(effect);

        let repair_cost = 0;
        if (effect.active) {
          repair_cost = REPAIR_COST[`stack${effect.stack}`].amount;
        }

        effect.repair_cost = repair_cost;
      }

      return user_status_effects.filter((effect) => effect.active);
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
    from: {
      fields: ["username"],
      populate: {
        avatar: {
          fields: ["id"],
          populate: {
            profile_picture: {
              fields: ["id"],
              populate: {
                image: {
                  fields: ["url"],
                },
              },
            },
          },
        },
      },
    },
  },
};
