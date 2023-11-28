export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    //// create achievement progresses for all users
    //const users = await strapi.entityService.findMany(
    //  "plugin::users-permissions.user",
    //  {
    //    fields: ["id"],
    //  }
    //);
    //const userIds = users.map((user) => user.id);
    //await strapi
    //  .service("api::achievement-progress.achievement-progress")
    //  .createAchievementProgress(userIds);
    //console.log("[achievement-progress] completed");
  },
};
