#!/bin/sh
# Container entrypoint: apply any pending migrations, then boot the API.
# `alembic upgrade head` is a no-op when the schema is already current, so
# it's safe to run on every container start (local docker-compose and
# Render deploys alike).
set -e

alembic upgrade head

exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
