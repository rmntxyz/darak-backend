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
  const { freebie } = user;

  await strapi.db.transaction(async () => {
    // refresh freebie
    const { current, max } = await strapi
      .service("api::freebie.freebie")
      .refresh(freebie);

    // check quantity of freebie
    if (current > 0) {
      const after = current - 1;
      const data: FreebieData = { current: after };

      if (current === max) {
        data.last_charged_at = Math.floor(new Date().getTime() / 1000);
      }

      await strapi.service("api::freebie.freebie").update(freebie.id, { data });
    } else {
      throw new Error("freebie is not enough");
    }
  });
}

export default ({ strapi }) => ({
  async drawRandom(userId: number, drawId: number) {
    let items = [];

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
      const itemIds = getRandomItems(draw);

      for (const itemId of itemIds) {
        const item = await strapi.entityService.findOne(
          "api::item.item",
          itemId
        );
        const { current_serial_number } = item;

        const updatedItem = await strapi.entityService.update(
          "api::item.item",
          itemId,
          {
            fields: ["id", "name", "desc", "rarity", "current_serial_number"],
            populate: {
              thumbnail: {
                fields: ["url"],
                populate: ["url"],
              },
            },
            data: { current_serial_number: current_serial_number + 1 },
          }
        );

        items.push(updatedItem);

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
          draw_result: itemIds,
          publishedAt: new Date(),
        },
      });
    });

    return items;
  },
});
