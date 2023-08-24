/**
 * random-item service
 */
type Freebie = {
  id: number;
  current: number;
  max: number;
  last_charged_at: number;
  charge_interval: number;
};

type User = {
  id: number;
  freebie: Freebie;
};

type Draw = {
  cost: number;
  currency_type: string;
  draws_per_cost: number;
  draw_info: DrawInfo;
  room?: any;
};

type RarityData = {
  items: number[];
  probability: number;
};

type DrawInfo = {
  common: RarityData;
  uncommon: RarityData;
  rare: RarityData;
  super_rare: RarityData;
  unique: RarityData;
};

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
  for (const [rarity, { items, probability }] of Object.entries(info)) {
    total_probability += probability;
    if (random < total_probability) {
      const item = items[Math.floor(Math.random() * items.length)];
      return item;
    }
  }
}

async function deductFreebie(user: User, draw: Draw) {
  const freebieId = user.freebie.id;

  await strapi.db.transaction(async () => {
    // refresh freebie
    const freebie = await strapi
      .service("api::freebie.freebie")
      .refresh(freebieId);

    // check quantity of freebie
    if (freebie.current > 0) {
      const date = new Date();

      // freebie 1개 차감하고 update
      const current = freebie.current - 1;
      await strapi.service("api::freebie.freebie").update(freebieId, {
        data: { current, last_charged_at: Math.floor(date.getTime() / 1000) },
      });
    } else {
      throw new Error("freebie is not enough");
    }
  });
}

export default ({ strapi }) => ({
  async drawRandom(userId: number, drawId: number) {
    const draw = await strapi.entityService.findOne("api::draw.draw", drawId);

    const { currency_type } = draw;

    const user = await strapi.entityService.findOne(
      "plugin::users-permissions.user",
      userId,
      {
        populate: ["freebie" /*, "star"*/],
      }
    );

    if (currency_type === "freebie") {
      try {
        await deductFreebie(user, draw);
      } catch (err) {
        throw err;
      }
    } else {
      // TODO: star
      throw new Error("not supported currency type");
    }

    // draw
    const draw_result = getRandomItems(draw);

    // record draw history
    const draw_history = await strapi.entityService.create(
      "api::draw-history.draw-history",
      {
        data: {
          draw: drawId,
          users_permissions_user: userId,
          draw_result,
          publishedAt: new Date(),
        },
      }
    );

    return draw_history;
  },
});
