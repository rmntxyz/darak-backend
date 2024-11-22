export default {
  routes: [
    {
      method: "GET",
      path: "/friend",
      handler: "friend.list",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/friend/with-requests",
      handler: "friend.listWithRequests",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/friend/connect",
      handler: "friend.connect",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/friend",
      handler: "friend.request",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "DELETE",
      path: "/friend/:friendId",
      handler: "friend.delete",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/friend/accept",
      handler: "friend.accept",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/friend/add",
      handler: "friend.addByLink",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
