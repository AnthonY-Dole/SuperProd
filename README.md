# SuperProd — Apache Superset Custom Build

The goal of this project is to provide a customizable Apache Superset environment allowing custom visualization plugins, preconfigured dashboards, or other extensions to be added easily without ever having to fork the official Superset project.

Instead of maintaining a full fork (which would require manually managing merges with upstream updates and risking hard-to-resolve conflicts), Superset is integrated as a git submodule, always kept untouched. All customizations (custom plugins, npm dependencies, registration in the main preset) are applied declaratively through configuration files under overrides/, and injected automatically during the Dockerfile build step, on a copy of the submodule's code inside the container.

This approach makes it possible to:

Update Superset easily (git submodule update) without losing customizations

Add a new plugin or dashboard just by adding files/config, without touching Superset's source code

Keep a reproducible, versioned Docker image, without depending on an external fork that needs manual syncing

## Prerequisites

- Docker + Docker Compose
- Git (with submodules initialized)
- Node.js 20+ locally (optional, useful for testing a plugin before the Docker build)

## Project setup (first time)

```bash
git clone <repo-url> SuperProd
cd SuperProd
git submodule update --init --recursive
```

## Adding a new custom plugin

1. Create the plugin folder under `plugins/my-plugin/` with a `package.json`, `tsconfig.json`, and `src/index.ts` exporting a `ChartPlugin` class.
2. Add the dependency in `overrides/plugin-dependencies.json`:
   ```json
   {
     "@monorg/my-plugin": "file:../plugins/my-plugin"
   }
   ```
3. Declare the plugin in `overrides/custom-plugins.json`:
   ```json
   [
     {
       "importName": "MyPlugin",
       "packageName": "@monorg/my-plugin",
       "key": "@monorg/my-plugin"
     }
   ]
   ```
4. Rebuild the image (see below).

No manual modification of the `superset/` submodule is ever required.

## Build and run commands

### Full build (no cache, recommended after any plugin change)

```bash
docker compose build --no-cache --progress=plain
```

### Database and admin initialization (first time, or after DB reset)

```bash
docker compose --profile init run --rm superset-init
```

### Start services

```bash
docker compose up -d
```

### View logs

```bash
docker compose logs -f superset
```

### Stop services

```bash
docker compose down
```

### Full reset (images + volumes + Docker cache)

```bash
docker compose down -v
docker system prune -af
docker compose build --no-cache --pull --progress=plain
docker compose --profile init run --rm superset-init
docker compose up -d
```

## Accessing the application

Once the services are running, Superset is available at:
http://localhost:8088

## Technical notes

- The `superset/` submodule is always kept untouched: no direct modifications are made to it. All patches (npm dependencies, plugin registration) are applied via the `scripts/add-plugin-deps.js` and `scripts/patch-main-preset.js` scripts on a copy of the code inside the `frontend-builder` container, on every build.
- The `psycopg2-binary` driver is installed via `uv pip install --python /app/.venv/bin/python`, because the official `apache/superset:6.1.0` image uses a `uv`-managed virtual environment without a native `pip` inside the venv.
- Built frontend assets are copied from the `frontend-builder` stage (`/app/superset/static/assets`) into the final Superset image.
