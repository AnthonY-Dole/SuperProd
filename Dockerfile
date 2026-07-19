
FROM node:18-bullseye AS frontend-builder

WORKDIR /app

COPY superset/superset-frontend/ ./superset-frontend/
COPY plugins/ ./plugins/
COPY scripts/inject-plugins.js ./scripts/inject-plugins.js

RUN node scripts/inject-plugins.js

WORKDIR /app/superset-frontend
RUN npm ci
RUN npm run build


FROM apache/superset:6.1.0

USER root

COPY --from=frontend-builder /app/superset-frontend/dist \
     /app/superset/static/assets

COPY docker/superset_config.py /app/pythonpath/superset_config.py

RUN pip install --no-cache-dir psycopg2-binary redis

ENV SUPERSET_CONFIG_PATH=/app/pythonpath/superset_config.py

USER superset

EXPOSE 8088