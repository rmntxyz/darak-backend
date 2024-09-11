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

      if (randoms.length < 2) {
        const extra = await strapi
          .service("api::attack.attack")
          .getRandoms(
            [userId, ...friendsIds, ...revengesIds],
            2 - randoms.length,
            99999
          );

        randoms = randoms.concat(extra);
      }

      let recommendedId = null;
      let randomId = null;

      if (
        revenges.length > 0 &&
        new Date(revenges[0].attacked_at).getTime() >
          Date.now() - 3600 * 6 * 1000
      ) {
        // 1st: revenge who attacked me in the last 6 hour
        recommendedId = revenges[0].id;
        randomId = randoms[0] ? randoms[0].id : null;
      } else if (randoms.length == 2) {
        // 2nd: randoms length > 1, pick first one
        recommendedId = randoms[0].id;
        randomId = randoms[1] ? randoms[1].id : null;
      } else if (revenges.length > 0) {
        // 3rd: revenge
        recommendedId = revenges[0].id;
        randomId = randoms[0] ? randoms[0].id : null;
      } else if (friends.length > 0) {
        // 4th: friend (random)
        const idx = Math.floor(Math.random() * friends.length);
        recommendedId = friends[idx].id;
        randomId = randoms[0] ? randoms[0].id : null;
      }

      if (recommendedId === null) {
        throw ctx.notFound("No targets found");
      }

      const users = await strapi.entityService.findMany(
        "plugin::users-permissions.user",
        {
          filters: {
            id: {
              $in: [
                recommendedId,
                randomId,
                ...friendsIds,
                ...revengesIds,
              ].filter((id) => id !== null),
            },
          },
          ...TargetUserOptions,
        }
      );

      const recommendedTarget =
        users.find((u) => u.id === recommendedId) || null;
      recommendedTarget.user_status_effects = await strapi
        .service("api::user-status-effect.user-status-effect")
        .getActiveEffects(recommendedId);

      const randomTarget = randomId
        ? users.find((u) => u.id === randomId)
        : null;

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
        recommended: recommendedTarget,
        random: randomTarget,
        revenges: revengeTargets,
        friends: friendTargets,
      };
    },
  })
);
