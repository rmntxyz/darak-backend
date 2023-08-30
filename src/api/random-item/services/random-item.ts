/**
 * random-item service
 */

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

async function deductFreebie(user: User) {
  const freebieId = user.freebie.id;

  await strapi.db.transaction(async () => {
    // refresh freebie
    const freebie = await strapi
      .service("api::freebie.freebie")
      .refresh(freebieId);

    const { current, max } = freebie;

    // check quantity of freebie
    if (current > 0) {
      const after = current - 1;
      const data: FreebieData = { current: after };

      if (current === max) {
        data.last_charged_at = Math.floor(new Date().getTime() / 1000);
      }

      await strapi.service("api::freebie.freebie").update(freebieId, { data });
    } else {
      throw new Error("freebie is not enough");
    }
  });
}

export default ({ strapi }) => ({
  async drawRandom(userId: number, drawId: number) {
    let drawResult = null;

    await strapi.db.transaction(async () => {
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
          await deductFreebie(user);
        } catch (err) {
          throw err;
        }
      } else {
        // TODO: star
        throw new Error("not supported currency type");
      }

      // draw
      drawResult = getRandomItems(draw);

      for (const itemId of drawResult) {
        const item = await strapi.entityService.findOne(
          "api::item.item",
          itemId
        );
        const { current_serial_number } = item;

        await strapi.entityService.update("api::item.item", itemId, {
          data: { current_serial_number: current_serial_number + 1 },
        });

        // create inventory
        await strapi.entityService.create("api::inventory.inventory", {
          data: {
            users_permissions_user: userId,
            serial_number: current_serial_number + 1,
            item: itemId,
            publishedAt: new Date(),
          },
        });
      }

      // record draw history
      await strapi.entityService.create("api::draw-history.draw-history", {
        data: {
          draw: drawId,
          users_permissions_user: userId,
          draw_result: drawResult,
          publishedAt: new Date(),
        },
      });
    });

    return drawResult;
  },
});
