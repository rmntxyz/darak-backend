/**
 * random-item service
 */

import {
  ErrorCode,
  DAILY_DRAW_LIMIT,
  ITEM_PROBABILITY,
} from "../../../constant";

export default ({ strapi }) => ({
  async getRandomItemsFromUnlockedRooms(
    userId: number,
    count: number,
    rarities: string[] = ["common", "uncommon", "rare", "unique", "secret"]
  ) {
    return await strapi.db.transaction(async ({ trx }) => {
      const userRooms = await strapi
        .service("api::user-room.user-room")
        .getUserRooms(userId);

      const itemCandidates = rarities.reduce((acc, rarity) => {
        acc[rarity] = [];
        return acc;
      }, {});

      for (const userRoom of userRooms) {
        const { items } = userRoom.room;
        const decorations = items.filter(
          (item) => item.category === "decoration"
        );

        for (const item of decorations) {
          if (itemCandidates[item.rarity]) {
            itemCandidates[item.rarity].push(item);
          }
        }
      }

      const results = [];

      const filtered = ["secret", "unique", "rare", "uncommon", "common"]
        .filter((rarity) => itemCandidates[rarity]?.length > 0)
        .map((rarity) => ({
          probability: ITEM_PROBABILITY[rarity],
          items: itemCandidates[rarity],
        }));

      if (filtered.length === 0) {
        throw ErrorCode.NOT_FOUND_ITEM_LIST;
      }

      // set probability of last one of filtered to 1
      const last = filtered[filtered.length - 1];
      last.probability = 1;

      for (let i = 0; i < count; i++) {
        const random = Math.random();
        let probability = 0;

        for (const { probability: p, items } of filtered) {
          probability += p;

          if (random < probability && items.length > 0) {
            const item = items[Math.floor(Math.random() * items.length)];
            results.push(item);
            break;
          }
        }
      }

      return results;
    });
  },

  async addItemsToUserInventory(userId: number, itemIds: number[]) {
    return await strapi.db.transaction(async ({ trx }) => {
      let userItems = [];

      for (const itemId of itemIds) {
        const [{ current_serial_number }] = await strapi.db
          .connection("items")
          .transacting(trx)
          .forUpdate()
          .where("id", itemId)
          .select("current_serial_number");

        const updatedItem = await strapi.entityService.update(
          "api::item.item",
          itemId,
          {
            data: { current_serial_number: current_serial_number + 1 },
          }
        );

        const userItem = await strapi.entityService.create(
          "api::inventory.inventory",
          {
            data: {
              users_permissions_user: userId,
              serial_number: current_serial_number + 1,
              item: itemId,
              publishedAt: new Date(),
            },
            fields: ["serial_number"],
            populate: {
              item: {
                fields: ["name", "desc", "rarity", "attribute"],
                populate: {
                  image: {
                    fields: ["url"],
                  },
                  thumbnail: {
                    fields: ["url"],
                  },
                  room: {
                    fields: ["name", "rid"],
                  },
                },
              },
              users_permissions_user: { fields: ["id"] },
            },
          }
        );

        userItems.push(userItem);
      }

      return userItems;
    });
  },

  async drawRandom(userId: number, drawId: number) {
    let items = [];

    await strapi.db.transaction(async ({ trx }) => {
      const drawCount = await strapi
        .service("api::draw-history.draw-history")
        .getDailyDrawCountByDraw(userId, drawId);

      if (drawCount >= DAILY_DRAW_LIMIT) {
        throw ErrorCode.DAILY_DRAW_LIMIT_EXCEEDED;
      }

      const draw = await strapi.entityService.findOne(
        "api::draw.draw",
        drawId,
        {
          populate: {
            room: {
              fields: ["start_date", "end_date", "id"],
            },
          },
        }
      );

      if (!draw) {
        throw ErrorCode.DRAW_NOT_FOUND;
      }

      const now = new Date().toISOString();

      if (draw.room.start_date > now) {
        throw ErrorCode.DRAW_NOT_STARTED;
      }

      if (draw.room.end_date < now) {
        throw ErrorCode.DRAW_ENDED;
      }

      // draw
      const itemIds = getRandomItems(draw);
      const userItems = [];

      for (const itemId of itemIds) {
        // const item = await strapi.entityService.findOne(
        //   "api::item.item",
        //   itemId
        // );
        // const { current_serial_number } = item;
        const [{ current_serial_number }] = await strapi.db
          .connection("items")
          .transacting(trx)
          .forUpdate()
          .where("id", itemId)
          .select("current_serial_number");

        const updatedItem = await strapi.entityService.update(
          "api::item.item",
          itemId,
          {
            fields: ["id", "name", "desc", "rarity", "current_serial_number"],
            populate: {
              thumbnail: {
                fields: ["url"],
              },
              localizations: {
                fields: ["name", "desc", "locale"],
              },
            },
            data: { current_serial_number: current_serial_number + 1 },
          }
        );

        items.push(updatedItem);

        // create inventory
        const userItem = await strapi.entityService.create(
          "api::inventory.inventory",
          {
            data: {
              users_permissions_user: userId,
              serial_number: current_serial_number + 1,
              item: itemId,
              publishedAt: new Date(),
            },
            fields: ["serial_number"],
            populate: {
              item: {
                fields: ["rarity"],
              },
              users_permissions_user: { fields: ["id"] },
            },
          }
        );

        await strapi
          .service("api::update-manager.update-manager")
          .updateItemAquisition(userItem);

        userItems.push(userItem.id);
      }

      const userRoom = await strapi
        .service("api::user-room.user-room")
        .getUserRoom(userId, draw.room.id);

      await strapi
        .service("api::user-room.user-room")
        .updateItems(userRoom, itemIds, []);

      const { currency_type, cost } = draw;

      const user = await strapi.entityService.findOne(
        "plugin::users-permissions.user",
        userId,
        {
          populate: {
            freebie: true,
            star_point: true,
          },
        }
      );

      // FIXME: deduct currency is not safe because of concurrent access
      if (currency_type === "freebie") {
        await deductFreebie(user, cost);
      } else if (currency_type === "star_point") {
        await deductStarPoint(user, cost, userItems);
      } else {
        // TODO: star
        throw new Error("not supported currency type");
      }

      // record draw history
      await strapi.entityService.create("api::draw-history.draw-history", {
        data: {
          draw: drawId,
          users_permissions_user: userId,
          draw_result: itemIds,
          user_items: { connect: userItems },
          publishedAt: new Date(),
        },
      });
    });

    return items;
  },
});

function getRandomItems(draw: Draw) {
  const { draw_info, draws_per_cost } = draw;

  const items = [];

  for (let i = 0; i < draws_per_cost; i++) {
    const item = drawItem(draw_info);
    items.push(item);
  }

  return items;
}

function drawItem(info: DrawInfo) {
  const random = Math.random();

  let total_probability = 0;
  for (const [_, { items, probability }] of Object.entries(info)) {
    total_probability += probability;
    if (random < total_probability) {
      const item = items[Math.floor(Math.random() * items.length)];
      return item;
    }
  }
}

async function deductStarPoint(user: User, cost: number, userItems: number[]) {
  await strapi
    .service("api::star-point.star-point")
    .updateStarPoint(user.id, -cost, "item_draw", userItems);
}

async function deductFreebie(user: User, cost: number) {
  const { freebie } = user;

  await strapi.db.transaction(async () => {
    // refresh freebie
    const { current, max } = await strapi
      .service("api::freebie.freebie")
      .refresh(freebie);

    // check quantity of freebie
    if (current > 0) {
      const after = current - cost;
      const data: FreebieData = { current: after };

      if (current === max) {
        data.last_charged_at = Math.floor(new Date().getTime() / 1000);
      }

      await strapi.service("api::freebie.freebie").update(freebie.id, { data });
    } else {
      throw ErrorCode.NOT_ENOUGH_FREEBIES;
    }
  });
}
