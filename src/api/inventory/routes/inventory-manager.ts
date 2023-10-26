export default {
  routes: [
    {
      method: "PUT",
      path: "/inventory-manager/sell",
      handler: "inventory.sell",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "PUT",
      path: "/inventory-manager/sell/item",
      handler: "inventory.sell-by-item-id",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "PUT",
      path: "/inventory-manager/transfer",
      handler: "inventory.transfer",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    //     {
    //       method: "PUT",
    //       path: "/inventory-manager/grant/:itemId/to/:userId",
    //       handler: "room.grant-item",
    //       config: {
    //         policies: [],
    //         middlewares: [],
    //       },
    //     },
  ],
};
