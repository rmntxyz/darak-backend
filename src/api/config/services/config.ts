/**
 * config service
 */

import { factories } from "@strapi/strapi";

let CACHED_CONFIG = null;
let LAST_CACHE_TIME = 0;
// const CACHE_DURATION = 1000 * 60 * 5;
const CACHE_DURATION = 1000 * 60 * 1;

export default factories.createCoreService(
  "api::config.config",
  ({ strapi }) => ({
    async getConfig() {
      if (CACHED_CONFIG && Date.now() - LAST_CACHE_TIME < CACHE_DURATION) {
        return CACHED_CONFIG;
      }

      const config = await strapi.entityService.findOne(
        "api::config.config",
        1
      );

      CACHED_CONFIG = config;
      LAST_CACHE_TIME = Date.now();

      return config;
    },
  })
);
