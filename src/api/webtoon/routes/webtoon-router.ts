export default {
  routes: [
    {
      method: "GET",
      path: "/webtoon/list",
      handler: "webtoon.get-webtoon-list",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/webtoon/:webtoonId",
      handler: "webtoon.get-webtoon-detail",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
