#!/bin/bash
# Quick update script - run after pushing new code to GitHub
set -e

cd /var/www/agrofarmup

echo "=== Pulling latest code ==="
git pull origin main

echo "=== Updating Backend ==="
cd /var/www/agrofarmup/farm_support_admin
source venv/bin/activate
pip install -r requirements.txt
export DJANGO_SETTINGS_MODULE=farm_support_backend.production_settings
python manage.py migrate
python manage.py collectstatic --noinput
deactivate

echo "=== Rebuilding Web App ==="
cd /var/www/agrofarmup/Web
npm install
npm run build

echo "=== Rebuilding Admin ==="
cd /var/www/agrofarmup/farm_support_admin/client
npm install
npm run build

echo "=== Restarting Services ==="
systemctl restart agrofarmup
systemctl restart nginx

echo "=== Update Complete ==="
