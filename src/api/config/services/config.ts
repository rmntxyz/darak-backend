/**
 * config service
 */

import { factories } from "@strapi/strapi";

let CACHED_CONFIG = null;
let LAST_CACHE_TIME = 0;
// const CACHE_DURATION = 1000 * 60 * 5;
const CACHE_DURATION = 1000 * 60 * 1;

// TEMP
import {
  ITEM_PROBABILITY,
  EXP_MULT_FOR_DUPLICATE,
  EXP_BY_RARITY,
  ATTACK_REWARDS,
  REPAIR_COST,
} from "../../../constant";

export default factories.createCoreService(
  "api::config.config",
  ({ strapi }) => ({
    async getConfig() {
      if (CACHED_CONFIG && Date.now() - LAST_CACHE_TIME < CACHE_DURATION) {
        return CACHED_CONFIG;
      }

      let config = await strapi.entityService.findOne("api::config.config", 1);

      // TEMP fallback
      if (config === null) {
        config = {
          ITEM_PROBABILITY,
          EXP_MULT_FOR_DUPLICATE,
          EXP_BY_RARITY,
          ATTACK_REWARDS,
          REPAIR_COST,
        };
      }

      CACHED_CONFIG = config;
      LAST_CACHE_TIME = Date.now();

      return config;
    },
  })
);
