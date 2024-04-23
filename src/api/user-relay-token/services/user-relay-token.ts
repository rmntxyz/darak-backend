/**
 * user-relay-token service
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreService(
  "api::user-relay-token.user-relay-token",
  ({ strapi }) => ({
    async updateRelayToken(userId: number, relayId: number, amount: number) {
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
          .andWhere("user_relay_tokens_relay_links.relay_id", relayId)
          .select("user_relay_tokens.*");

        if (userRelayToken) {
          return await strapi.entityService.update(
            "api::user-relay-token.user-relay-token",
            userRelayToken.id,
            {
              data: {
                amount: userRelayToken.amount + amount,
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
