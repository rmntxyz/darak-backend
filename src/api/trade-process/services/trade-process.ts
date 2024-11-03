import {
  EXP_BY_RARITY,
  ErrorCode,
  TRADE_NOTIFICATIONS,
} from "../../../constant";
import { getRefTimestamp } from "../../../utils";

/**
 * trade-process service
 */
export const tradeDefaultOptions = {
  populate: {
    history: true,
    proposer: {
      fields: ["id"],
    },
    partner: {
      fields: ["id"],
    },
    proposer_items: {
      fields: ["id", "status"],
    },
    partner_items: {
      fields: ["id", "status"],
    },
  },
};

export const tradeDetailOptions = {
  populate: {
    history: true,
    proposer: {
      fields: ["username"],
      // populate: {
      //   status: {
      //     fields: ["level"],
      //   },
      //   avatar: {
      //     fields: ["id"],
      //     populate: {
      //       profile_picture: {
      //         fields: ["id"],
      //         populate: {
      //           image: {
      //             fields: ["url"],
      //           },
      //         },
      //       },
      //     },
      //   },
      // },
    },
    partner: {
      fields: ["username"],
      // populate: {
      //   status: {
      //     fields: ["level"],
      //   },
      //   avatar: {
      //     fields: ["id"],
      //     populate: {
      //       profile_picture: {
      //         fields: ["id"],
      //         populate: {
      //           image: {
      //             fields: ["url"],
      //           },
      //         },
      //       },
      //     },
      //   },
      // },
    },
    proposer_items: {
      fields: ["serial_number", "status"],
      populate: {
        item: {
          fields: ["name", "rarity"],
          populate: {
            thumbnail: {
              fields: ["url"],
            },
            room: {
              fields: ["name"],
              populate: {
                localizations: {
                  fields: ["name", "locale"],
                },
              },
            },
            localizations: {
              fields: ["name", "locale"],
            },
          },
        },
      },
    },
    partner_items: {
      fields: ["serial_number", "status"],
      populate: {
        item: {
          fields: ["name", "rarity"],
          populate: {
            thumbnail: {
              fields: ["url"],
            },
            room: {
              fields: ["name"],
              populate: {
                localizations: {
                  fields: ["name", "locale"],
                },
              },
            },
            localizations: {
              fields: ["name", "locale"],
            },
          },
        },
      },
    },
  },
};

export default ({ strapi }) => ({
  async findItemOwners(
    itemId: number,
    pageNum: number = 1,
    pageSize: number = 10
  ) {
    let {
      rows: [{ room_id }],
    } = await strapi.db.connection.raw(`
select
  ROOM_ID
from
  ITEMS_ROOM_LINKS
where
  ITEM_ID = ${itemId}
     `);

    const total_count = await strapi.db.query("api::item.item").count({
      where: {
        room: { id: room_id },
        category: "decoration",
      },
    });

    let { rows } = await strapi.db.connection.raw(`
select
  ${room_id} as ROOM_ID,
  INVENTORIES_ITEM_LINKS.ITEM_ID,
  COUNT(*),
  INVENTORIES_USERS_PERMISSIONS_USER_LINKS.USER_ID,
  UP_USERS.USERNAME,
  USER_ITEMS.COUNT as USER_COLLECTION_COUNT,
  FILES.URL as AVATAR
from
  INVENTORIES
inner join INVENTORIES_ITEM_LINKS on
  INVENTORIES.ID = INVENTORIES_ITEM_LINKS.INVENTORY_ID
inner join INVENTORIES_USERS_PERMISSIONS_USER_LINKS on
  INVENTORIES.ID = INVENTORIES_USERS_PERMISSIONS_USER_LINKS.INVENTORY_ID
inner join UP_USERS on
  INVENTORIES_USERS_PERMISSIONS_USER_LINKS.USER_ID = UP_USERS.ID
left join (
  select
    INVENTORIES_USERS_PERMISSIONS_USER_LINKS.USER_ID,
    COUNT(distinct INVENTORIES_ITEM_LINKS.ITEM_ID)
  from
    INVENTORIES_USERS_PERMISSIONS_USER_LINKS
  inner join INVENTORIES on
    INVENTORIES_USERS_PERMISSIONS_USER_LINKS.INVENTORY_ID = INVENTORIES.ID
  inner join INVENTORIES_ITEM_LINKS on
    INVENTORIES.ID = INVENTORIES_ITEM_LINKS.INVENTORY_ID
  inner join ITEMS_ROOM_LINKS on
    INVENTORIES_ITEM_LINKS.ITEM_ID = ITEMS_ROOM_LINKS.ITEM_ID
  where
    ITEMS_ROOM_LINKS.ROOM_ID = ${room_id}
  group by
    INVENTORIES_USERS_PERMISSIONS_USER_LINKS.USER_ID
) as USER_ITEMS on
  INVENTORIES_USERS_PERMISSIONS_USER_LINKS.USER_ID = USER_ITEMS.USER_ID
left join UP_USERS_AVATAR_LINKS on
  UP_USERS.ID = UP_USERS_AVATAR_LINKS.USER_ID
left join USER_PROFILE_PICTURES_PROFILE_PICTURE_LINKS on
  UP_USERS_AVATAR_LINKS.USER_PROFILE_PICTURE_ID = USER_PROFILE_PICTURES_PROFILE_PICTURE_LINKS.USER_PROFILE_PICTURE_ID
left join PROFILE_PICTURES on
  USER_PROFILE_PICTURES_PROFILE_PICTURE_LINKS.PROFILE_PICTURE_ID = PROFILE_PICTURES.ID
left join FILES_RELATED_MORPHS on
  PROFILE_PICTURES.ID = FILES_RELATED_MORPHS.RELATED_ID
  and FILES_RELATED_MORPHS.RELATED_TYPE = 'api::profile-picture.profile-picture'
  and FILES_RELATED_MORPHS.FIELD = 'image'
left join FILES on
  FILES_RELATED_MORPHS.FILE_ID = FILES.ID
where
  INVENTORIES_ITEM_LINKS.ITEM_ID = ${itemId}
  and UP_USERS.DEACTIVATED is not true
group by
  INVENTORIES_ITEM_LINKS.ITEM_ID,
  INVENTORIES_USERS_PERMISSIONS_USER_LINKS.USER_ID,
  UP_USERS.USERNAME,
  UP_USERS.DEACTIVATED,
  USER_ITEMS.COUNT,
  FILES.URL
having
  COUNT(*) >= 2
order by
  COUNT desc, USER_COLLECTION_COUNT desc, INVENTORIES_USERS_PERMISSIONS_USER_LINKS.USER_ID
limit ${pageSize}
offset ${pageNum - 1} * ${pageSize};
      `);

    for (const row of rows) {
      const count = row.user_collection_count;
      const completion_rate = Math.round((count / total_count) * 100);
      delete row.user_collection_count;
      row.count = Number(row.count);
      row.completion_rate = completion_rate;
    }

    return rows;
  },

  async findNonItemOwners(
    itemId: number,
    pageNum: number = 1,
    pageSize: number = 10
  ) {
    let {
      rows: [{ room_id }],
    } = await strapi.db.connection.raw(`
SELECT
  ROOM_ID
FROM
  ITEMS_ROOM_LINKS
WHERE
  ITEM_ID = ${itemId}
     `);

    const total_count = await strapi.db.query("api::item.item").count({
      where: {
        room: { id: room_id },
        category: "decoration",
      },
    });

    let { rows } = await strapi.db.connection.raw(`
select
  ${room_id} as ROOM_ID,
  ${itemId} as ITEM_ID,
  SUM(case when INVENTORIES_ITEM_LINKS.ITEM_ID = ${itemId} then 1 else 0 end) as COUNT,
  INVENTORIES_USERS_PERMISSIONS_USER_LINKS.USER_ID,
  UP_USERS.USERNAME,
  USER_ITEMS.COUNT as USER_COLLECTION_COUNT,
  FILES.URL as AVATAR
from
  INVENTORIES
inner join INVENTORIES_ITEM_LINKS on
  INVENTORIES.ID = INVENTORIES_ITEM_LINKS.INVENTORY_ID
inner join ITEMS_ROOM_LINKS on
  ITEMS_ROOM_LINKS.ITEM_ID = INVENTORIES_ITEM_LINKS.ITEM_ID
inner join INVENTORIES_USERS_PERMISSIONS_USER_LINKS on
  INVENTORIES.ID = INVENTORIES_USERS_PERMISSIONS_USER_LINKS.INVENTORY_ID
inner join UP_USERS on
  INVENTORIES_USERS_PERMISSIONS_USER_LINKS.USER_ID = UP_USERS.ID
left join (
  select
    INVENTORIES_USERS_PERMISSIONS_USER_LINKS.USER_ID,
    COUNT(distinct INVENTORIES_ITEM_LINKS.ITEM_ID)
  from
    INVENTORIES_USERS_PERMISSIONS_USER_LINKS
  inner join INVENTORIES on
    INVENTORIES_USERS_PERMISSIONS_USER_LINKS.INVENTORY_ID = INVENTORIES.ID
  inner join INVENTORIES_ITEM_LINKS on
    INVENTORIES.ID = INVENTORIES_ITEM_LINKS.INVENTORY_ID
  inner join ITEMS_ROOM_LINKS on
    INVENTORIES_ITEM_LINKS.ITEM_ID = ITEMS_ROOM_LINKS.ITEM_ID
  where
    ITEMS_ROOM_LINKS.ROOM_ID = ${room_id}
  group by
    INVENTORIES_USERS_PERMISSIONS_USER_LINKS.USER_ID
) as USER_ITEMS on
  INVENTORIES_USERS_PERMISSIONS_USER_LINKS.USER_ID = USER_ITEMS.USER_ID
left join UP_USERS_AVATAR_LINKS on
  UP_USERS.ID = UP_USERS_AVATAR_LINKS.USER_ID
left join USER_PROFILE_PICTURES_PROFILE_PICTURE_LINKS on
  UP_USERS_AVATAR_LINKS.USER_PROFILE_PICTURE_ID = USER_PROFILE_PICTURES_PROFILE_PICTURE_LINKS.USER_PROFILE_PICTURE_ID
left join PROFILE_PICTURES on
  USER_PROFILE_PICTURES_PROFILE_PICTURE_LINKS.PROFILE_PICTURE_ID = PROFILE_PICTURES.ID
left join FILES_RELATED_MORPHS on
  PROFILE_PICTURES.ID = FILES_RELATED_MORPHS.RELATED_ID
  and FILES_RELATED_MORPHS.RELATED_TYPE = 'api::profile-picture.profile-picture'
  and FILES_RELATED_MORPHS.FIELD = 'image'
left join FILES on
  FILES_RELATED_MORPHS.FILE_ID = FILES.ID
where
  ITEMS_ROOM_LINKS.ROOM_ID = ${room_id}
  and UP_USERS.DEACTIVATED is not true
group by
  USER_ITEMS.COUNT,
  INVENTORIES_USERS_PERMISSIONS_USER_LINKS.USER_ID,
  UP_USERS.USERNAME,
  UP_USERS.DEACTIVATED,
  FILES.URL
order by
  COUNT, USER_COLLECTION_COUNT desc, INVENTORIES_USERS_PERMISSIONS_USER_LINKS.USER_ID
limit ${pageSize}
offset ${pageNum - 1} * ${pageSize};
      `);

    for (const row of rows) {
      const count = row.user_collection_count;
      const completion_rate = Math.round((count / total_count) * 100);
      delete row.user_collection_count;
      row.count = Number(row.count);
      row.completion_rate = completion_rate;
    }

    return rows;
  },

  async findTradeDetail(roomId: number, userId: number, partnerId: number) {
    const all_rooms = await strapi.entityService.findMany("api::room.room", {
      filters: {
        publishedAt: { $ne: null },
      },
      fields: ["name"],
      populate: {
        image_complete: {
          fields: ["url"],
        },
        localizations: {
          fields: ["name", "locale"],
        },
      },
    });

    const me = await strapi
      .service("api::user-items.user-items")
      .findUserItemsByRoom(userId, roomId);

    const partner = await strapi
      .service("api::user-items.user-items")
      .findUserItemsByRoom(partnerId, roomId);

    return {
      all_rooms,
      me,
      partner,
    };
  },

  async proposeTrade(
    userId: number,
    partnerId: number,
    proposerItems: number[],
    partnerItems: number[]
  ) {
    await strapi
      .service("api::trade-process.trade-process")
      .changeItemsStatus([...proposerItems], "trading");

    // expires = new Date() + 48 hours
    const now = Date.now();
    const expires = new Date(now + 48 * 60 * 60 * 1000);

    return await strapi.entityService.create("api::trade.trade", {
      ...tradeDefaultOptions,
      data: {
        expires,
        status: "proposed",
        history: [
          {
            status: "proposed",
            date: now,
          },
        ],
        proposer_items: proposerItems.map((id) => ({ id })),
        partner_items: partnerItems.map((id) => ({ id })),
        proposer_read: true,
        partner_read: false,
        proposer: {
          id: userId,
        },
        partner: {
          id: partnerId,
        },
        publishedAt: now,
      },
    });
  },

  // check if user has enough items in inventory to trade
  async checkUserItems(items: number[], userId: number) {
    const results = await Promise.all(
      items.map((inventoryId) => {
        return strapi.entityService.findOne(
          "api::inventory.inventory",
          inventoryId,
          {
            fields: ["id", "status"],
            populate: {
              users_permissions_user: {
                fields: ["id"],
              },
            },
          }
        );
      })
    );

    return results.every(
      (result) => result?.users_permissions_user?.id === userId
    );
  },

  async counterProposeTrade(
    trade: Trade,
    proposerItems: number[],
    partnerItems: number[]
  ) {
    const { id, history, proposer_items, partner_items } = trade;
    const now = Date.now();

    // rollback status of previous items to owned
    await strapi
      .service("api::trade-process.trade-process")
      .changeItemsStatus([...proposer_items.map((x) => x.id)], "owned");

    // then change status of new items to trading
    await strapi
      .service("api::trade-process.trade-process")
      .changeItemsStatus([...partnerItems], "trading");

    return await strapi.entityService.update("api::trade.trade", id, {
      ...tradeDefaultOptions,
      data: {
        status: "counter_proposed",
        history: [
          ...history,
          {
            status: "counter_proposed",
            date: now,
          },
        ],
        proposer_items: proposerItems.map((id) => ({ id })),
        partner_items: partnerItems.map((id) => ({ id })),
        proposer_read: false,
        partner_read: true,
      },
    });
  },

  async acceptTrade(trade: Trade) {
    const { proposer, partner, proposer_items, partner_items } = trade;

    // update inventory
    await Promise.all(
      proposer_items.map((item) => {
        return strapi.entityService.update(
          "api::inventory.inventory",
          item.id,
          {
            data: {
              users_permissions_user: partner.id,
            },
          }
        );
      })
    );

    await Promise.all(
      partner_items.map((item) => {
        return strapi.entityService.update(
          "api::inventory.inventory",
          item.id,
          {
            data: {
              users_permissions_user: proposer.id,
            },
          }
        );
      })
    );

    const tradeInfo: {
      [roomId: number]: {
        proposerItems?: { id: number; rarity: string }[];
        partnerItems?: { id: number; rarity: string }[];
      };
    } = {};
    proposer_items
      .map((each) => ({
        itemId: each.item.id,
        roomId: each.item.room.id,
        rarity: each.item.rarity,
      }))
      .reduce((acc, each) => {
        if (!acc[each.roomId]) {
          acc[each.roomId] = {
            proposerItems: [],
            partnerItems: [],
          };
        }
        acc[each.roomId].proposerItems!.push({
          id: each.itemId,
          rarity: each.rarity,
        });
        return acc;
      }, tradeInfo);
    partner_items
      .map((each) => ({
        itemId: each.item.id,
        roomId: each.item.room.id,
        rarity: each.item.rarity,
      }))
      .reduce((acc, each) => {
        if (!acc[each.roomId]) {
          acc[each.roomId] = {
            proposerItems: [],
            partnerItems: [],
          };
        }
        acc[each.roomId].partnerItems!.push({
          id: each.itemId,
          rarity: each.rarity,
        });
        return acc;
      }, tradeInfo);

    for (const [roomId, { proposerItems, partnerItems }] of Object.entries(
      tradeInfo
    )) {
      const proposerRoom = await strapi
        .service("api::user-room.user-room")
        .getUserRoom(proposer.id, roomId);

      const partnerRoom = await strapi
        .service("api::user-room.user-room")
        .getUserRoom(partner.id, roomId);

      // if item to trade is only item in room, throw error
      let partnerExp = 0;
      for (const { id, rarity } of proposerItems!) {
        if (proposerRoom.owned_items[id] === 1) {
          throw ErrorCode.NOT_ENOUGH_PROPOSER_ITEMS;
        }

        if (this.checkFirstItem(partnerRoom, id)) {
          partnerExp += EXP_BY_RARITY[rarity];
        }
      }

      let proposerExp = 0;
      for (const { id, rarity } of partnerItems!) {
        if (partnerRoom.owned_items[id] === 1) {
          throw ErrorCode.NOT_ENOUGH_PARTNER_ITEMS;
        }

        if (this.checkFirstItem(proposerRoom, id)) {
          proposerExp += EXP_BY_RARITY[rarity];
        }
      }

      if (partnerExp !== 0) {
        await strapi
          .service("api::status.status")
          .updateExp(partner.id, partnerExp);
      }
      if (proposerExp !== 0) {
        await strapi
          .service("api::status.status")
          .updateExp(proposer.id, proposerExp);
      }

      const partnerItemIds = partnerItems!.map((x) => x.id);
      const proposerItemIds = proposerItems!.map((x) => x.id);

      await strapi
        .service("api::user-room.user-room")
        .updateItems(proposerRoom, partnerItemIds, proposerItemIds);

      await strapi
        .service("api::user-room.user-room")
        .updateItems(partnerRoom, proposerItemIds, partnerItemIds);
    }
  },

  async changeItemsStatus(inventoryIds: number[], status: UserItemStatus) {
    return await Promise.all(
      inventoryIds.map((id) => {
        return strapi.entityService.update("api::inventory.inventory", id, {
          data: {
            status,
          },
        });
      })
    );
  },

  checkFirstItem(userRoom: UserRoom, itemId: number) {
    return userRoom.owned_items[itemId] === undefined;
  },

  /**
   * Change trade status for success, failed, rejected, canceled, expired
   * @param trade
   * @param status
   * @param by
   * @returns
   */
  async changeStatus(trade: Trade, status: TradeStatus, by?: number) {
    if (trade.status === status) {
      return trade;
    }

    const { id, history, proposer_items, partner_items } = trade;
    const now = Date.now();

    const prevStatus = trade.status;
    const target = prevStatus === "proposed" ? proposer_items : partner_items;
    const changeToOwned = target
      .filter((item) => item.status === "trading")
      .map((x) => x.id);

    await strapi
      .service("api::trade-process.trade-process")
      .changeItemsStatus(changeToOwned, "owned");

    return await strapi.entityService.update("api::trade.trade", id, {
      ...tradeDetailOptions,
      data: {
        status,
        history: [
          ...history,
          {
            status,
            date: now,
          },
        ],
        proposer_read: by === trade.proposer.id,
        partner_read: by === trade.partner.id,
      },
    });
  },

  sendTradeNotification: async (
    tradeId: number,
    from: number,
    to: number,
    reason: keyof typeof TRADE_NOTIFICATIONS
  ) => {
    let { device_token, language } = await strapi.entityService.findOne(
      "plugin::users-permissions.user",
      to,
      {
        fields: ["device_token", "language"],
      }
    );

    language = language || "en";

    if (device_token) {
      const { username } = await strapi.entityService.findOne(
        "plugin::users-permissions.user",
        from,
        {
          fields: ["username"],
        }
      );

      const { notification } = strapi as unknown as ExtendedStrapi;
      const { title, body } = TRADE_NOTIFICATIONS[reason];

      return await notification.sendNotification(device_token, {
        notification: {
          title: title[language].replace("${username}", username),
          body: body[language].replace("${username}", username),
        },
        data: {
          data: JSON.stringify({
            type: "trade",
            tradeId: tradeId,
          }),
        },
      });
    } else {
      throw ErrorCode.DEVICE_TOKEN_NOT_FOUND;
    }
  },

  // DEPRECATED
  async getDailyTradeCount(userId: number) {
    // Check how many trades I have proposed per day
    const now = Date.now();
    const refTime = getRefTimestamp(now);
    return await strapi.db.query("api::trade.trade").count({
      where: {
        proposer: { id: userId },
        createdAt: { $gte: new Date(refTime).toISOString() },
        $not: {
          status: "failed",
        },
      },
      limit: 3,
    });
  },
});
