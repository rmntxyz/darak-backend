/**
 * relay service
 */

import { factories } from "@strapi/strapi";

import relayHandler from "./handler";

export default factories.createCoreService(
  "api::relay.relay",
  ({ strapi }) => ({
    async getCurrentRelays(userId: number) {
      // between start_date and end_date

      const relays = await strapi.db.transaction(async ({ trx }) => {
        const now = new Date().toISOString();

        const relays = await strapi.entityService.findMany("api::relay.relay", {
          filters: {
            start_date: { $lte: now },
            end_date: { $gt: now },
            publishedAt: { $ne: null },
          },
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
        });

        for (const relay of relays) {
          if (relay && relay.user_relay_tokens.length === 0) {
            // lock relays
            await strapi.db
              .connection("relays")
              .transacting(trx)
              .forUpdate()
              .where("id", relay.id)
              .select("relays.*");

            if (relay.type === "relay_only") {
              const userToken = await strapi.entityService.create(
                "api::user-relay-token.user-relay-token",
                {
                  fields: ["amount"],
                  populate: {
                    user: {
                      fields: ["id", "username"],
                    },
                  },
                  data: {
                    user: { id: userId },
                    relay: { id: relay.id },
                    amount: 0,
                    publishedAt: new Date(),
                  },
                }
              );
              relay.user_relay_tokens = [userToken];
            } else if (relay.type === "with_group_ranking") {
              // check tokens
              let groups = await strapi.db
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

              if (groups.length === 0) {
                const userCount = await strapi.db
                  .query("plugin::users-permissions.user")
                  .count();

                const willCreate = Math.ceil(userCount / 4 / relay.group_size);

                const promises = Array.from({ length: willCreate }).map(
                  async () => {
                    return await strapi.entityService.create(
                      "api::relay-group.relay-group",
                      {
                        data: {
                          relay: { id: relay.id },
                          num_members: 0,
                          publishedAt: new Date(),
                        },
                      }
                    );
                  }
                );
                groups = await Promise.all(promises);
              }

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

              const userToken = await strapi.entityService.create(
                "api::user-relay-token.user-relay-token",
                {
                  fields: ["amount"],
                  populate: {
                    user: {
                      fields: ["id", "username"],
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
                  fields: ["id"],
                  populate: {
                    tokens: {
                      fields: ["amount"],
                      populate: {
                        user: {
                          fields: ["id", "username"],
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
                }
              );

              relay.user_relay_tokens = [userToken];
              relay.relay_groups = [updated];
            }
          }
        }

        return relays;
      });

      return relays;
    },

    async settlePastRelay(userId: number) {
      const results = await strapi.db.transaction(async ({ trx }) => {
        const now = new Date().toISOString();

        const tokens = await strapi.entityService.findMany(
          "api::user-relay-token.user-relay-token",
          {
            filters: {
              user: { id: userId },
              relay: { $not: null },
              $or: [
                {
                  result_settled: false,
                },
                {
                  result_settled: { $null: true },
                },
              ],
            },
            populate: {
              relay: {
                filters: {
                  end_date: { $lt: now },
                  publishedAt: { $ne: null },
                },
                populate: {
                  ranking_rewards: {
                    populate: {
                      rewards: true,
                    },
                  },
                },
              },
              relay_group: {
                populate: {
                  tokens: true,
                },
              },
            },
          }
        );

        const promises = tokens.map(async (token) => {
          // update user-relay-token's result_settled
          console.log(token);
          await strapi.entityService.update(
            "api::user-relay-token.user-relay-token",
            token.id,
            {
              data: {
                result_settled: true,
              },
            }
          );

          if (token.relay?.type !== "with_group_ranking") {
            return;
          }

          // sort token.relay_group.tokens by amount
          token.relay_group.tokens.sort((a, b) => b.amount - a.amount);

          let rank = 1;
          const rankMap = token.relay_group.tokens.reduce((acc, cur, idx) => {
            if (acc[cur.amount] === undefined) {
              acc[cur.amount] = rank++;
            }
            return acc;
          }, {});

          const rankOfUser = rankMap[token.amount];

          // claim rewards
          // 랭크에 매핑된 순위가 리워드에 존재하면 그 리워드를 받는다.
          // 만약 ranking_rewards에 매칭되는 순위가 없다면, 해당 ranking_rewards의 마지막 리워드를 받는다.

          token.relay.ranking_rewards.sort((a, b) => a.ranking - b.ranking);

          const rewards: Reward[] = [];
          for (const list of token.relay.ranking_rewards) {
            if (list.ranking === rankOfUser) {
              rewards.push(...list.rewards);
              break;
            }
          }
          if (rewards.length === 0) {
            rewards.push(
              ...token.relay.ranking_rewards[
                token.relay.ranking_rewards.length - 1
              ].rewards
            );
          }

          return {
            relay: token.relay,
            rewards,
          };
        });

        let results = (await Promise.all(promises)) as {
          relay: Relay;
          rewards: Reward[];
        }[];
        results = results.filter((result) => result);

        const rewards = [];
        for (const result of results) {
          // reduce by reward type

          if (!result) {
            continue;
          }

          result.rewards.forEach((reward) => {
            const found = rewards.find((r) => r.type === reward.type);
            if (found) {
              found.amount += reward.amount;
            } else {
              rewards.push(reward);
            }
          });
        }

        if (rewards.length > 0) {
          await strapi
            .service("api::reward.reward")
            .claim(userId, rewards, "relay_ranking_reward");
        }

        return results;
      });

      return results;
    },

    async verify(userId: number, relay: Relay, result: CapsuleResult) {
      return relayHandler.verify(userId, relay, result);
    },

    async claimRewards(userId: number, relay: Relay) {
      const { rewards, total } = await relayHandler.claimRewards(userId, relay);

      await strapi
        .service("api::reward.reward")
        .claim(userId, rewards, "relay_reward");

      return { rewards, total };
    },
  })
);
