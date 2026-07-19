#!/bin/bash
set -e

docker compose exec superset \
  superset import-dashboards -p /app/dashboards/export-dashboards.zip -u admin
