#!/bin/bash
# FarmUp Deployment Script for Ubuntu 22.04
# Run as root or with sudo

set -e

echo "=== FarmUp Deployment Setup ==="

# Update system
apt update && apt upgrade -y

# Install dependencies
apt install -y python3 python3-pip python3-venv nginx certbot python3-certbot-nginx git nodejs npm

# Create app directory
mkdir -p /var/www/agrofarmup
cd /var/www/agrofarmup

# Clone repository
if [ -d ".git" ]; then
    git pull origin main
else
    git clone https://github.com/AtwijukaAbcj/farmup.git .
fi

# ========== BACKEND SETUP ==========
echo "=== Setting up Django Backend ==="
cd /var/www/agrofarmup/farm_support_admin

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn

# Create production settings
cat > farm_support_backend/production_settings.py << 'EOF'
from .settings import *

DEBUG = False
ALLOWED_HOSTS = ['api.agrofarmup.com', 'agrofarmup.com', 'admin.agrofarmup.com', '149.255.63.77', 'localhost']

CORS_ALLOWED_ORIGINS = [
    "https://agrofarmup.com",
    "https://admin.agrofarmup.com",
    "http://agrofarmup.com",
    "http://admin.agrofarmup.com",
]

CORS_ALLOW_ALL_ORIGINS = False
CSRF_TRUSTED_ORIGINS = [
    "https://agrofarmup.com",
    "https://admin.agrofarmup.com",
]

STATIC_ROOT = '/var/www/agrofarmup/static/'
MEDIA_ROOT = '/var/www/agrofarmup/media/'

# Security settings
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
EOF

# Run migrations
export DJANGO_SETTINGS_MODULE=farm_support_backend.production_settings
python manage.py migrate
python manage.py collectstatic --noinput

# Create static/media directories
mkdir -p /var/www/agrofarmup/static
mkdir -p /var/www/agrofarmup/media
chown -R www-data:www-data /var/www/agrofarmup/static
chown -R www-data:www-data /var/www/agrofarmup/media

deactivate

# ========== WEB APP SETUP ==========
echo "=== Building Web Marketplace ==="
cd /var/www/agrofarmup/Web

# Create production .env
cat > .env.production << 'EOF'
VITE_API_URL=https://api.agrofarmup.com/api
EOF

npm install
npm run build

# ========== ADMIN APP SETUP ==========
echo "=== Building Admin Dashboard ==="
cd /var/www/agrofarmup/farm_support_admin/client

# Create production .env
cat > .env.production << 'EOF'
REACT_APP_API_URL=https://api.agrofarmup.com/api
EOF

npm install
npm run build

# ========== SYSTEMD SERVICE ==========
echo "=== Creating Gunicorn Service ==="
cat > /etc/systemd/system/agrofarmup.service << 'EOF'
[Unit]
Description=AgroFarmUp Django Backend
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/agrofarmup/farm_support_admin
Environment="DJANGO_SETTINGS_MODULE=farm_support_backend.production_settings"
ExecStart=/var/www/agrofarmup/farm_support_admin/venv/bin/gunicorn --workers 3 --bind unix:/var/www/agrofarmup/agrofarmup.sock farm_support_backend.wsgi:application
Restart=always

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable agrofarmup
systemctl start agrofarmup

# ========== NGINX SETUP ==========
echo "=== Configuring Nginx ==="

# API (Django Backend)
cat > /etc/nginx/sites-available/api.agrofarmup.com << 'EOF'
server {
    listen 80;
    server_name api.agrofarmup.com;

    location /static/ {
        alias /var/www/agrofarmup/static/;
    }

    location /media/ {
        alias /var/www/agrofarmup/media/;
    }

    location / {
        proxy_pass http://unix:/var/www/agrofarmup/agrofarmup.sock;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Web Marketplace (React/Vite)
cat > /etc/nginx/sites-available/agrofarmup.com << 'EOF'
server {
    listen 80;
    server_name agrofarmup.com www.agrofarmup.com;

    root /var/www/agrofarmup/Web/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://unix:/var/www/agrofarmup/agrofarmup.sock;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Admin Dashboard (React)
cat > /etc/nginx/sites-available/admin.agrofarmup.com << 'EOF'
server {
    listen 80;
    server_name admin.agrofarmup.com;

    root /var/www/agrofarmup/farm_support_admin/client/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://unix:/var/www/agrofarmup/agrofarmup.sock;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable sites
ln -sf /etc/nginx/sites-available/api.agrofarmup.com /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/agrofarmup.com /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/admin.agrofarmup.com /etc/nginx/sites-enabled/

# Test and restart nginx
nginx -t
systemctl restart nginx

echo "=== Setup Complete ==="
echo ""
echo "Next steps:"
echo "1. Add DNS A records pointing to 149.255.63.77"
echo "2. Run: sudo certbot --nginx -d agrofarmup.com -d www.agrofarmup.com -d admin.agrofarmup.com -d api.agrofarmup.com"
echo ""
echo "URLs:"
echo "  - Web: http://agrofarmup.com"
echo "  - Admin: http://admin.agrofarmup.com"
echo "  - API: http://api.agrofarmup.com"
