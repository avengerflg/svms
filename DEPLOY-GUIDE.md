# Quick Deploy Guide for Your VPS (31.97.239.153)

## Step-by-Step Deployment

### 1. SSH into your VPS

```bash
ssh root@31.97.239.153
```

### 2. Install Docker (if not already installed)

```bash
# Check if Docker is installed
docker --version

# If not installed, install it
curl -fsSL https://get.docker.com | sh
systemctl start docker
systemctl enable docker

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.15.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

### 3. Clone and Deploy SVMS

```bash
# Navigate to a good location
cd /opt

# Clone your repository
git clone https://github.com/avengerflg/svms.git
cd svms

# Configure environment (IMPORTANT!)
cp .env.docker .env.docker.local
nano .env.docker.local

# Update these values:
# DOMAIN=yourdomain.com
# ACME_EMAIL=your-email@yourdomain.com
```

### 4. Deploy with Docker

```bash
# Make deployment script executable
chmod +x docker-deploy.sh

# Deploy production environment
./docker-deploy.sh production
```

### 5. Check Status

```bash
# Check if services are running
docker-compose -f docker-compose.prod.yml ps

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

## Alternative: Manual Docker Commands

If the script doesn't work, run manually:

```bash
# Start services
docker-compose -f docker-compose.prod.yml --env-file .env.docker.local up -d

# Check status
docker ps

# Access application
curl http://localhost/api/health
```

## Firewall Configuration

```bash
# Allow HTTP and HTTPS
ufw allow 80
ufw allow 443
ufw allow 8090  # CyberPanel
ufw enable
```

## Access Your Application

After deployment:

- Frontend: https://yourdomain.com
- Backend API: https://yourdomain.com/api
- Health Check: https://yourdomain.com/api/health

## Default Login Credentials

- Super Admin: superadmin@school.edu / password123
- School Admin: admin@school.edu / password123
