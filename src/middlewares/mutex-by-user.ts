/**
 * `mutex-by-id` middleware
 */

import { Strapi } from "@strapi/strapi";

import { ErrorCode } from "../constant";

const LOCKER = new Map<string, number>();
const USER_LOCK_TIMEOUT = 1000 * 15; // 15 seconds

export default (config, { strapi }: { strapi: Strapi }) => {
  // Add your own logic here.
  return async (ctx, next) => {
    const userId = ctx.state.user?.id;
    const path = ctx.request.path;

    if (!userId) {
      return ctx.unauthorized("user is not authenticated");
    }

    const key = [path, userId].join("@");
    const now = Date.now();

    const prev = LOCKER.get(key);

    if (!prev || now - prev >= USER_LOCK_TIMEOUT) {
      LOCKER.set(key, now);
    } else {
      return ctx.locked(
        `previous ${path} request from user(${userId}) is still pending.`,
        ErrorCode.LOCKED
      );
    }

    try {
      await next();
    } catch (error) {
      throw error;
    } finally {
      LOCKER.delete(key);
    }
  };
};
