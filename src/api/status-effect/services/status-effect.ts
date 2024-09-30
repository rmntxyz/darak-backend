/**
 * status-effect service
 */

import { factories } from "@strapi/strapi";
import verifier from "./verifier";
import applier from "./applier";
import { ErrorCode, BYPASS_VALUE } from "../../../constant";

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

    async verify(userEffect: UserStatusEffect, data: any) {
      const verifierService = verifier[userEffect.status_effect.symbol];

      if (!verifierService) {
        return true;
      }

      return await verifierService.verify(userEffect, data);
    },

    getEffectDetails(types: EffectType[], userEffects: UserStatusEffect[]) {
      const details = userEffects
        .map((userEffect) => {
          const { status_effect, stack } = userEffect;

          if (stack <= 0) {
            return null;
          }

          const detail = status_effect.details.find(
            (detail) => detail.for_stack === stack
          );

          if (!detail) {
            return null;
          }

          if (!types.includes(detail.type)) {
            return null;
          }

          return detail;
        })
        .filter((detail) => detail);

      return details;
    },

    apply(detail: StatusEffectDetail, value: any) {
      const applierService = applier[detail.type];

      if (!applierService) {
        console.error(`applier not found for ${detail.type}`);
        return BYPASS_VALUE;
      }

      return applierService(detail, value);
    },
  })
);

export const StatusEffectOptions = {
  fields: ["name", "symbol", "desc", "duration", "max_stack"],
  populate: {
    icon: {
      fields: ["url"],
    },
    details: {
      fields: ["type", "value", "desc", "for_stack"],
    },
    // localizations: {
    //   fields: ["name", "desc", "locale"],
  },
};
