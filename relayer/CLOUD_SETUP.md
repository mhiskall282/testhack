# 🚀 Cloud Relayer Setup Guide

## 🌐 **Option 1: Redis Cloud (Recommended)**

### Step 1: Get Free Redis Cloud
1. Go to [Redis Cloud](https://redis.com/try-free/)
2. Sign up for free account
3. Create a new database
4. Copy the connection details

### Step 2: Update .env
```bash
# Redis Cloud
REDIS_CLOUD_URL=redis://your_host:port
REDIS_CLOUD_PASSWORD=your_password

# Public Wormhole Guardian
SPY_HOST=https://wormhole-v2-testnet-api.certus.one

# Your private keys
ETH_PRIVATE_KEY=your_ethereum_private_key
SUI_PRIVATE_KEY=your_sui_private_key
```

## 🚀 **Option 2: Upstash Redis (Alternative)**

### Step 1: Get Free Upstash Redis
1. Go to [Upstash](https://upstash.com/)
2. Sign up for free account
3. Create Redis database
4. Copy connection details

### Step 2: Update .env
```bash
# Upstash Redis
UPSTASH_REDIS_URL=your_redis_url
UPSTASH_REDIS_TOKEN=your_token

# Public Wormhole Guardian
SPY_HOST=https://wormhole-v2-testnet-api.certus.one
```

## 🔧 **Quick Setup Commands**

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start the relayer
npm start
```

## ✅ **What This Gives You**

- ✅ **No Docker required**
- ✅ **Free Redis hosting**
- ✅ **Public Wormhole Guardian**
- ✅ **Relayer runs locally**
- ✅ **Ready in minutes**

## 🚨 **Important Notes**

- **Redis Cloud**: 30MB free, perfect for testing
- **Upstash**: 10,000 requests/day free
- **Public Guardian**: Shared endpoint, good for development
- **Private Keys**: Keep these secure and never commit to git
