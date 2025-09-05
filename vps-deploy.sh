#!/bin/bash

# SVMS Quick Deployment Script for CyberPanel VPS
# Run this on your server: curl -sSL https://raw.githubusercontent.com/avengerflg/svms/main/vps-deploy.sh | bash

set -e

echo "🚀 Starting SVMS deployment on CyberPanel VPS..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}
╔══════════════════════════════════════════════════════════╗
║                    SVMS Deployment                      ║
║          School Visitor Management System               ║
╚══════════════════════════════════════════════════════════╝${NC}
"
}

print_header

# Step 1: Update system
print_status "Updating system packages..."
yum update -y

# Step 2: Install Docker
print_status "Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl start docker
    systemctl enable docker
else
    print_status "Docker already installed"
fi

# Step 3: Install Docker Compose
print_status "Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/download/v2.15.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
else
    print_status "Docker Compose already installed"
fi

# Step 4: Clone SVMS repository
print_status "Cloning SVMS repository..."
cd /opt
if [ -d "svms" ]; then
    cd svms
    git pull origin main
else
    git clone https://github.com/avengerflg/svms.git
    cd svms
fi

# Step 5: Generate secure environment
print_status "Generating secure environment configuration..."
if [ ! -f ".env.docker" ]; then
    MONGO_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    REDIS_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    JWT_SECRET=$(openssl rand -base64 64)
    JWT_REFRESH_SECRET=$(openssl rand -base64 64)
    
    cat > .env.docker << EOF
# Generated on $(date)
DOMAIN=31.97.239.153
ACME_EMAIL=admin@localhost

# Database Configuration
MONGO_PASSWORD=$MONGO_PASSWORD
REDIS_PASSWORD=$REDIS_PASSWORD

# JWT Configuration
JWT_SECRET=$JWT_SECRET
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET

# CORS Configuration
CORS_ORIGIN=http://31.97.239.153
EOF
fi

# Step 6: Configure firewall
print_status "Configuring firewall..."
firewall-cmd --permanent --add-port=80/tcp
firewall-cmd --permanent --add-port=443/tcp
firewall-cmd --permanent --add-port=3000/tcp
firewall-cmd --permanent --add-port=5000/tcp
firewall-cmd --reload

# Step 7: Deploy with Docker
print_status "Deploying SVMS with Docker..."
chmod +x docker-deploy.sh
./docker-deploy.sh development

print_status "✅ SVMS deployment completed!"
echo ""
print_status "🌐 Access your application:"
echo "   Frontend: http://31.97.239.153:3000"
echo "   Backend API: http://31.97.239.153:5000"
echo "   CyberPanel: https://31.97.239.153:8090"
echo ""
print_status "📊 Default Login Credentials:"
echo "   Super Admin: superadmin@school.edu / password123"
echo "   School Admin: admin@school.edu / password123"
echo ""
print_status "🔧 Useful Commands:"
echo "   Check status: cd /opt/svms && docker-compose ps"
echo "   View logs: cd /opt/svms && docker-compose logs -f"
echo "   Restart: cd /opt/svms && docker-compose restart"
