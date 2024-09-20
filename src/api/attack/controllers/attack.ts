/**
 * attack controller
 */

import { factories } from "@strapi/strapi";
import { TargetUserOptions } from "../services/attack";
import { UserStatusEffectOptions } from "../../user-status-effect/services/user-status-effect";
import { ErrorCode } from "../../../constant";

export default factories.createCoreController(
  "api::attack.attack",
  ({ strapi }) => ({
    attack: async (ctx) => {
      const userId = ctx.state.user.id;
      const targetId = ctx.request.body.target;
      const effectName = ctx.request.body.effect;
      const capsuleHistoryId = ctx.request.body.capsule_history_id;

      const userEffect = await strapi
        .service("api::user-status-effect.user-status-effect")
        .getUserStatusEffect(targetId, effectName);

      const drawHistory = await strapi.entityService.findOne(
        "api::draw-history.draw-history",
        capsuleHistoryId,
        {
          fields: ["id", "multiply", "draw_result", "reviewed"],
          populate: {
            users_permissions_user: {
              fields: ["id"],
            },
          },
        }
      );

      try {
        const verified: boolean = await strapi
          .service("api::status-effect.status-effect")
          .verify(userEffect, userId, {
            target: targetId,
            drawHistory,
          });
      } catch (e) {
        return ctx.badRequest(e.message, ErrorCode.UNAUTHORIZED_ATTACK);
      }

      const { multiply } = drawHistory;

      let status = "success";

      const shield = await strapi
        .service("api::shield.shield")
        .getShield(targetId);

      if (shield.amount > 0) {
        status = "blocked";
        await strapi
          .service("api::shield.shield")
          .updateShield(targetId, -1, "attack");
      } else {
        await strapi
          .service("api::user-status-effect.user-status-effect")
          .updateStack(userEffect, 1);
      }

      const { ATTACK_REWARDS } = await strapi
        .service("api::config.config")
        .getConfig();
      const reward = ATTACK_REWARDS[status];

      await strapi
        .service("api::reward.reward")
        .claim(userId, [reward], "attack", multiply);

      const attack = await strapi.entityService.create("api::attack.attack", {
        data: {
          attacker: { id: userId },
          target: { id: targetId },
          result: reward,
          status,
          multiply,
          effect_name: userEffect.status_effect.name,
          publishedAt: new Date(),
        },
        fields: ["result", "status", "multiply"],
      });

      return attack;
    },

    repair: async (ctx) => {
      const userId = ctx.state.user.id;
      const effectName = ctx.request.body.effect;

      const userEffect = await strapi
        .service("api::user-status-effect.user-status-effect")
        .getUserStatusEffect(userId, effectName);

      if (!userEffect.active) {
        return ctx.badRequest(
          "Effect is not active",
          ErrorCode.EFFECT_NOT_ACTIVE
        );
      }

      const { REPAIR_COST } = await strapi
        .service("api::config.config")
        .getConfig();

      const cost = REPAIR_COST[`stack${userEffect.stack}`].amount;

      const user = await strapi.entityService.findOne(
        "plugin::users-permissions.user",
        userId,
        {
          populate: {
            star_point: {
              fields: ["amount"],
            },
          },
        }
      );

      if (user.star_point.amount < cost) {
        return ctx.badRequest(
          "Not enough star point",
          ErrorCode.NOT_ENOUGH_STAR_POINT
        );
      }
      const { amount } = await strapi
        .service("api::star-point.star-point")
        .updateStarPoint(userId, cost * -1, "repair");

      const updated = await strapi
        .service("api::user-status-effect.user-status-effect")
        .updateStack(userEffect, userEffect.stack * -1);

      return {
        // user_status_effect: updated,
        cost,
        remaining: amount,
      };
    },

    "target-info": async (ctx) => {
      // const userId = ctx.state.user.id;
      const targetId = parseInt(ctx.params.targetId);

      const target = await strapi.entityService.findOne(
        "plugin::users-permissions.user",
        targetId,
        {
          fields: ["id", "username"],
          populate: {
            ...TargetUserOptions.populate,
            user_status_effects: {
              ...UserStatusEffectOptions,
            },
          },
        }
      );

      const { user_status_effects } = target;

      for (const effect of user_status_effects) {
        await strapi
          .service("api::user-status-effect.user-status-effect")
          .refresh(effect);
      }

      user_status_effects.filter((effect) => effect.active);

      target.user_status_effects = user_status_effects;

      return target;
    },

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
