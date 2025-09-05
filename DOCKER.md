# Docker Deployment Guide for SVMS

## 🐳 **Why Docker?**

Docker provides several advantages for deploying SVMS:

- ✅ **Consistent Environment**: Same setup across development, staging, and production
- ✅ **Easy Deployment**: One-command deployment anywhere
- ✅ **Isolated Services**: Each component runs in its own container
- ✅ **Scalability**: Easy to scale individual services
- ✅ **Portability**: Works on any system with Docker
- ✅ **Automatic SSL**: Production setup includes automatic HTTPS

## 🚀 **Quick Start**

### Prerequisites

- Docker Engine 20.0+
- Docker Compose 2.0+
- 2GB+ RAM
- 10GB+ disk space

### One-Command Deployment

```bash
# Clone repository
git clone https://github.com/avengerflg/svms.git
cd svms

# Deploy (development)
./docker-deploy.sh development

# Deploy (production)
./docker-deploy.sh production
```

## 📋 **Deployment Options**

### 1. Development Environment

Perfect for local development and testing.

```bash
# Start development environment
./docker-deploy.sh development

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# MongoDB: localhost:27017
```

**Services included:**

- Frontend (React) on port 3000
- Backend (Node.js) on port 5000
- MongoDB on port 27017
- Redis on port 6379

### 2. Production Environment

Full production setup with SSL, reverse proxy, and security.

```bash
# Update domain in .env.docker first
nano .env.docker

# Deploy to production
./docker-deploy.sh production

# Access the application
# Frontend: https://yourdomain.com
# Backend: https://yourdomain.com/api
```

**Services included:**

- Traefik reverse proxy with automatic SSL
- Frontend (React) with Nginx
- Backend (Node.js) API
- MongoDB with authentication
- Redis for caching

## 🔧 **Configuration**

### Environment Variables (.env.docker)

```env
# Domain Configuration
DOMAIN=yourdomain.com
ACME_EMAIL=admin@yourdomain.com

# Database Passwords (auto-generated)
MONGO_PASSWORD=your-secure-password
REDIS_PASSWORD=your-secure-password

# JWT Secrets (auto-generated)
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret

# CORS Configuration
CORS_ORIGIN=https://yourdomain.com
```

### For Your VPS (31.97.239.153)

1. **Point your domain to VPS IP:**

   ```bash
   # In your domain DNS settings
   A record: yourdomain.com → 31.97.239.153
   A record: www.yourdomain.com → 31.97.239.153
   ```

2. **Update configuration:**

   ```bash
   # Edit .env.docker
   DOMAIN=yourdomain.com
   ACME_EMAIL=your-email@yourdomain.com
   CORS_ORIGIN=https://yourdomain.com
   ```

3. **Deploy:**
   ```bash
   ./docker-deploy.sh production
   ```

## 🛠 **Management Commands**

```bash
# View all services
docker-compose ps

# View logs
docker-compose logs -f
docker-compose logs backend
docker-compose logs frontend

# Restart services
docker-compose restart
docker-compose restart backend

# Stop all services
docker-compose down

# Stop and remove volumes (data loss!)
docker-compose down -v

# Access containers
docker-compose exec backend bash
docker-compose exec mongodb mongosh

# Update application
git pull origin main
docker-compose up --build -d
```

## 📊 **Monitoring & Health Checks**

All services include health checks:

```bash
# Check service health
docker-compose ps

# View health check logs
docker inspect svms-backend --format='{{.State.Health.Status}}'

# Manual health check
curl http://localhost:5000/api/health
```

## 🔒 **Security Features**

### Automatic SSL (Production)

- LetsEncrypt integration via Traefik
- Automatic certificate renewal
- HTTP to HTTPS redirect

### Database Security

- MongoDB authentication enabled
- Strong password generation
- Network isolation

### Application Security

- Secure JWT secrets
- CORS protection
- Security headers

## 📈 **Scaling**

Scale individual services:

```bash
# Scale backend (multiple instances)
docker-compose up --scale backend=3 -d

# Scale with custom compose file
docker-compose -f docker-compose.prod.yml up --scale backend=2 -d
```

## 🔧 **Troubleshooting**

### Common Issues

1. **Port already in use:**

   ```bash
   # Check what's using the port
   sudo lsof -i :80
   sudo lsof -i :443

   # Stop conflicting services
   sudo systemctl stop apache2
   sudo systemctl stop nginx
   ```

2. **Permission denied:**

   ```bash
   # Fix Docker permissions
   sudo usermod -aG docker $USER
   newgrp docker
   ```

3. **SSL certificate issues:**

   ```bash
   # Check Traefik logs
   docker-compose logs traefik

   # Verify domain DNS
   nslookup yourdomain.com
   ```

4. **Database connection failed:**

   ```bash
   # Check MongoDB logs
   docker-compose logs mongodb

   # Restart database
   docker-compose restart mongodb
   ```

## 🚀 **Deployment on Your VPS**

### Step-by-step for Hostinger VPS (31.97.239.153):

1. **SSH into your VPS:**

   ```bash
   ssh root@31.97.239.153
   ```

2. **Install Docker:**

   ```bash
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh

   # Install Docker Compose
   curl -L "https://github.com/docker/compose/releases/download/v2.15.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   chmod +x /usr/local/bin/docker-compose
   ```

3. **Clone and deploy:**

   ```bash
   # Clone repository
   git clone https://github.com/avengerflg/svms.git
   cd svms

   # Update domain in configuration
   nano .env.docker
   # Set DOMAIN=yourdomain.com

   # Deploy production
   ./docker-deploy.sh production
   ```

4. **Configure firewall:**
   ```bash
   # Allow HTTP and HTTPS
   ufw allow 80
   ufw allow 443
   ufw enable
   ```

Your SVMS will be live at `https://yourdomain.com` with automatic SSL! 🎉

## 📝 **Default Credentials**

After deployment, use these credentials:

- **Super Admin:** `superadmin@school.edu` / `password123`
- **School Admin:** `admin@school.edu` / `password123`
- **Security Guard:** `security@school.edu` / `password123`

## 🔄 **Updates**

To update your application:

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose up --build -d

# Or for production
docker-compose -f docker-compose.prod.yml up --build -d
```
