/**
 * status service
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreService(
  "api::status.status",
  ({ strapi }) => ({
    async getStatus(userId: number, withDetails = false) {
      let status = (
        await strapi.entityService.findMany("api::status.status", {
          filters: { user: userId },
          fields: ["id", "level", "exp", "level_up_reward_claimed"],
          populate: {
            level_up_reward_claim_history: {
              sort: "level:asc",
            },
          },
        })
      )[0];

      if (!status) {
        status = await strapi.entityService.create("api::status.status", {
          data: {
            user: userId,
            level: 1,
            exp: 0,
            level_up_reward_claimed: true,
            level_up_reward_claim_history: [{ date: new Date(), level: 1 }],
            publishedAt: new Date(),
          },
          fields: ["id", "level", "exp", "level_up_reward_claimed"],
          populate: {
            level_up_reward_claim_history: {
              sort: "level:asc",
            },
          },
        });
      }

      const { exp_table } = await strapi
        .service("api::experience-table.experience-table")
        .getExperienceTable("user_level");

      const { level } = status;

      const currentLevel = exp_table[level - 1];
      const nextLevel = exp_table[level];

      if (withDetails) {
        status.exp_table = exp_table;
      } else {
        delete status.level_up_reward_claim_history;
      }

      return {
        ...status,
        next_level_rewards: nextLevel.rewards,
        exp_range: [currentLevel.exp, nextLevel.exp],
        max_level: exp_table.length,
      };
    },

    async updateExp(userId: number, expToAdd: number) {
      return await strapi.db.transaction(async (trx) => {
        // lock the row
        const [{ id, exp, level }] = await strapi.db
          .connection("statuses")
          .transacting(trx)
          .forUpdate()
          .join(
            "statuses_user_links",
            "statuses.id",
            "statuses_user_links.status_id"
          )
          .where("statuses_user_links.user_id", userId)
          .select("*");

        const { exp_table } = await strapi
          .service("api::experience-table.experience-table")
          .getExperienceTable("user_level");

        const maxLevel = exp_table.length;
        const newExp = exp + expToAdd;

        let newLevel = level;

        for (let i = level - 1; i < maxLevel; i++) {
          if (newExp < exp_table[i].exp) {
            break;
          }

          newLevel = i + 1;
        }

        if (newLevel > maxLevel) {
          newLevel = maxLevel;
        }

        const data: {
          exp: number;
          level: number;
          level_up_reward_claimed?: boolean;
        } = {
          exp: newExp,
          level: newLevel,
        };

        if (newLevel > level) {
          data.level_up_reward_claimed = false;
        }

        return await strapi.entityService.update("api::status.status", id, {
          data,
          fields: ["id", "level", "exp", "level_up_reward_claimed"],
          populate: {
            level_up_reward_claim_history: {
              sort: "level:asc",
            },
          },
        });
      });
    },

    async claimLevelUpReward(userId: number) {
      const status = await this.getStatus(userId, true);

      const { level, level_up_reward_claim_history, exp_table } = status;

      const allRewardsClaimed = level_up_reward_claim_history[level - 1];

      if (allRewardsClaimed) {
        return [];
      }

      return await strapi.db.transaction(async (trx) => {
        //lock the row
        await strapi.db
          .connection("statuses")
          .transacting(trx)
          .forUpdate()
          .where("id", status.id)
          .select("exp");

        const result = [];
        const histories = [];
        const lastClaimedLevel =
          level_up_reward_claim_history[
            level_up_reward_claim_history.length - 1
          ].level;
        const now = new Date();

        for (let i = lastClaimedLevel; i < level; i++) {
          result.push(exp_table[i]);
          histories.push({ date: now, level: i + 1 });
        }

        await strapi.entityService.update("api::status.status", status.id, {
          data: {
            level_up_reward_claimed: true,
            level_up_reward_claim_history: [
              ...level_up_reward_claim_history,
              ...histories,
            ],
          },
        });

        const rewards = result.map((r) => r.rewards).flat();

        for (const reward of rewards) {
          switch (reward.type) {
            case "freebie":
              await strapi
                .service("api::freebie.freebie")
                .updateFreebie(userId, reward.amount);
              break;
            case "star_point":
              await strapi
                .service("api::star-point.star-point")
                .updateStarPoint(userId, reward.amount, "level_up");
              break;
            case "wheel_spin":
              await strapi
                .service("api::wheel-spin.wheel-spin")
                .updateWheelSpin(userId, reward.amount, "level_up");
              break;
          }
        }

        return result;
      });
    },
  })
);
