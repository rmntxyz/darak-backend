export default {
  routes: [
    {
      method: "GET",
      path: "/trade-process/owners/:itemId",
      handler: "trade-process.get-item-owners",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/trade-process/non-owners/:itemId",
      handler: "trade-process.get-non-item-owners",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/trade-process/detail/:roomId/:partnerId",
      handler: "trade-process.get-trade-detail",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/trade-process/proposal",
      handler: "trade-process.propose-trade",
      config: {
        policies: [],
        middlewares: ["global::mutex-by-user"],
      },
    },
    {
      method: "PUT",
      path: "/trade-process/counter-proposal/:tradeId",
      handler: "trade-process.counter-propose-trade",
      config: {
        policies: [],
        middlewares: ["global::mutex-by-user"],
      },
    },
    {
      method: "PUT",
      path: "/trade-process/accept/:tradeId",
      handler: "trade-process.accept-trade",
      config: {
        policies: [],
        middlewares: ["global::mutex-by-user"],
      },
    },
    {
      method: "PUT",
      path: "/trade-process/status/:tradeId?",
      handler: "trade-process.read-trade-status",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/trade-process/trades",
      handler: "trade-process.get-trade-list",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/trade-process/trades/:tradeId",
      handler: "trade-process.get-trade",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "PUT",
      path: "/trade-process/cancel/:tradeId",
      handler: "trade-process.cancel-trade",
      config: {
        policies: [],
        middlewares: ["global::mutex-by-user"],
      },
    },
  ],
};
