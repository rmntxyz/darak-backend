export default {
  routes: [
    {
      method: "GET",
      path: "/leaderboard/room-completion-rankings/monthly",
      handler: "leaderboard.get-monthly-room-completion-rankings",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/leaderboard/room-completion-rankings/:roomId?",
      handler: "leaderboard.get-room-completion-rankings",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/leaderboard/exp-rankings/:size?",
      handler: "leaderboard.get-exp-rankings",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    // {
    //   method: "GET",
    //   path: "/leaderboard/exp-rankings/monthly",
    //   handler: "leaderboard.get-monthly-exp-rankings",
    //   config: {
    //     policies: [],
    //     middlewares: [],
    //   },
    // },
  ],
};
