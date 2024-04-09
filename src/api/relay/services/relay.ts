/**
 * relay service
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreService(
  "api::relay.relay",
  ({ strapi }) => ({
    async getCurrentRelay(userId: number) {
      // between start_date and end_date

      const now = new Date().toISOString();

      const relay = (
        await strapi.entityService.findMany("api::relay.relay", {
          filters: {
            start_date: { $lte: now },
            end_date: { $gt: now },
            publishedAt: { $ne: null },
          },
          fields: ["id", "start_date", "end_date", "group_size"],
          populate: {
            reward_table: true,
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
        const relay_groups = await strapi.db.transaction(async ({ trx }) => {
          // check tokens
          // const groups = await strapi.db
          //   .connection("relay_groups")
          //   .transacting(trx)
          //   .forUpdate()
          //   .join(
          //     "relay_groups_tokens_links",
          //     "relay_groups.id",
          //     "relay_groups_tokens_links.relay_group_id"
          //   )
          //   .join(
          //     "relay_groups_relay_links",
          //     "relay_groups.id",
          //     "relay_groups_relay_links.relay_group_id"
          //   )
          //   .groupBy("relay_groups.id")
          //   .where("relay_groups_relay_links.relay_id", relay.id)
          //   .select("relay_groups.id")
          //   .count("relay_groups_tokens_links.id as count");

          const groups = await strapi.entityService.findMany(
            "api::relay-group.relay-group",
            {
              filters: {
                relay: { id: relay.id },
              },
              fields: ["id"],
              populate: {
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

          console.log(groups);

          let group;

          const availableGroups = groups.filter((group) => {
            return group.tokens.length < relay.group_size;
          });

          if (availableGroups.length === 0) {
            //create group
            group = await strapi.entityService.create(
              "api::relay-group.relay-group",
              {
                data: {
                  relay: { id: relay.id },
                  publishedAt: new Date(),
                },
                fields: ["id"],
                populate: {
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
          } else {
            // find minimum group
            group = availableGroups.reduce((prev, curr) =>
              prev.tokens.length < curr.tokens.length ? prev : curr
            );
          }

          // wait 3 seconds
          await new Promise((resolve) => setTimeout(resolve, 5000));

          // console.log(groups);
          const token = await strapi.entityService.create(
            "api::user-relay-token.user-relay-token",
            {
              data: {
                user: { id: userId },
                relay_groups: { id: group.id },
                amount: 0,
                publishedAt: new Date(),
              },
              fields: ["id", "amount"],
              populate: {
                user: {
                  fields: ["id", "username"],
                },
              },
            }
          );

          group.tokens.push(token);

          return [group];
        });

        relay.relay_groups = relay_groups;
      }

      return relay;
    },
  })
);
