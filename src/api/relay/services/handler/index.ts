import probability from "./probability";
import reward_related from "./reward";
import attack from "./attack";

const Handler = {
  probability,
  reward_related,
  attack,
};

export default {
  verify: async (userId: number, relay: Relay, result: CapsuleResult) => {
    const condition = relay.condition;
    const handler = Handler[condition];

    if (!handler) {
      throw new Error("Invalid relay condition");
    }

    const tokens = await handler.verify(relay, result);

    if (tokens > 0) {
      // update user relay token
      await strapi
        .service("api::user-relay-token.user-relay-token")
        .updateRelayToken(userId, relay, tokens * result.multiply);
    }

    return tokens;
  },

  claimRewards: async (userId: number, relay: Relay) => {
    return (await strapi.db.transaction(async ({ trx }) => {
      // TODO: need lock
      const userRelayToken: RelayToken = (
        await strapi.entityService.findMany(
          "api::user-relay-token.user-relay-token",
          {
            filters: {
              user: {
                id: userId,
              },
              relay: {
                id: relay.id,
              },
            },
            fields: ["id", "amount"],
            populate: {
              history: true,
            },
          }
        )
      )[0];

      if (!userRelayToken) {
        return [];
      }

      const history: Partial<RelayTokenHistory>[] =
        userRelayToken.history || [];
      let lastScore = 0;

      if (history.length > 0) {
        history.sort((a, b) => a.score - b.score);
        lastScore = history[history.length - 1].score;
      }

      const rewards = [];

      const rewardTable = relay.reward_table;

      for (const info of rewardTable) {
        if (info.score > lastScore && info.score <= userRelayToken.amount) {
          rewards.push(...info.rewards);

          history.push({
            score: info.score,
            date: new Date(),
          });
        }
      }

      if (rewards.length > 0) {
        await strapi.entityService.update(
          "api::user-relay-token.user-relay-token",
          userRelayToken.id,
          {
            data: {
              history,
            },
          }
        );
      }

      return { rewards, total: userRelayToken.amount };
    })) as { rewards: Reward[]; total: number };
  },
};
