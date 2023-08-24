import bootstrap from "./server/bootstrap";
import providersRegistry from "./server/services/providers-registry";
import providers from "./server/services/providers";

module.exports = (plugin) => {
  // for kakao login
  plugin.bootstrap = bootstrap;
  plugin.services["providers-registry"] = providersRegistry;
  plugin.services["providers"] = providers;

  return plugin;
};
