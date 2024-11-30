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
  GROUP_DIVIDER,
  MAX_FRIENDS,
} from "../../../constant";

export default factories.createCoreService(
  "api::config.config",
  ({ strapi }) => ({
    async getConfig() {
      if (CACHED_CONFIG && Date.now() - LAST_CACHE_TIME < CACHE_DURATION) {
        return CACHED_CONFIG;
      }

      let config = await strapi.entityService.findOne("api::config.config", 1);

      config["ITEM_PROBABILITY"] =
        config["ITEM_PROBABILITY"] || ITEM_PROBABILITY;
      config["EXP_MULT_FOR_DUPLICATE"] =
        config["EXP_MULT_FOR_DUPLICATE"] || EXP_MULT_FOR_DUPLICATE;
      config["EXP_BY_RARITY"] = config["EXP_BY_RARITY"] || EXP_BY_RARITY;
      config["ATTACK_REWARDS"] = config["ATTACK_REWARDS"] || ATTACK_REWARDS;
      config["REPAIR_COST"] = config["REPAIR_COST"] || REPAIR_COST;
      config["GROUP_DIVIDER"] = config["GROUP_DIVIDER"] || GROUP_DIVIDER;
      config["MAX_FRIENDS"] = config["MAX_FRIENDS"] || MAX_FRIENDS;

      CACHED_CONFIG = config;
      LAST_CACHE_TIME = Date.now();

      return config;
    },
  })
);
