/**
 * character controller
 */

import { factories } from "@strapi/strapi";
import { applyLocalizations } from "../../../utils";

export default factories.createCoreController(
  "api::character.character",
  ({ strapi }) => ({
    "get-character-list": async (ctx) => {
      const characters = await strapi
        .service("api::character.character")
        .getCharacterList();

      for (const character of characters) {
        const { locale } = ctx.query;
        applyLocalizations(character, locale);
      }

      return characters;
    },
    "get-character-detail": async (ctx) => {
      const { creatorId } = ctx.params;

      if (!creatorId) {
        return ctx.badRequest("Creator id is required");
      }

      const character = await strapi
        .service("api::character.character")
        .getCharacterDetail(creatorId);

      if (!character) {
        return ctx.notFound("Character not found");
      }

      const { locale } = ctx.query;

      applyLocalizations(character, locale);

      character.items.forEach((item) => {
        applyLocalizations(item, locale);

        applyLocalizations(item.room, locale);
      });

      return character;
    },
  })
);
