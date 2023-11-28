// /**
//  * `critical-section` middleware
//  */

// import { Strapi } from "@strapi/strapi";

// const { ErrorCode } = require("../../../constant");

// const LOCKED_USERS = new Map<number, number>();
// const USER_LOCK_TIMEOUT = 1000 * 15; // 15 seconds

// export default (config, { strapi }: { strapi: Strapi }) => {
//   // Add your own logic here.
//   return async (ctx, next) => {
//     const userId = ctx.state.user?.id;
//     const path = ctx.request.path;

//     if (!userId) {
//       return ctx.unauthorized("user is not authenticated");
//     }

//     const now = Date.now();
//     const prev = LOCKED_USERS.get(userId);
//     if (!prev || now - prev >= USER_LOCK_TIMEOUT) {
//       LOCKED_USERS.set(userId, now);
//     } else {
//       return ctx.locked(
//         `previous ${path} request from user(${userId}) is still pending.`,
//         ErrorCode.LOCKED
//       );
//     }

//     try {
//       await next();
//     } catch (error) {
//       throw error;
//     } finally {
//       LOCKED_USERS.delete(userId);
//     }
//   };
// };
