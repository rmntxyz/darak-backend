/**
 * relay service
 */

import { factories } from "@strapi/strapi";

import relayHandler from "./handler";

export default factories.createCoreService(
  "api::relay.relay",
  ({ strapi }) => ({
    async getCurrentRelay(userId: number) {
      // between start_date and end_date

      const relay = await strapi.db.transaction(async ({ trx }) => {
        const now = new Date().toISOString();

        const relay = (
          await strapi.entityService.findMany("api::relay.relay", {
            filters: {
              start_date: { $lte: now },
              end_date: { $gt: now },
              publishedAt: { $ne: null },
            },
            fields: [
              "id",
              "type",
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
                        fields: ["id", "username"],
                        // populate: {
                        //   profile_image: {
                        //     fields: ["url"],
                        //   }
                        // }
                      },
                    },
                  },
                },
              },
            },
          })
        )[0];

        if (relay && relay.relay_groups.length === 0) {
          // lock relays
          await strapi.db
            .connection("relays")
            .transacting(trx)
            .forUpdate()
            .select("relays.*");

          // check tokens
          const groups = await strapi.db
            .connection("relay_groups")
            .transacting(trx)
            .forUpdate()
            .join(
              "relay_groups_relay_links",
              "relay_groups.id",
              "relay_groups_relay_links.relay_group_id"
            )
            .where("relay_groups_relay_links.relay_id", relay.id)
            .select("relay_groups.*");

          let group;

          const availableGroups = groups.filter((group) => {
            return group.num_members < relay.group_size;
          });

          if (availableGroups.length === 0) {
            //create group
            group = await strapi.entityService.create(
              "api::relay-group.relay-group",
              {
                data: {
                  relay: { id: relay.id },
                  num_members: 0,
                  publishedAt: new Date(),
                },
                fields: ["id", "num_members"],
              }
            );
          } else {
            // find minimum group
            group = availableGroups.reduce((prev, curr) =>
              prev.num_members < curr.num_members ? prev : curr
            );
          }

          await strapi.entityService.create(
            "api::user-relay-token.user-relay-token",
            {
              data: {
                user: { id: userId },
                relay: { id: relay.id },
                relay_group: { id: group.id },
                amount: 0,
                publishedAt: new Date(),
              },
            }
          );

          const updated = await strapi.entityService.update(
            "api::relay-group.relay-group",
            group.id,
            {
              data: {
                num_members: group.num_members + 1,
              },
              fields: ["num_members"],
              populate: {
                relay: {
                  fields: ["id"],
                },
                tokens: {
                  fields: ["amount"],
                  populate: {
                    user: {
                      fields: ["id", "username"],
                    },
                  },
                },
              },
            }
          );

          relay.relay_groups = [updated];
        }

        return relay;
      });

      return relay;
    },

    async verify(userId: number, relay: Relay, result: CapsuleResult) {
      return relayHandler.verify(userId, relay, result);
    },

    async claimRewards(userId: number, relay: Relay) {
      return relayHandler.claimRewards(userId, relay);
    },
  })
);
