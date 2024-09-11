/**
 * attack controller
 */

import { factories } from "@strapi/strapi";
import { TargetUserOptions } from "../services/attack";

export default factories.createCoreController(
  "api::attack.attack",
  ({ strapi }) => ({
    attack: async (ctx) => {},

    "find-targets": async (ctx) => {
      const userId = ctx.state.user.id;

      // get friends
      const friends = await strapi
        .service("api::attack.attack")
        .getFriends(userId);
      const friendsIds = friends.map((f) => f.id);

      // get revenges
      const revenges: { id: number; attacked_at: string }[] = await strapi
        .service("api::attack.attack")
        .getRevenges(userId);
      const revengesIds = revenges.map((r) => r.id);

      // get randoms
      let randoms: { id: number; active_broken_count: number }[] = await strapi
        .service("api::attack.attack")
        .getRandoms([userId, ...friendsIds, ...revengesIds]);
      const randomsIds = randoms.map((r) => r.id);

      let recommandedId = null;

      // 1st: revenge who attacked me in the last 6 hour
      if (
        revenges.length > 0 &&
        new Date(revenges[0].attacked_at).getTime() >
          Date.now() - 3600 * 6 * 1000
      ) {
        recommandedId = revenges[0].id;

        // 2nd: randoms length > 1, pick first one
      } else if (randoms.length > 1) {
        recommandedId = randoms[0].id;

        // 3rd: revenge who attacked me most recently
      } else if (revenges.length > 0) {
        recommandedId = revenges[0].id;

        // 4th: friend
      } else if (friends.length > 0) {
        recommandedId = friends[0].id;

        // 5th: randoms length = 1, pick the only one
      } else if (randoms.length === 1) {
        recommandedId = randoms[0].id;

        // 6h: fallback, random in the whole user pool
      } else {
        // if no recommanded
        randoms = await strapi
          .service("api::attack.attack")
          .getRandoms([userId, ...friendsIds, ...revengesIds], 2, 99999);
        // throw new Error("No targets found");

        if (randoms.length > 0) {
          recommandedId = randoms[0].id;
        } else {
          throw ctx.notFound("No targets found");
        }
      }

      const users = await strapi.entityService.findMany(
        "plugin::users-permissions.user",
        {
          filters: {
            id: {
              $in: [...randomsIds, ...friendsIds, ...revengesIds],
            },
          },
          ...TargetUserOptions,
        }
      );

      const recommandedTarget =
        users.find((u) => u.id === recommandedId) || null;
      recommandedTarget.user_status_effects = await strapi
        .service("api::user-status-effect.user-status-effect")
        .getActiveEffects(recommandedId);

      const randomTarget =
        users.find(
          (u) => u.id !== recommandedId && randomsIds.includes(u.id)
        ) || null;

      const revengeTargets = revenges.map((r) => {
        const user = users.find((u) => u.id === r.id);
        if (user) {
          return Object.assign(user, { attacked_at: r.attacked_at });
        } else {
          return null;
        }
      });

      const friendTargets = friends.map(
        (id) => users.find((u) => u.id === id) || null
      );

      return {
        recommanded: recommandedTarget,
        random: randomTarget,
        revenges: revengeTargets,
        friends: friendTargets,
      };
    },
  })
);
