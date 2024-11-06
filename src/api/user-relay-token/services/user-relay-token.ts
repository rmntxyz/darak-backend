/**
 * user-relay-token service
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreService(
  "api::user-relay-token.user-relay-token",
  ({ strapi }) => ({
    async updateRelayToken(userId: number, relay: Relay, amount: number) {
      return await strapi.db.transaction(async ({ trx }) => {
        const [userRelayToken] = await strapi.db
          .connection("user_relay_tokens")
          .transacting(trx)
          .forUpdate()
          .join(
            "user_relay_tokens_user_links",
            "user_relay_tokens.id",
            "user_relay_tokens_user_links.user_relay_token_id"
          )
          .join(
            "user_relay_tokens_relay_links",
            "user_relay_tokens.id",
            "user_relay_tokens_relay_links.user_relay_token_id"
          )
          .where("user_relay_tokens_user_links.user_id", userId)
          .andWhere("user_relay_tokens_relay_links.relay_id", relay.id)
          .select("user_relay_tokens.*");

        if (userRelayToken) {
          const newAmount = userRelayToken.amount + amount;

          if (relay.type === "with_group_ranking") {
            const minTokens = relay.min_tokens || 0;
            const currentAmount = userRelayToken.amount;

            if (
              (currentAmount === 0 || currentAmount < minTokens) &&
              newAmount >= minTokens
            ) {
              // join a group
              await strapi
                .service("api::relay.relay")
                .joinRelayGroup(relay, userRelayToken);
            }
          }

          return await strapi.entityService.update(
            "api::user-relay-token.user-relay-token",
            userRelayToken.id,
            {
              data: {
                amount: newAmount,
              },
              fields: ["amount"],
            }
          );
        }

        return null;
      });
    },
  })
);

// data: {
//   user: { id: userId },
//   relay: { id: relay.id },
//   relay_group: { id: group.id },
//   amount: 0,
//   publishedAt: new Date(),
// },
