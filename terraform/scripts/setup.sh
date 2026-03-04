#!/bin/bash
# Cloud-init script for Terra-Core deployment (Containerized)

# 1. Update and install basic dependencies
apt-get update
apt-get install -y apt-transport-https ca-certificates curl software-properties-common nginx git build-essential

# 2. Install Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 3. Also install docker-compose (v1) for backward compatibility with GitHub Actions scripts
apt-get install -y docker-compose

# 4. Create directory structure & Permissions
mkdir -p /var/www/heat-prediction
# Create the azureuser early so we can attach it to docker group
useradd -m -s /bin/bash azureuser || true 
usermod -aG docker azureuser
chown -R azureuser:azureuser /var/www/heat-prediction

# 5. Set up Nginx reverse proxy (Without trailing slashes to preserve paths!)
cat > /etc/nginx/sites-available/heat-prediction << 'EOF'
server {
    listen 80;
    server_name _;

    # Route /api/ to the Flask Gunicorn backend
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Route everything else to the Next.js frontend
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

# Enable the site and restart Nginx
ln -s /etc/nginx/sites-available/heat-prediction /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
systemctl restart nginx

# Instructions for user post-deployment (Now via GitHub Actions):
# 1. Push code to main branch to trigger GitHub Actions
# 2. GitHub Actions will build docker images and push to GHCR
# 3. actions runner will SSH into VM, copy docker-compose.yml, pull images, and run `docker-compose up -d`
# 4. Set up Let's Encrypt SSL manually once DNS is updated:
#    sudo apt install certbot python3-certbot-nginx -y
#    sudo certbot --nginx -d heatplant.harmohanjohal.com
