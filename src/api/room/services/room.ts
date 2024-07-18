/**
 * room service
 */

import { factories } from "@strapi/strapi";

const roomsDefaultOptions = {
  fields: ["name", "desc", "rid", "start_date", "end_date"],
  populate: {
    image_complete: {
      fields: ["url", "width", "height"],
    },
    image_empty: {
      fields: ["url", "width", "height"],
    },
    draws: {
      fields: ["currency_type", "cost", "draws_per_cost", "draw_info"],
    },
    characters: {
      fields: ["name", "desc"],
      populate: {
        image: {
          fields: ["url"],
        },
        localizations: {
          fields: ["name", "desc", "locale"],
        },
      },
    },
    items: {
      fields: [
        "name",
        "desc",
        "rarity",
        "category",
        "attribute",
        "current_serial_number",
      ],
      populate: {
        image: {
          fields: ["url"],
        },
        thumbnail: {
          fields: ["url"],
        },
        additional_images: {
          fields: ["url"],
        },
        localizations: {
          fields: ["name", "desc", "locale"],
        },
      },
    },
    creator: {
      fields: ["name", "desc", "cid"],
      populate: {
        profile_image: {
          fields: ["url"],
        },
        localizations: {
          fields: ["name", "desc", "locale"],
        },
      },
    },
    webtoon: {
      fields: ["title", "desc", "volume", "webtoon_id", "release_date"],
      populate: {
        episodes: {
          fields: ["title", "episode_number", "episode_id"],
          populate: {
            thumbnail: {
              fields: ["url"],
            },
            images: {
              fields: ["url"],
            },
            localizations: {
              fields: ["title", "locale"],
            },
          },
        },
        webtoon_outlinks: {
          fields: ["platform", "url"],
        },
        cover_image: {
          fields: ["url"],
        },
        localizations: {
          fields: ["title", "desc", "locale"],
        },
      },
    },
    localizations: {
      fields: ["name", "desc", "locale"],
    },
  },
};

export default factories.createCoreService("api::room.room", ({ strapi }) => ({
  async findRooomByRoomName(roomName: string) {
    return await strapi.entityService.findMany("api::room.room", {
      ...roomsDefaultOptions,
      filters: {
        rid: roomName,
        publishedAt: { $ne: null },
      },
    });
  },

  async findAll() {
    return await strapi.entityService.findMany("api::room.room", {
      ...roomsDefaultOptions,
      filters: {
        publishedAt: { $ne: null },
      },
    });
  },

  async findLockedRooms(userId: number) {
    const unlockedUserRoom = await strapi.entityService.findMany(
      "api::user-room.user-room",
      {
        filters: {
          user: { id: userId },
          unlocked: true,
        },
        populate: {
          room: {
            fields: ["id"],
          },
        },
      }
    );

    const unlockedRoomIds = unlockedUserRoom.map(
      (userRoom) => userRoom.room.id
    );

    const allRooms = await strapi.entityService.findMany("api::room.room", {
      filters: {
        publishedAt: { $ne: null },
      },
      fields: ["id", "name", "rid", "unlock_conditions"],
      populate: {
        image_empty: {
          fields: ["url"],
        },
      },
      localizations: {
        fields: ["name", "desc", "locale"],
      },
    });

    const roomMap = allRooms.reduce((acc, room) => {
      acc[room.id] = room;
      return acc;
    }, {});

    const lockedRooms = allRooms.filter(
      (room) => room.unlock_conditions && !unlockedRoomIds.includes(room.id)
    );

    for (const room of lockedRooms) {
      const cond = room.unlock_conditions;

      if (cond.room_completion) {
        cond.room_completion = cond.room_completion.map(
          (roomId) => roomMap[roomId]
        );
      }
    }

    return lockedRooms;
  },

  async findUserRooms(userId: number) {
    return await strapi.entityService.findMany("api::room.room", {
      ...roomsDefaultOptions,
      filters: {
        users: { id: userId },
        publishedAt: { $ne: null },
      },
    });
  },

  async findUserRoomsCount() {
    const rooms = await strapi.entityService.findMany("api::room.room", {
      filters: {
        publishedAt: { $ne: null },
      },
      fields: ["name", "desc", "rid", "start_date", "end_date"],
      populate: {
        image_complete: {
          fields: ["url", "width", "height"],
        },
        image_empty: {
          fields: ["url", "width", "height"],
        },
        key_scenes: {
          fields: ["url", "width", "height"],
        },
        items: {
          fields: [
            "name",
            "desc",
            "rarity",
            "category",
            "attribute",
            "current_serial_number",
          ],
          localizations: {
            fields: ["name", "desc", "locale"],
          },
        },
        creator: {
          fields: ["name", "desc", "cid"],
          populate: {
            profile_image: {
              fields: ["url"],
            },
            localizations: {
              fields: ["name", "desc", "locale"],
            },
          },
        },
        user_rooms: {
          fields: ["id"],
        },
        localizations: {
          fields: ["name", "desc", "locale"],
        },
      },
    });

    rooms.forEach((room) => {
      room.user_rooms_count = room.user_rooms.length;
      delete room.user_rooms;
    });

    rooms.sort((a, b) => {
      return b.user_rooms_count - a.user_rooms_count;
    });

    return rooms;
  },
}));
