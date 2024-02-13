// using message template
import format from "string-template";

export default {
  "send-all": async (ctx) => {
    try {
      let { title, body } = ctx.request.body;

      // temp
      if (!title) {
        title = "Hi! {username}.";
      }
      if (!body) {
        body =
          "This is a test notification.\nYour ID is {id} and Your e-mail is {email}.";
      }

      // get users
      const users = await strapi.entityService.findMany(
        "plugin::users-permissions.user",
        {
          fields: ["device_token", "username", "id", "email"],
        }
      );

      const filteredUsers = users.filter((user) => user.device_token);

      if (filteredUsers.length === 0) {
        return ctx.badRequest("No user has device token");
      }

      const messagesSplit = [];
      const splitSize = 500;
      for (let i = 0; i < filteredUsers.length; i += splitSize) {
        messagesSplit.push(
          filteredUsers.slice(i, i + splitSize).map((user) => ({
            notification: {
              title: format(title, user),
              body: format(body, user),
            },
            token: user.device_token,
          }))
        );
      }

      const { notification } = strapi as unknown as ExtendedStrapi;
      const responses = [];

      for (const messages of messagesSplit) {
        const res = await notification.sendEachNotification(messages);
        responses.push(res);
      }
      return responses;
    } catch (err) {
      return ctx.internalServerError("send failed", err);
    }
  },
};
