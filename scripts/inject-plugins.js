const fs = require("fs");
const path = require("path");

const FRONTEND_DIR = path.resolve(__dirname, "../superset/superset-frontend");
const PLUGINS_DIR = path.resolve(__dirname, "../plugins");
const PACKAGE_JSON_PATH = path.join(FRONTEND_DIR, "package.json");
const MAIN_PRESET_PATH = path.join(
  FRONTEND_DIR,
  "src/visualizations/presets/MainPreset.js",
);

function getCustomPlugins() {
  return fs.readdirSync(PLUGINS_DIR).filter((name) => {
    const pkgPath = path.join(PLUGINS_DIR, name, "package.json");
    return fs.existsSync(pkgPath);
  });
}

function injectDependencies(plugins) {
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, "utf-8"));

  plugins.forEach((pluginName) => {
    const pluginPkg = JSON.parse(
      fs.readFileSync(
        path.join(PLUGINS_DIR, pluginName, "package.json"),
        "utf-8",
      ),
    );
    const depName = pluginPkg.name;
    pkg.dependencies[depName] = `file:../../plugins/${pluginName}`;
    console.log(`Injected dependency: ${depName}`);
  });

  fs.writeFileSync(PACKAGE_JSON_PATH, JSON.stringify(pkg, null, 2));
}

function injectIntoMainPreset(plugins) {
  let content = fs.readFileSync(MAIN_PRESET_PATH, "utf-8");

  const imports = plugins
    .map((pluginName) => {
      const pluginPkg = JSON.parse(
        fs.readFileSync(
          path.join(PLUGINS_DIR, pluginName, "package.json"),
          "utf-8",
        ),
      );
      return `import ${toVarName(pluginPkg.name)} from '${pluginPkg.name}';`;
    })
    .join("\n");

  const registrations = plugins
    .map((pluginName) => {
      const pluginPkg = JSON.parse(
        fs.readFileSync(
          path.join(PLUGINS_DIR, pluginName, "package.json"),
          "utf-8",
        ),
      );
      return `    new ${toVarName(pluginPkg.name)}().configure({ key: '${pluginPkg.name}' }),`;
    })
    .join("\n");

  content = content.replace(
    "import { PluginPreset } from '@superset-ui/core';",
    `import { PluginPreset } from '@superset-ui/core';\n${imports}`,
  );

  content = content.replace(/(plugins:\s*\[)/, `$1\n${registrations}`);

  fs.writeFileSync(MAIN_PRESET_PATH, content);
  console.log("MainPreset.js updated with custom plugins");
}

function toVarName(pkgName) {
  return pkgName.replace(/[^a-zA-Z0-9]/g, "_").replace(/^_/, "Plugin_");
}

function main() {
  const plugins = getCustomPlugins();
  if (plugins.length === 0) {
    console.log("No custom plugins found, skipping injection.");
    return;
  }
  console.log(`Found plugins: ${plugins.join(", ")}`);
  injectDependencies(plugins);
  injectIntoMainPreset(plugins);
}

main();
