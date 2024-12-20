/**
 * relay controller
 */

import { factories } from "@strapi/strapi";
import { applyLocalizations } from "../../../utils";

export default factories.createCoreController(
  "api::relay.relay",
  ({ strapi }) => ({
    "get-relay-status": async (ctx, next) => {
      const userId = ctx.state.user?.id;

      if (!userId) {
        return ctx.unauthorized("user is not authenticated");
      }

      const relays = await strapi
        .service("api::relay.relay")
        .getCurrentRelays(userId);

      if (relays && relays.length === 0) {
        return ctx.notFound("no current relay");
      }

      const locale = ctx.request.query.locale || "en";
      for (const relay of relays) {
        applyLocalizations(relay, locale);
      }

      return relays;
    },

    "settle-past-relay": async (ctx, next) => {
      const userId = ctx.state.user?.id;

      if (!userId) {
        return ctx.unauthorized("user is not authenticated");
      }

      const results: {
        relay: Relay;
        rewards: Reward[];
      }[] = await strapi.service("api::relay.relay").settlePastRelay(userId);

      results.forEach((result) => {
        applyLocalizations(result.relay, ctx.query.locale);
      });

      return results;
    },

    "claim-rewards": async (ctx, next) => {
      const userId = ctx.state.user?.id;

      if (!userId) {
        return ctx.unauthorized("user is not authenticated");
      }

      const relayId = ctx.request.body.relayId;
      const relay = await strapi.entityService.findOne(
        "api::relay.relay",
        relayId,
        {
          fields: [
            "id",
            "title",
            "type",
            "condition",
            "start_date",
            "end_date",
            "group_size",
            "detail",
          ],
          populate: {
            reward_table: {
              populate: {
                rewards: true,
              },
            },
            banner: { field: ["url"] },
            token_image: { field: ["url"] },
            user_relay_tokens: {
              filters: {
                user: {
                  id: userId,
                },
              },
              fields: ["amount"],
              populate: {
                user: {
                  fields: ["id", "username"],
                },
              },
            },
            ranking_rewards: {
              populate: {
                rewards: true,
              },
            },
            relay_groups: {
              filters: {
                tokens: {
                  user: {
                    id: userId,
                  },
                },
              },
              fields: ["id"],
              populate: {
                tokens: {
                  fields: ["amount"],
                  populate: {
                    user: {
                      fields: ["username"],
                      populate: {
                        avatar: {
                          fields: ["id"],
                          populate: {
                            profile_picture: {
                              fields: ["id"],
                              populate: {
                                image: {
                                  fields: ["url"],
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        }
      );

      const { rewards } = await strapi
        .service("api::relay.relay")
        .claimRewards(userId, relay);

      return rewards;
    },
  })
);
