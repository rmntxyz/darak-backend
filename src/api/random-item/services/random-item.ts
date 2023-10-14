/**
 * random-item service
 */

export default ({ strapi }) => ({
  async drawRandom(userId: number, drawId: number) {
    let items = [];

    await strapi.db.transaction(async () => {
      const draw = await strapi.entityService.findOne(
        "api::draw.draw",
        drawId,
        {
          populate: {
            room: {
              fields: ["id"],
            },
          },
        }
      );

      const userRoom = await getUserRoom(userId, draw);

      const { currency_type } = draw;

      const user = await strapi.entityService.findOne(
        "plugin::users-permissions.user",
        userId,
        {
          populate: {
            freebie: true,
            // star: true,
            rooms: {
              fields: ["id"],
            },
          },
        }
      );

      // if user don't have room, assign room to user
      if (!user.rooms?.find((room) => room.id === draw.room.id)) {
        // assign room to user
        const temp = await strapi.entityService.update(
          "plugin::users-permissions.user",
          userId,
          {
            data: {
              rooms: {
                connect: [draw.room.id],
              },
            },
          }
        );
      }

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

      await strapi
        .service("api::user-room.user-room")
        .updateItems(userRoom, itemIds, []);

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

async function getUserRoom(userId: number, draw: Draw) {
  let userRoom = (
    await strapi.entityService.findMany("api::user-room.user-room", {
      filters: {
        user: { id: userId },
        room: { id: draw.room.id },
      },
    })
  )[0];

  if (!userRoom) {
    const now = new Date();
    const { draw_info, room } = draw;
    const rarity = {};
    let total_count = 0;
    for (let key in draw_info) {
      rarity[key] = draw_info[key].items;
      total_count += draw_info[key].items.length;
    }

    userRoom = await strapi.entityService.create("api::user-room.user-room", {
      data: {
        start_time: now,
        completion_time: null,
        room: { id: room.id },
        user: { id: userId },
        completed: false,
        completion_rate: 0,
        duration: null,
        item_details: {
          rarity,
          total: total_count,
        },
        owned_items: {},
        publishedAt: now,
      },
    });
  }

  return userRoom;
}
