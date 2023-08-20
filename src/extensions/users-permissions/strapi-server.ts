import bootstrap from "./server/bootstrap";
import providersRegistry from "./server/services/providers-registry";
import providers from "./server/services/providers";

module.exports = (plugin) => {
  // for kakao login
  plugin.bootstrap = bootstrap;
  plugin.services["providers-registry"] = providersRegistry;
  plugin.services["providers"] = providers;

  // const connect = plugin.services.provider.connect;
  // plugin.services.provider.connect = async (ctx) => {
  //   await connect(ctx);
  //   console.log("connect");
  // };

  // const registerUser = plugin.controllers.auth.register;
  // plugin.controllers.auth.register = async (ctx) => {
  //   await registerUser(ctx);
  //   console.log("user registered");
  // };

  // const userCreate = plugin.controllers.user.create;
  // plugin.controllers.user.create = async (ctx) => {
  //   await userCreate(ctx);
  //   console.log("user created");
  // };

  // const userCreateService = plugin.services.user.create;
  // plugin.services.user.create = async (ctx) => {
  //   await userCreateService(ctx);
  //   console.log("user created with service");
  // };

  return plugin;
};
