const fs = require("fs");
const path = require("path");

const mainPresetPath = path.resolve(
  __dirname,
  "../superset-frontend/src/visualizations/presets/MainPreset.ts",
);
const configPath = path.resolve(__dirname, "../overrides/custom-plugins.json");

const plugins = JSON.parse(fs.readFileSync(configPath, "utf-8"));
let content = fs.readFileSync(mainPresetPath, "utf-8");

const imports = plugins
  .map((p) => `import ${p.importName} from '${p.packageName}';`)
  .join("\n");

const registrations = plugins
  .map((p) => `    new ${p.importName}().configure({ key: '${p.key}' }),`)
  .join("\n");

const lines = content.split("\n");
const lastImportIndex = lines.reduce(
  (acc, line, idx) => (line.trim().startsWith("import ") ? idx : acc),
  -1,
);

if (lastImportIndex === -1) {
  throw new Error("No import statements found in MainPreset.ts");
}

lines.splice(lastImportIndex + 1, 0, imports);
content = lines.join("\n");

content = content.replace(/(plugins:\s*\[)/, `$1\n${registrations}`);

fs.writeFileSync(mainPresetPath, content);
console.log(`Patched MainPreset.ts with ${plugins.length} custom plugin(s):`);
plugins.forEach((p) => console.log(`  - ${p.importName} (${p.packageName})`));
