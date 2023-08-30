import cronTasks from "./cron-tasks";

export default ({ env }) => ({
  proxy: true,
  url: env("MY_HEROKU_URL"),
  app: {
    keys: env.array("APP_KEYS"),
  },
  // enable cron
  cron: {
    enabled: false,
    tasks: cronTasks,
  },
  // webhooks: {
  //   populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  // },
});
