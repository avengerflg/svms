# Quick VPS Deployment for SVMS

## Your VPS Details

- IP: 31.97.239.153
- Type: Hostinger VPS with CyberPanel

## One-Command Deployment

```bash
# SSH into your VPS
ssh root@31.97.239.153

# Run the automated deployment script
curl -sSL https://raw.githubusercontent.com/avengerflg/svms/main/deploy.sh | bash
```

## Manual Steps

### 1. Connect to VPS

```bash
ssh root@31.97.239.153
```

### 2. Create Website in CyberPanel

1. Go to https://31.97.239.153:8090
2. Login to CyberPanel
3. Create new website for your domain
4. Point your domain to 31.97.239.153

### 3. Deploy Application

```bash
# Navigate to your domain folder
cd /home/yourdomain.com/public_html

# Clone repository
git clone https://github.com/avengerflg/svms.git .

# Install and setup
chmod +x deploy.sh
./deploy.sh
```

That's it! Your SVMS will be live on your VPS.
