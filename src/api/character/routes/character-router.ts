export default {
  routes: [
    {
      method: "GET",
      path: "/character/list",
      handler: "character.get-character-list",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/character/:characterId",
      handler: "character.get-character-detail",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
