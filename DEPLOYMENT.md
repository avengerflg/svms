# SVMS Deployment Guide - Hostinger VPS with CyberPanel

## Prerequisites

- Hostinger VPS with CyberPanel installed
- SSH access to your VPS
- Domain name pointed to your VPS IP
- Node.js and MongoDB support

## Deployment Steps

### 1. VPS Setup

```bash
# SSH into your VPS
ssh root@31.97.239.153

# Update system
yum update -y  # For CentOS/AlmaLinux
# or
apt update && apt upgrade -y  # For Ubuntu

# Install Node.js (if not installed)
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
yum install -y nodejs

# Install PM2 for process management
npm install -g pm2

# Install MongoDB
# Follow MongoDB installation guide for your OS
```

### 2. CyberPanel Configuration

1. Login to CyberPanel (https://your-vps-ip:8090)
2. Create new website for your domain
3. Enable Node.js for the website
4. Configure SSL certificate

### 3. Code Deployment

```bash
# Navigate to your website directory
cd /home/yourdomain.com/public_html

# Clone your repository
git clone https://github.com/avengerflg/svms.git .

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Build frontend for production
npm run build
```

### 4. Environment Configuration

```bash
# Create production environment file
cp backend/.env.example backend/.env

# Edit environment variables
nano backend/.env
```

### 5. Database Setup

```bash
# Start MongoDB service
systemctl start mongod
systemctl enable mongod

# Create database and seed users
cd backend
npm run seed
```

### 6. Process Management

```bash
# Start backend with PM2
cd backend
pm2 start src/server.ts --name svms-backend --interpreter ts-node

# Serve frontend through web server
# Copy built files to web root
cp -r frontend/build/* /home/yourdomain.com/public_html/
```

### 7. Nginx Configuration (if needed)

```nginx
# Proxy API requests to Node.js backend
location /api {
    proxy_pass http://localhost:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

## Production Environment Variables

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/svms_production
JWT_SECRET=your-super-secure-jwt-secret-key
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-key
CORS_ORIGIN=https://yourdomain.com
```

## Security Checklist

- [ ] MongoDB secured with authentication
- [ ] SSL certificate installed
- [ ] Firewall configured
- [ ] Environment variables secured
- [ ] PM2 startup configured
- [ ] Regular backups scheduled
