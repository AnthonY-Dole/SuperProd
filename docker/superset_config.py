import os

SECRET_KEY = os.environ.get("SUPERSET_SECRET_KEY", "change_me_in_prod")

SQLALCHEMY_DATABASE_URI = (
    f"postgresql+psycopg2://"
    f"{os.environ.get('DB_USER', 'superset')}:"
    f"{os.environ.get('DB_PASSWORD', 'superset')}@"
    f"{os.environ.get('DB_HOST', 'db')}:"
    f"{os.environ.get('DB_PORT', '5432')}/"
    f"{os.environ.get('DB_NAME', 'superset')}"
)

CACHE_CONFIG = {
    "CACHE_TYPE": "RedisCache",
    "CACHE_DEFAULT_TIMEOUT": 300,
    "CACHE_KEY_PREFIX": "superset_",
    "CACHE_REDIS_HOST": os.environ.get("REDIS_HOST", "redis"),
    "CACHE_REDIS_PORT": os.environ.get("REDIS_PORT", 6379),
    "CACHE_REDIS_DB": 1,
}

DATA_CACHE_CONFIG = CACHE_CONFIG

FEATURE_FLAGS = {
    "ENABLE_TEMPLATE_PROCESSING": True,
    "DASHBOARD_NATIVE_FILTERS": True,
    "DASHBOARD_CROSS_FILTERS": True,
}

WEBDRIVER_BASEURL = "http://superset:8088/"
SQLLAB_CTAS_NO_LIMIT = True

ROW_LIMIT = 5000
SUPERSET_WEBSERVER_TIMEOUT = 300