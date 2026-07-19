const fs = require("fs");
const path = require("path");

const pkgPath = path.resolve(__dirname, "../superset-frontend/package.json");
const extraPath = path.resolve(
  __dirname,
  "../overrides/plugin-dependencies.json",
);

const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
const extraDeps = JSON.parse(fs.readFileSync(extraPath, "utf-8"));

Object.entries(extraDeps).forEach(([name, version]) => {
  pkg.dependencies[name] = version;
  console.log(`Added dependency: ${name} -> ${version}`);
});

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
console.log("package.json patched successfully.");
