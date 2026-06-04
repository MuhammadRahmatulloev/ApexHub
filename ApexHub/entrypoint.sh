#!/bin/bash
set -e

if [ "$1" = "daphne" ]; then
    echo "==> Running migrations..."
    python manage.py migrate --noinput

    echo "==> Collecting static files..."
    python manage.py collectstatic --noinput

    echo "==> Starting Daphne..."
fi

exec "$@"