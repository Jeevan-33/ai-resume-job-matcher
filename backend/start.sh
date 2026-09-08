#!/bin/sh
# Container entrypoint: apply any pending migrations, then boot the API.
# `alembic upgrade head` is a no-op when the schema is already current, so
# it's safe to run on every container start (local docker-compose and
# Render deploys alike).
set -e

alembic upgrade head

# Seed the job postings on first boot only - once the table has rows this
# is a no-op, so it's safe to leave in the startup path permanently
# (avoids needing a one-off shell/job command, which isn't available on
# every plan).
python -c "
from app.db.database import SessionLocal
from app.models.job import Job
db = SessionLocal()
count = db.query(Job).count()
db.close()
exit(0 if count > 0 else 1)
" || python -m app.db.seed_jobs

exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
