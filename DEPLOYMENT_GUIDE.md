# 🚀 Orbital Protocol - Complete Deployment Guide

## 📋 **Overview**

This guide will help you deploy both the **UI** and **Relayer** components of the Orbital Protocol to Vercel with automatic deployment from GitHub.

## 🎯 **What We're Deploying**

1. **Frontend UI** - Vue.js application with Sui wallet integration
2. **Relayer Service** - Cross-chain message relay service
3. **Automatic Deployment** - GitHub Actions workflow

## 🚀 **Step 1: Complete GitHub Push**

First, complete the GitHub authentication in your browser and push the code:

```bash
git push origin main
```

## 🌐 **Step 2: Set Up Vercel Projects**

### **2.1 Create UI Project on Vercel**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Set project name: `orbital-protocol-ui`
5. Set root directory: `ui`
6. Build command: `npm run build`
7. Output directory: `dist`
8. Install command: `npm install`

### **2.2 Create Relayer Project on Vercel**

1. Click "New Project" again
2. Import the same GitHub repository
3. Set project name: `orbital-protocol-relayer`
4. Set root directory: `relayer`
5. Build command: `npm run build`
6. Output directory: `dist`
7. Install command: `npm install`

## 🔑 **Step 3: Get Vercel Credentials**

### **3.1 Get Vercel Token**

1. Go to [Vercel Account Settings](https://vercel.com/account/tokens)
2. Click "Create Token"
3. Name: `orbital-protocol-deploy`
4. Copy the token

### **3.2 Get Project IDs**

1. Go to your UI project settings
2. Copy the **Project ID**
3. Go to your Relayer project settings
4. Copy the **Project ID**
5. Go to your Vercel account settings
6. Copy the **Team ID** (or User ID if personal account)

## ⚙️ **Step 4: Set GitHub Secrets**

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Add these secrets:

```
VERCEL_TOKEN = your_vercel_token
ORG_ID = your_team_or_user_id
UI_PROJECT_ID = ui_project_id
RELAYER_PROJECT_ID = relayer_project_id
```

## 🔄 **Step 5: Automatic Deployment**

Once you push to GitHub, the workflow will automatically:

1. **Build and deploy UI** to Vercel
2. **Build and deploy Relayer** to Vercel
3. **Update both services** automatically

## 🎯 **Step 6: Configure Environment Variables**

### **6.1 UI Environment Variables**

In your Vercel UI project, add these environment variables:

```bash
VITE_ETH_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
VITE_ETH_CHAIN_ID=43113
VITE_ORBITAL_CONTRACT=0xE580dF77F7Bee058f640F56c0111F80f5D3df60E
VITE_SUI_RPC_URL=https://fullnode.testnet.sui.io:443
VITE_ORBITAL_PACKAGE_ID=0x90dc37f06e229842249b1916073ee81d2025149b9f53f30cff1a48ce5e0c8f3d
VITE_SUI_CHAIN_ID=21
VITE_WORMHOLE_BRIDGE=0x7bbcE28e64B3F8b84d876Ab298393c38ad7aac4C
```

### **6.2 Relayer Environment Variables**

In your Vercel Relayer project, add these environment variables:

```bash
ETH_PRIVATE_KEY=your_ethereum_private_key
SUI_PRIVATE_KEY=your_sui_private_key
REDIS_CLOUD_URL=your_redis_cloud_url
REDIS_CLOUD_PASSWORD=your_redis_password
SPY_HOST=https://wormhole-v2-testnet-api.certus.one
```

## 🧪 **Step 7: Test Deployment**

### **7.1 Test UI**

1. Visit your UI Vercel URL
2. Test Sui wallet connection
3. Verify all components load

### **7.2 Test Relayer**

1. Check relayer logs in Vercel
2. Test cross-chain transaction
3. Verify VAA processing

## 🔧 **Manual Deployment (Alternative)**

If you prefer manual deployment:

### **UI Deployment**
```bash
cd ui
vercel --prod
```

### **Relayer Deployment**
```bash
cd relayer
vercel --prod
```

## 📱 **Monitoring & Updates**

### **GitHub Actions**
- View deployment status in **Actions** tab
- Automatic deployment on every push to `main`
- Build logs and error tracking

### **Vercel Dashboard**
- Monitor both projects
- View deployment history
- Check function logs

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **Environment Variables**
   - Ensure all required variables are set
   - Check variable names match exactly
   - Verify no extra spaces

3. **Deployment Failures**
   - Check Vercel token permissions
   - Verify project IDs are correct
   - Check GitHub secrets are set

## 🎉 **Success Indicators**

✅ **UI**: Accessible via Vercel URL with full functionality  
✅ **Relayer**: Running and processing cross-chain messages  
✅ **Auto-deploy**: GitHub Actions working on every push  
✅ **Cross-chain**: Transactions flowing between Ethereum and Sui  

## 🔄 **Future Updates**

- Push code to `main` branch
- GitHub Actions automatically deploy
- Both services update simultaneously
- Zero downtime deployments

---

**🎯 Your Orbital Protocol is now fully automated and production-ready!**
