#!/bin/bash

# SVMS Production Deployment Script
# Usage: ./deploy.sh

set -e  # Exit on any error

echo "🚀 Starting SVMS deployment..."

# Configuration
DOMAIN="yourdomain.com"
WEB_ROOT="/home/$DOMAIN/public_html"
BACKUP_DIR="/home/$DOMAIN/backups/$(date +%Y%m%d_%H%M%S)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then
    print_error "Please run as root or with sudo"
    exit 1
fi

# Create backup of existing deployment
if [ -d "$WEB_ROOT" ]; then
    print_status "Creating backup of existing deployment..."
    mkdir -p "$BACKUP_DIR"
    cp -r "$WEB_ROOT" "$BACKUP_DIR/"
fi

# Update system packages
print_status "Updating system packages..."
if command -v yum &> /dev/null; then
    yum update -y
elif command -v apt &> /dev/null; then
    apt update && apt upgrade -y
fi

# Install Node.js if not installed
if ! command -v node &> /dev/null; then
    print_status "Installing Node.js..."
    if command -v yum &> /dev/null; then
        curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
        yum install -y nodejs
    elif command -v apt &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt-get install -y nodejs
    fi
fi

# Install PM2 if not installed
if ! command -v pm2 &> /dev/null; then
    print_status "Installing PM2..."
    npm install -g pm2
fi

# Install MongoDB if not installed
if ! command -v mongod &> /dev/null; then
    print_status "Installing MongoDB..."
    if command -v yum &> /dev/null; then
        # Add MongoDB repository for CentOS/RHEL
        cat > /etc/yum.repos.d/mongodb-org-6.0.repo << EOF
[mongodb-org-6.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/\$releasever/mongodb-org/6.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-6.0.asc
EOF
        yum install -y mongodb-org
    elif command -v apt &> /dev/null; then
        # Install MongoDB for Ubuntu/Debian
        wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
        echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
        apt update
        apt install -y mongodb-org
    fi
    
    # Start and enable MongoDB
    systemctl start mongod
    systemctl enable mongod
fi

# Navigate to web directory
print_status "Preparing web directory..."
cd "$WEB_ROOT" || exit 1

# Clone or update repository
if [ -d ".git" ]; then
    print_status "Updating existing repository..."
    git pull origin main
else
    print_status "Cloning repository..."
    git clone https://github.com/avengerflg/svms.git .
fi

# Install backend dependencies
print_status "Installing backend dependencies..."
cd backend
npm ci --production

# Create production environment file
if [ ! -f ".env" ]; then
    print_status "Creating production environment file..."
    cp .env.example .env
    
    # Generate secure JWT secrets
    JWT_SECRET=$(openssl rand -base64 64)
    JWT_REFRESH_SECRET=$(openssl rand -base64 64)
    
    # Update environment file
    sed -i "s/NODE_ENV=development/NODE_ENV=production/" .env
    sed -i "s/MONGODB_URI=.*/MONGODB_URI=mongodb:\/\/localhost:27017\/svms_production/" .env
    sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
    sed -i "s/JWT_REFRESH_SECRET=.*/JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET/" .env
    sed -i "s/CORS_ORIGIN=.*/CORS_ORIGIN=https:\/\/$DOMAIN/" .env
    
    print_warning "Please review and update the .env file with your specific configuration"
fi

# Build TypeScript
print_status "Building backend..."
npm run build 2>/dev/null || print_warning "Build script not found, using ts-node in production"

# Seed database
print_status "Seeding database..."
npm run seed || print_warning "Seed script not found"

# Install frontend dependencies and build
print_status "Building frontend..."
cd ../frontend
npm ci
npm run build

# Copy built frontend to web root
print_status "Deploying frontend..."
rm -rf ../public_html_backup 2>/dev/null || true
cp -r "$WEB_ROOT" ../public_html_backup 2>/dev/null || true
cp -r build/* "$WEB_ROOT/"

# Start/restart backend with PM2
print_status "Starting backend service..."
cd ../backend
pm2 delete svms-backend 2>/dev/null || true
pm2 start ../ecosystem.config.json
pm2 save
pm2 startup

# Set up log rotation
print_status "Setting up log rotation..."
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30

# Configure firewall (if ufw is available)
if command -v ufw &> /dev/null; then
    print_status "Configuring firewall..."
    ufw allow 22    # SSH
    ufw allow 80    # HTTP
    ufw allow 443   # HTTPS
    ufw allow 8090  # CyberPanel
    ufw --force enable
fi

print_status "✅ Deployment completed successfully!"
print_status "Backend is running on port 5000"
print_status "Frontend is deployed to web root"
print_status "Check PM2 status: pm2 status"
print_status "Check logs: pm2 logs svms-backend"

echo ""
print_warning "Post-deployment checklist:"
echo "1. Update DNS records to point to your VPS IP"
echo "2. Configure SSL certificate in CyberPanel"
echo "3. Review and update environment variables in backend/.env"
echo "4. Test the application at https://$DOMAIN"
echo "5. Set up automated backups"
echo "6. Configure monitoring and alerts"
