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
      const effectSymbol = ctx.request.body.effect;
      const capsuleHistoryId = ctx.request.body.capsule_history_id;

      const userEffect: UserStatusEffect = await strapi
        .service("api::user-status-effect.user-status-effect")
        .getUserStatusEffect(targetId, effectSymbol);

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
          .verify(userEffect, {
            attacker: userId,
            drawHistory,
          });
      } catch (e) {
        return ctx.badRequest("Unauthorized attack", e);
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
          .updateStack(userEffect, 1, userId);
      }

      const { ATTACK_REWARDS } = await strapi
        .service("api::config.config")
        .getConfig();
      const rewards = ATTACK_REWARDS[status];

      await strapi
        .service("api::reward.reward")
        .claim(userId, rewards, "attack", multiply);

      const attack = await strapi.entityService.create("api::attack.attack", {
        data: {
          attacker: { id: userId },
          target: { id: targetId },
          result: rewards,
          status,
          multiply,
          status_effect: { id: userEffect.status_effect.id },
          publishedAt: new Date(),
        },
        fields: ["result", "status", "multiply"],
      });

      try {
        const result = await strapi
          .service("api::attack.attack")
          .sendAttackNotification(userId, targetId, status);
        console.log(result);
      } catch (e) {
        console.error(e);
      }

      attack.events = [];
      await checkRankingRelayEvent(userId, attack);
      return attack;
    },

    repair: async (ctx) => {
      const userId = ctx.state.user.id;
      const effectSymbol = ctx.request.body.effect;

      const userEffect = await strapi
        .service("api::user-status-effect.user-status-effect")
        .getUserStatusEffect(userId, effectSymbol);

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

      target.user_status_effects = user_status_effects.filter(
        (effect) => effect.active
      );

      return target;
    },

    "find-targets": async (ctx) => {
      const userId = ctx.state.user.id;

      // get friends
      const friends = (
        await strapi.service("api::friend.friend").getFriends(userId)
      ).map((each) => each.friend);
      const friendsIds = friends.map((f) => f.id);

      // get revenges
      const revenges: {
        id: number;
        total_stack: number;
        attacked_at: string;
      }[] = await strapi.service("api::attack.attack").getRevenges(userId);
      const revengesIds = revenges.map((r) => r.id);

      // get randoms
      let randoms: { id: number; total_stack: number }[] = await strapi
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
      const attackableRevenges = revenges.filter((r) => r.total_stack < 8);
      // shuffle
      attackableRevenges.sort(() => Math.random() - 0.5);

      if (
        attackableRevenges.length > 0 &&
        new Date(attackableRevenges[0].attacked_at).getTime() >
          Date.now() - 24 * 60 * 60 * 1000 &&
        !(await strapi
          .service("api::attack.attack")
          .isAttackedin(attackableRevenges[0].id))
      ) {
        // 1st: revenge who attacked me in the last 1 day
        recommendedId = attackableRevenges[0].id;
        randomId = randoms[0]?.id;
      } else if (randoms.length == 2) {
        // 2nd: randoms length > 1, pick first one
        recommendedId = randoms[0].id;
        randomId = randoms[1].id;
      } else if (attackableRevenges.length > 0) {
        // 3rd: revenge
        recommendedId = attackableRevenges[0].id;
        randomId = randoms[0]?.id;
      } else {
        recommendedId = friends[0]?.id || randoms[0]?.id;
        randomId = null;
      }

      if (recommendedId === null) {
        throw ctx.notFound("No targets found");
      }

      const users = await strapi.entityService.findMany(
        "plugin::users-permissions.user",
        {
          filters: {
            id: {
              $in: [recommendedId, randomId, ...revengesIds].filter(
                (id) => id !== null
              ),
            },
          },
          ...TargetUserOptions,
        }
      );

      const recommendedTarget = {
        ...users.find((u) => u.id === recommendedId),
        user_status_effects: await strapi
          .service("api::user-status-effect.user-status-effect")
          .getActiveEffects(recommendedId),
      };

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

      return {
        recommended: recommendedTarget,
        random: randomTarget,
        revenges: revengeTargets,
        friends: friends,
      };
    },
  })
);

async function checkRankingRelayEvent(userId: number, result: AttackResult) {
  const relays = await strapi
    .service("api::relay.relay")
    .getCurrentRelays(userId);

  const relay = relays.find((relay) => relay.type === "with_group_ranking");

  if (relay) {
    const tokens = await strapi
      .service("api::relay.relay")
      .verify(userId, relay, result);

    if (tokens > 0) {
      const { rewards, total } = await strapi
        .service("api::relay.relay")
        .claimRewards(userId, relay);

      result.events.push({
        type: "relay",
        amount: tokens,
        total,
        rewards,
        relay,
      });
    }
  }
}
