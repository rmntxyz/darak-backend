/**
 * random-capsule service
 */

import { EXP_MULT_FOR_DUPLICATE, EXP_BY_RARITY } from "../../../constant";

export default ({ strapi }) => ({
  async drawWithCoin(
    userId,
    gachaInfos,
    draw,
    multiply
  ): Promise<CapsuleResult> {
    return await strapi.db.transaction(async ({ trx }) => {
      const activEffects: UserStatusEffect[] = await strapi
        .service("api::user-status-effect.user-status-effect")
        .getActiveEffects(userId);

      await deductCurrency(userId, draw, multiply, activEffects);

      let result: CapsuleResult = null;

      const random = Math.random();
      let probability = 0;

      for (const gachaInfo of gachaInfos) {
        probability += gachaInfo.probability;

        if (random < probability) {
          const rewards = drawReward(gachaInfo);
          let historyId;

          for (const reward of rewards) {
            const [details, change] = applyStatusEffect(
              ["star_reduction"],
              activEffects,
              reward
            );
            if (details.length > 0 && change !== 0) {
              reward.amount += change;
            }

            // for converting shield to coin
            reviseReward(userId, reward, multiply);

            historyId = await addRewardToUser(
              userId,
              draw.id,
              reward,
              multiply,
              details
            );
          }

          result = { rewards, multiply, historyId };

          break;
        }
      }

      if (random >= probability && !result) {
        const itemId = await drawItem(draw.draw_info, multiply);
        const { item, exp, historyId } = await addItemToUser(
          userId,
          draw.id,
          itemId,
          multiply,
          activEffects
        );

        result = {
          rewards: [{ type: "item", detail: item, exp }],
          multiply,
          historyId,
        };
      }

      result.events = [];
      await checkRelayEvent(userId, result);

      return result;
    });
  },

  async drawWithStarPoint(userId, draw, multiply): Promise<CapsuleResult> {
    return await strapi.db.transaction(async ({ trx }) => {
      const activEffects: UserStatusEffect[] = await strapi
        .service("api::user-status-effect.user-status-effect")
        .getActiveEffects(userId);

      await deductCurrency(userId, draw, multiply, activEffects);

      const itemId = await drawItem(draw.draw_info, multiply);
      const { item, exp, historyId } = await addItemToUser(
        userId,
        draw.id,
        itemId,
        multiply,
        activEffects
      );

      const result: CapsuleResult = {
        rewards: [{ type: "item", detail: item, exp }],
        multiply,
        historyId,
      };

      result.events = [];
      await checkRelayEvent(userId, result);

      return result;
    });
  },
});

async function deductCurrency(
  userId: number,
  draw: Draw,
  multiply: number,
  activEffects: UserStatusEffect[]
) {
  let { cost, currency_type } = draw;
  if (currency_type === "star_point") {
    const [details, change] = applyStatusEffect(
      ["star_cost_up"],
      activEffects,
      cost
    );
    if (details.length > 0 && change !== 0) {
      cost += change;
    }

    await strapi
      .service("api::star-point.star-point")
      .updateStarPoint(userId, -cost * multiply, "gacha");
  } else if (currency_type === "freebie") {
    const [details, change] = applyStatusEffect(
      ["coin_penalty"],
      activEffects,
      cost
    );

    let penalty = 0;
    if (details.length > 0 && change !== 0) {
      penalty += change;
    }

    await strapi
      .service("api::freebie.freebie")
      .updateFreebie(userId, -(cost * multiply + penalty));
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

async function reviseReward(userId: number, reward: Reward, multiply: number) {
  if (reward.type === "shield") {
    const convertedCoin = await strapi
      .service("api::shield.shield")
      .calcConvertedCoinAmount(userId, reward.amount * multiply);

    reward.to_coin = convertedCoin;
  }

  return reward;
}

async function addRewardToUser(
  userId: number,
  drawId: number,
  reward: Reward,
  multiply: number,
  effectDetails: StatusEffectDetail[] = null
) {
  if (reward) {
    await strapi
      .service("api::reward.reward")
      .claim(userId, [reward], "gacha_result", multiply);

    // for converting shield to coin
    if (reward.to_coin) {
      await strapi
        .service("api::reward.reward")
        .claim(
          userId,
          [{ type: "freebie", amount: reward.to_coin }],
          "gacha_result",
          1
        );
    }
  }

  const history = await strapi.entityService.create(
    "api::draw-history.draw-history",
    {
      fields: ["id"],
      data: {
        draw: drawId,
        users_permissions_user: userId,
        draw_result: { ...reward },
        multiply,
        effect_details: effectDetails,
        publishedAt: new Date(),
      },
    }
  );

  return history.id;
}

async function addItemToUser(
  userId: number,
  drawId: number,
  itemId: number,
  multiply: number,
  activEffects: UserStatusEffect[] = []
): Promise<{ item: Partial<Item>; exp: number; historyId: number }> {
  return (await strapi.db.transaction(async ({ trx }) => {
    const userItems = [];

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

    const isNew = !userRoom.owned_items[itemId];

    let exp = EXP_BY_RARITY[updatedItem.rarity];
    let expForDisplay = exp;

    if (!isNew) {
      exp *= EXP_MULT_FOR_DUPLICATE * multiply;
      expForDisplay *= EXP_MULT_FOR_DUPLICATE;
    }

    const [details, change] = applyStatusEffect(
      ["exp_reduction"],
      activEffects,
      exp
    );
    if (details.length > 0 && change !== 0) {
      exp += change;
    }

    await strapi
      .service("api::user-room.user-room")
      .updateItems(userRoom, [updatedItem.id], []);

    await strapi.service("api::status.status").updateExp(userId, exp);

    await strapi.entityService.create(
      "api::item-acquisition-history.item-acquisition-history",
      {
        data: {
          type: "gacha_result",
          draw: drawId,
          user: userId,
          items: { connect: [updatedItem.id] },
          inventories: { connect: [userItem.id] },
          multiply,
          exp: expForDisplay,
          effect_details: details,
          publishedAt: new Date(),
        },
      }
    );

    const history = await strapi.entityService.create(
      "api::draw-history.draw-history",
      {
        fields: ["id"],
        data: {
          draw: drawId,
          users_permissions_user: userId,
          draw_result: { type: "item", item_id: updatedItem.id },
          user_items: { connect: userItems },
          multiply,
          publishedAt: new Date(),
        },
      }
    );

    return { item: updatedItem, exp: expForDisplay, historyId: history.id };
  })) as { item: Partial<Item>; exp: number; historyId: number };
}

async function checkRelayEvent(userId: number, result: CapsuleResult) {
  const relays = await strapi
    .service("api::relay.relay")
    .getCurrentRelays(userId);

  const relay = relays.find((relay) => relay.type === "relay_only");

  if (relay) {
    const tokens = await strapi
      .service("api::relay.relay")
      .verify(userId, relay, result);

    if (tokens > 0) {
      const { rewards, total } = await strapi
        .service("api::relay.relay")
        .claimRewards(userId, relay);

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

function applyStatusEffect(
  effectTypes: EffectType[],
  activEffects: UserStatusEffect[],
  value: any
) {
  const details = strapi
    .service("api::status-effect.status-effect")
    .getEffectDetails(effectTypes, activEffects);

  let change = 0;

  if (details.length > 0) {
    for (const detail of details) {
      change += strapi
        .service("api::status-effect.status-effect")
        .apply(detail, value);
    }
  }

  return [details, change];
}
