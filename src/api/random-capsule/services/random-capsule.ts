/**
 * random-capsule service
 */

import { ErrorCode } from "../../../constant";

export default ({ strapi }) => ({
  async drawWithCoin(
    userId,
    gachaInfo,
    draw,
    multiply
  ): Promise<CapsuleResult> {
    return await strapi.db.transaction(async ({ trx }) => {
      // FIXME: delete this
      // await deductCurrency(userId, draw, multiply);

      let result: CapsuleResult;

      const random = Math.random();
      if (random < gachaInfo.probability) {
        const rewards = drawReward(gachaInfo);

        for (const reward of rewards) {
          await addRewardToUser(userId, draw.id, reward, multiply);
        }

        result = { rewards, multiply };
      } else {
        const itemId = await drawItem(draw.draw_info, multiply);
        const item = await addItemToUser(userId, draw.id, itemId, multiply);

        result = { rewards: [{ type: "item", detail: item }], multiply };
      }

      result.events = [];
      await checkRelayEvent(userId, result);

      return result;
    });
  },

  async drawWithStarPoint(userId, draw, multiply): Promise<CapsuleResult> {
    // FIXME: delete this
    // await deductCurrency(userId, draw, multiply);

    const itemId = await drawItem(draw.draw_info, multiply);
    const item: Partial<Item> = await addItemToUser(
      userId,
      draw.id,
      itemId,
      multiply
    );

    const result: CapsuleResult = {
      rewards: [{ type: "item", detail: item }],
      multiply,
    };

    result.events = [];

    await checkRelayEvent(userId, result);

    return result;
  },
});

async function deductCurrency(userId: number, draw: Draw, multiply: number) {
  const { cost, currency_type } = draw;
  if (currency_type === "star_point") {
    await strapi
      .service("api::star-point.star-point")
      .updateStarPoint(userId, -cost * multiply, "item_draw");
  } else if (currency_type === "freebie") {
    await strapi
      .service("api::freebie.freebie")
      .updateFreebie(userId, -cost * multiply);
  }
}

function drawReward(gachaInfo) {
  const random_number = Math.random();

  let total_probability = 0;
  for (const each of gachaInfo.reward_table) {
    total_probability += each.probability;
    if (random_number < total_probability) {
      return each.rewards;
    }
  }
}

/**
 *
 * TODO: localizations
 * @param info
 * @param multiply
 * @returns
 */
function drawItem(info: DrawInfo, multiply: number) {
  const random = Math.random();

  applyMultiply(info, multiply);

  let total_probability = 0;

  for (const [_, { items, probability }] of Object.entries(info)) {
    total_probability += probability;

    if (random < total_probability) {
      const item = items[Math.floor(Math.random() * items.length)];
      return item;
    }
  }
}

function applyMultiply(info: DrawInfo, multiply: number) {
  // common, uncommon 은 확률 감소
  // rare, unique, secret, variant는 확률 증가
  // rare와 unique, secret, variant 가 증가된 만큼 common, uncommon은 각각의 비율로 감소
  if (multiply === 1) {
    return info;
  }

  const lowerRarities = ["common", "uncommon"];
  const higherRarities = ["rare", "unique", "variant", "secret"];

  calcProbability(info, lowerRarities, higherRarities, multiply);

  return info;
}

function calcProbability(
  info: DrawInfo,
  lowerRarities: string[],
  higherRarities: string[],
  multiply: number
) {
  const higherTotal = higherRarities.reduce((acc, rarity) => {
    if (info[rarity]) {
      acc += info[rarity].probability;
    }
    return acc;
  }, 0);

  const higherIncreases = higherTotal * multiply;

  const lowerTotal = lowerRarities.reduce((acc, rarity) => {
    if (info[rarity]) {
      acc += info[rarity].probability;
    }
    return acc;
  }, 0);

  if (higherIncreases > 1) {
    lowerRarities.forEach((rarity) => {
      if (info[rarity]) {
        info[rarity].probability = 0;
      }
    });

    const filtered = higherRarities.filter((rarity) => info[rarity]);
    if (filtered.length == 1) {
      info[filtered[0]].probability = 1;
      return info;
    } else {
      const [low, ...high] = filtered;
      return calcProbability(info, [low], high, multiply);
    }
  }

  higherRarities.forEach((rarity) => {
    if (info[rarity]) {
      info[rarity].probability *= multiply;
    }
  });

  lowerRarities.forEach((rarity) => {
    if (info[rarity]) {
      info[rarity].probability =
        (info[rarity].probability / lowerTotal) * (1 - higherIncreases);
    }
  });

  return info;
}

async function addRewardToUser(
  userId: number,
  drawId: number,
  reward: Reward,
  multiply: number
) {
  if (reward) {
    await updateRewards(userId, reward, multiply);
  }

  await strapi.entityService.create("api::draw-history.draw-history", {
    data: {
      draw: drawId,
      users_permissions_user: userId,
      draw_result: { type: reward.type, amount: reward.amount },
      multiply,
      publishedAt: new Date(),
    },
  });
}

async function updateRewards(userId: number, reward: Reward, multiply: number) {
  switch (reward.type) {
    case "freebie":
      await strapi
        .service("api::freebie.freebie")
        .updateFreebie(userId, reward.amount * multiply);
      break;
    case "star_point":
      await strapi
        .service("api::star-point.star-point")
        .updateStarPoint(userId, reward.amount * multiply, "item_draw");
      break;
    case "wheel_spin":
      await strapi
        .service("api::wheel-spin.wheel-spin")
        .updateWheelSpin(userId, reward.amount * multiply, "gacha_result");
      break;
    case "trading_credit":
      await strapi
        .service("api::trading-credit.trading-credit")
        .updateTradingCredit(userId, reward.amount * multiply, "gacha_result");
      break;
  }
}

async function addItemToUser(
  userId: number,
  drawId: number,
  itemId: number,
  multiply: number
) {
  const userItems = [];

  return await strapi.db.transaction(async ({ trx }) => {
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
          room: {
            fields: ["id"],
          },
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

    const userRoom = await strapi
      .service("api::user-room.user-room")
      .getUserRoom(userId, updatedItem.room.id);

    await strapi
      .service("api::user-room.user-room")
      .updateItems(userRoom, [updatedItem.id], []);

    await strapi.entityService.create("api::draw-history.draw-history", {
      data: {
        draw: drawId,
        users_permissions_user: userId,
        draw_result: { item: updatedItem.id },
        user_items: { connect: userItems },
        multiply,
        publishedAt: new Date(),
      },
    });

    return updatedItem;
  });
}

async function checkRelayEvent(userId: number, result: CapsuleResult) {
  const relays = await strapi
    .service("api::relay.relay")
    .getCurrentRelays(userId);

  for (const relay of relays) {
    if (relay) {
      const tokens = await strapi
        .service("api::relay.relay")
        .verify(userId, relay, result);

      if (tokens > 0) {
        const { rewards, total } = await strapi
          .service("api::relay.relay")
          .claimRewards(userId, relay);

        // item은 relay reward로 일단 없다고 가정한다.
        for (const reward of rewards) {
          await updateRewards(userId, reward, 1);
        }

        result.events.push({
          type: "relay",
          amount: tokens,
          total,
          rewards,
          relay,
        });
      }
    }
  }
}
