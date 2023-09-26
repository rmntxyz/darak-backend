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
      fields: ["id"],
    },
    partner_items: {
      fields: ["id"],
    },
  },
};

export default ({ strapi }) => ({
  async findItemOwners(
    itemId: number,
    pageNum: number = 1,
    pageSize: number = 10
  ) {
    let { rows } = await strapi.db.connection.raw(`
select
  INVENTORIES_ITEM_LINKS.ITEM_ID,
  COUNT(*),
  INVENTORIES_USERS_PERMISSIONS_USER_LINKS.USER_ID,
  UP_USERS.USERNAME,
  USER_ITEMS.ITEMS as USER_ITEMS
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
    ARRAY_AGG(distinct INVENTORIES_ITEM_LINKS.ITEM_ID) as ITEMS
  from
    INVENTORIES_USERS_PERMISSIONS_USER_LINKS
  inner join INVENTORIES on
    INVENTORIES_USERS_PERMISSIONS_USER_LINKS.INVENTORY_ID = INVENTORIES.ID
  inner join INVENTORIES_ITEM_LINKS on
    INVENTORIES.ID = INVENTORIES_ITEM_LINKS.INVENTORY_ID
  inner join ITEMS_ROOM_LINKS on
    INVENTORIES_ITEM_LINKS.ITEM_ID = ITEMS_ROOM_LINKS.ITEM_ID
  where
    ITEMS_ROOM_LINKS.ROOM_ID in (
    select
      ROOM_ID
    from
      ITEMS_ROOM_LINKS
    where
      ITEM_ID = ${itemId}
  )
  group by
    INVENTORIES_USERS_PERMISSIONS_USER_LINKS.USER_ID
) as USER_ITEMS on
  INVENTORIES_USERS_PERMISSIONS_USER_LINKS.USER_ID = USER_ITEMS.USER_ID
where
  INVENTORIES_ITEM_LINKS.ITEM_ID = ${itemId}
group by
  INVENTORIES_ITEM_LINKS.ITEM_ID,
  INVENTORIES_USERS_PERMISSIONS_USER_LINKS.USER_ID,
  UP_USERS.USERNAME,
  USER_ITEMS.ITEMS
order by
  COUNT desc
limit ${pageSize}
offset ${pageNum - 1} * ${pageSize};
      `);

    return rows;
  },

  async findNonItemOwners(
    itemId: number,
    pageNum: number = 1,
    pageSize: number = 10
  ) {
    let { rows } = await strapi.db.connection.raw(`
select
  ${itemId} as ITEM_ID,
  SUM(case when INVENTORIES_ITEM_LINKS.ITEM_ID = ${itemId} then 1 else 0 end) as COUNT,
  INVENTORIES_USERS_PERMISSIONS_USER_LINKS.USER_ID,
  UP_USERS.USERNAME,
  USER_ITEMS.ITEMS as USER_ITEMS
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
    ARRAY_AGG(distinct INVENTORIES_ITEM_LINKS.ITEM_ID) as ITEMS
  from
    INVENTORIES_USERS_PERMISSIONS_USER_LINKS
  inner join INVENTORIES on
    INVENTORIES_USERS_PERMISSIONS_USER_LINKS.INVENTORY_ID = INVENTORIES.ID
  inner join INVENTORIES_ITEM_LINKS on
    INVENTORIES.ID = INVENTORIES_ITEM_LINKS.INVENTORY_ID
  inner join ITEMS_ROOM_LINKS on
    INVENTORIES_ITEM_LINKS.ITEM_ID = ITEMS_ROOM_LINKS.ITEM_ID
  where
    ITEMS_ROOM_LINKS.ROOM_ID in (
    select
      ROOM_ID
    from
      ITEMS_ROOM_LINKS
    where
      ITEM_ID = ${itemId}
  )
  group by
    INVENTORIES_USERS_PERMISSIONS_USER_LINKS.USER_ID
) as USER_ITEMS on
  INVENTORIES_USERS_PERMISSIONS_USER_LINKS.USER_ID = USER_ITEMS.USER_ID
group by
  USER_ITEMS.ITEMS,
  INVENTORIES_USERS_PERMISSIONS_USER_LINKS.USER_ID,
  UP_USERS.USERNAME
order by
  count
limit ${pageSize}
offset ${pageNum - 1} * ${pageSize};
});
      `);

    return rows;
  },

  async findTradeDetail(roomId: number, userId: number, partnerId: number) {
    const me = await strapi
      .service("api::user-items.user-items")
      .findUserItemsByRoom(userId, roomId);

    const partner = await strapi
      .service("api::user-items.user-items")
      .findUserItemsByRoom(partnerId, roomId);

    return {
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
    // create trade

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
  async checkUserItems(userId: number, items: number[]) {
    const results = await Promise.all(
      items.map((inventoryId) => {
        return strapi.entityService.findOne(
          "api::inventory.inventory",
          inventoryId,
          {
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
    const { id, history } = trade;
    return await strapi.entityService.update("api::trade.trade", id, {
      ...tradeDefaultOptions,
      data: {
        status: "counter_proposed",
        history: [
          ...history,
          {
            status: "counter_proposed",
          },
        ],
        proposer_items: proposerItems.map((id) => ({ id })),
        partner_items: partnerItems.map((id) => ({ id })),
        proposer_read: false,
        partner_read: true,
      },
    });
  },

  async changeStatus(trade: Trade, status: TradeStatus, by?: number) {
    if (trade.status === status) {
      return trade;
    }

    const { id, history } = trade;

    return await strapi.entityService.update("api::trade.trade", id, {
      ...tradeDefaultOptions,
      data: {
        status,
        history: [
          ...history,
          {
            status,
          },
        ],
        proposer_read: by === trade.proposer.id,
        partner_read: by === trade.partner.id,
      },
    });
  },

  async acceptTrade(trade: Trade, userId?: number) {
    const { proposer, partner, proposer_items, partner_items } = trade;

    console.log("proposer_items", proposer_items);
    console.log("partner_items", partner_items);

    // update inventory
    await Promise.all([
      ...proposer_items.map((item) => {
        return strapi.entityService.update(
          "api::inventory.inventory",
          item.id,
          {
            data: {
              users_permissions_user: partner.id,
            },
          }
        );
      }),
      ...partner_items.map((item) => {
        return strapi.entityService.update(
          "api::inventory.inventory",
          item.id,
          {
            data: {
              users_permissions_user: proposer.id,
            },
          }
        );
      }),
    ]);

    // update trade
    return await strapi.entityService.update("api::trade.trade", trade.id, {
      ...tradeDefaultOptions,
      data: {
        status: "success",
        history: [
          ...trade.history,
          {
            status: "success",
          },
        ],
        proposer_read: userId === proposer.id,
        partner_read: userId === partner.id,
      },
    });
  },

  async getDailyTradeCount(userId: number) {
    // Check how many trades I have proposed per day
    const now = Date.now();
    const refTime = getRefTimestamp(now);
    return await strapi.db.query("api::trade.trade").count({
      where: {
        proposer: { id: userId },
        createdAt: { $gte: new Date(refTime).toISOString() },
      },
    });
  },
});
