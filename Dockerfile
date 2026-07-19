FROM node:20-bullseye AS frontend-builder

WORKDIR /app

COPY superset/docker/ /app/docker/
RUN /app/docker/apt-install.sh build-essential python3 zstd

COPY superset/superset-frontend/ ./superset-frontend/
COPY superset/superset/ ./superset/
COPY plugins/ ./plugins/

COPY overrides/custom-plugins.json ./overrides/custom-plugins.json
COPY overrides/plugin-dependencies.json ./overrides/plugin-dependencies.json
COPY scripts/patch-main-preset.js ./scripts/patch-main-preset.js
COPY scripts/add-plugin-deps.js ./scripts/add-plugin-deps.js

RUN cd /app/plugins/datePickerCustom && npm install --legacy-peer-deps && npm run build
RUN node scripts/add-plugin-deps.js
RUN node scripts/patch-main-preset.js

WORKDIR /app/superset-frontend
RUN npm install
RUN npm run build


FROM apache/superset:6.1.0

USER root

COPY --from=frontend-builder /app/superset/static/assets \
     /app/superset/static/assets

COPY docker/superset_config.py /app/pythonpath/superset_config.py

RUN pip install --no-cache-dir --upgrade uv
RUN uv pip install --python /app/.venv/bin/python psycopg2-binary

ENV SUPERSET_CONFIG_PATH=/app/pythonpath/superset_config.py

USER superset

EXPOSE 8088