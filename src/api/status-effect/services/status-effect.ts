/**
 * status-effect service
 */

import { factories } from "@strapi/strapi";
import verifier from "./verifier";

export default factories.createCoreService(
  "api::status-effect.status-effect",
  ({ strapi }) => ({
    async getStatusEffect(effectName: string) {
      const effect = (
        await strapi.entityService.findMany(
          "api::status-effect.status-effect",
          {
            filters: { name: effectName },
            ...StatusEffectOptions,
          }
        )
      )[0];

      return effect;
    },

    async verify(userEffect: UserStatusEffect, userId: number) {
      const verifierService = verifier[userEffect.status_effect.name];

      if (!verifierService) {
        return true;
      }

      return await verifierService.verify(userEffect, userId);
    },
  })
);

export const StatusEffectOptions = {
  fields: ["name", "desc", "duration", "max_stack"],
  populate: {
    icon: {
      fields: ["url"],
    },
    details: {
      fields: ["type", "value", "for_stack"],
    },
    // localizations: {
    //   fields: ["name", "desc", "locale"],
  },
};
