#!/bin/bash

# SVMS Docker Deployment Script
# Usage: ./docker-deploy.sh [environment]
# Environments: development, production

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_header() {
    echo -e "${BLUE}
╔══════════════════════════════════════════════════════════╗
║                    SVMS Docker Deployment                ║
║          School Visitor Management System               ║
╚══════════════════════════════════════════════════════════╝${NC}
"
}

# Default environment
ENVIRONMENT=${1:-development}

print_header

print_status "Starting SVMS deployment in $ENVIRONMENT mode..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Generate secure passwords if not exists
if [ ! -f ".env.docker" ]; then
    print_status "Generating environment configuration..."
    
    # Generate secure passwords
    MONGO_PASSWORD=$(openssl rand -base64 32)
    REDIS_PASSWORD=$(openssl rand -base64 32)
    JWT_SECRET=$(openssl rand -base64 64)
    JWT_REFRESH_SECRET=$(openssl rand -base64 64)
    
    # Create .env.docker file
    cat > .env.docker << EOF
# Generated on $(date)
DOMAIN=localhost
ACME_EMAIL=admin@localhost

# Database Configuration
MONGO_PASSWORD=$MONGO_PASSWORD
REDIS_PASSWORD=$REDIS_PASSWORD

# JWT Configuration
JWT_SECRET=$JWT_SECRET
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
EOF
    
    print_warning "Generated .env.docker file. Please update with your domain and email."
fi

# Function to deploy development environment
deploy_development() {
    print_status "Deploying development environment..."
    
    # Stop existing containers
    docker-compose down -v 2>/dev/null || true
    
    # Build and start services
    docker-compose --env-file .env.docker up --build -d
    
    print_status "Waiting for services to be healthy..."
    sleep 30
    
    # Seed database
    print_status "Seeding database..."
    docker-compose exec backend npm run seed || print_warning "Database seeding failed"
}

# Function to deploy production environment
deploy_production() {
    print_status "Deploying production environment..."
    
    # Validate environment variables
    if grep -q "yourdomain.com" .env.docker; then
        print_error "Please update .env.docker with your actual domain before production deployment"
        exit 1
    fi
    
    # Stop existing containers
    docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
    
    # Build and start services
    docker-compose -f docker-compose.prod.yml --env-file .env.docker up --build -d
    
    print_status "Waiting for services to be healthy..."
    sleep 60
    
    # Seed database
    print_status "Seeding database..."
    docker-compose -f docker-compose.prod.yml exec backend npm run seed || print_warning "Database seeding failed"
}

# Deploy based on environment
case $ENVIRONMENT in
    "development")
        deploy_development
        APP_URL="http://localhost:3000"
        API_URL="http://localhost:5000"
        ;;
    "production")
        deploy_production
        DOMAIN=$(grep "DOMAIN=" .env.docker | cut -d'=' -f2)
        APP_URL="https://$DOMAIN"
        API_URL="https://$DOMAIN/api"
        ;;
    *)
        print_error "Invalid environment: $ENVIRONMENT. Use 'development' or 'production'"
        exit 1
        ;;
esac

# Show deployment status
print_status "Checking deployment status..."
docker-compose ps

print_status "✅ SVMS deployment completed successfully!"
echo ""
print_status "🌐 Application URLs:"
echo "   Frontend: $APP_URL"
echo "   Backend API: $API_URL/health"
echo "   API Documentation: $API_URL/api-docs"
echo ""
print_status "📊 Default Login Credentials:"
echo "   Super Admin: superadmin@school.edu / password123"
echo "   School Admin: admin@school.edu / password123"
echo ""
print_status "🔧 Useful Commands:"
echo "   View logs: docker-compose logs -f"
echo "   Stop services: docker-compose down"
echo "   Restart services: docker-compose restart"
echo "   Access database: docker-compose exec mongodb mongosh"
echo ""

if [ "$ENVIRONMENT" = "production" ]; then
    print_warning "Production deployment notes:"
    echo "   - SSL certificates will be automatically generated"
    echo "   - Make sure your domain points to this server"
    echo "   - Monitor logs for any SSL issues"
    echo "   - Backup your data regularly"
fi
