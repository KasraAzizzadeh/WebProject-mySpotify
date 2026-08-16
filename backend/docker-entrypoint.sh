#!/bin/sh

set -e

echo "Waiting for database..."

python - <<'PY'
import os
import time
import psycopg

while True:
    try:
        conn = psycopg.connect(
            dbname=os.environ["DATABASE_NAME"],
            user=os.environ["DATABASE_USER"],
            password=os.environ["DATABASE_PASSWORD"],
            host=os.environ["DATABASE_HOST"],
            port=os.environ["DATABASE_PORT"],
        )
        conn.close()
        break
    except psycopg.OperationalError:
        print("Database is not ready yet...")
        time.sleep(1)
PY

echo "Database is ready."

echo "Running migrations..."
python manage.py migrate --noinput

echo "Creating/updating admin user..."
python manage.py shell <<'PY'
import os
from accounts.models import User

username = os.environ.get("DJANGO_SUPERUSER_USERNAME", "Admin")
email = os.environ.get("DJANGO_SUPERUSER_EMAIL", "admin@gmail.com")
password = os.environ.get("DJANGO_SUPERUSER_PASSWORD", "Admin_1234")

user, created = User.objects.get_or_create(
    username=username,
    defaults={
        "email": email,
    },
)

if created:
    user.set_password(password)

user.email = email
user.is_staff = True
user.is_superuser = True
user.role = User.Roles.ADMIN

user.save()

print(f"Admin user ready: {username}")
PY

echo "Starting Django..."
exec "$@"