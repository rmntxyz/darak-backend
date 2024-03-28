/**
 * random-capsule service
 */

import { ErrorCode } from "../../../constant";

export default ({ strapi }) => ({
  async drawWithCoin(userId, gachaInfo, draw, multiply) {
    return await strapi.db.transaction(async ({ trx }) => {
      deductCurrency(userId, draw, multiply);

      const random = Math.random();
      if (random < gachaInfo.probability) {
        const reward = drawReward(gachaInfo, multiply);
        await addReward(userId, draw.id, reward, multiply);
        return { [reward.type]: reward.amount };
      } else {
        const itemId = await drawItem(draw.draw_info, multiply);
        const item = await addItem(userId, draw.id, itemId, multiply);
        return { item };
      }
    });
  },

  async drawWithStarPoint(userId, draw, multiply) {
    deductCurrency(userId, draw, multiply);

    const itemId = await drawItem(draw.draw_info, multiply);
    const item = await addItem(userId, draw.id, itemId, multiply);
    return { item };
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

function drawReward(gachaInfo, multiply) {
  const random_number = Math.random();

  let total_probability = 0;
  for (const each of gachaInfo.rewards) {
    total_probability += each.probability;
    if (random_number < total_probability) {
      each.reward.amount *= multiply;
      return each.reward;
    }
  }
}

function drawItem(info: DrawInfo, multiply: number) {
  const random = Math.random();

  // TODO: Apply probability table according to multiplier
  let total_probability = 0;
  for (const [_, { items, probability }] of Object.entries(info)) {
    total_probability += probability;
    if (random < total_probability) {
      const item = items[Math.floor(Math.random() * items.length)];
      return item;
    }
  }
}

async function addReward(
  userId: number,
  drawId: number,
  reward: Reward,
  multiply: number
) {
  switch (reward.type) {
    case "star_point":
      await strapi
        .service("api::star-point.star-point")
        .updateStarPoint(userId, reward.amount, "item_draw");
      break;
    case "freebie":
      await strapi
        .service("api::freebie.freebie")
        .updateFreebie(userId, reward.amount);
      break;
    case "trading_credit":
      // TODO: implement trading credit
      break;
    case "wheel_spin":
      // TODO: implement wheel spin
      break;
  }

  await strapi.entityService.create("api::draw-history.draw-history", {
    data: {
      draw: drawId,
      users_permissions_user: userId,
      draw_result: { [reward.type]: reward.amount },
      multiply,
      publishedAt: new Date(),
    },
  });
}

async function addItem(
  userId: number,
  drawId: number,
  itemId: number,
  multiply: number
) {
  const userItems = [];

  await strapi.db.transaction(async ({ trx }) => {
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
