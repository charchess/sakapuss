#!/bin/sh
set -e

echo "Running database migrations..."
cd /app && python -m alembic -c backend/alembic.ini upgrade head

echo "Starting server..."
exec uvicorn backend.main:app --host 0.0.0.0 --port 8000
