# 🚀 Vercel Deployment Guide for Orbital Protocol UI

## 📋 **Prerequisites**

- ✅ **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
- ✅ **GitHub Repository** - Your code should be on GitHub
- ✅ **Node.js 18+** - For local development and testing

## 🔧 **Step 1: Local Testing**

Before deploying, test locally:

```bash
# Install dependencies
npm install

# Create .env file from template
copy env-template.txt .env

# Update .env with your Firebase credentials
# (Optional - only if you want Firebase features)

# Start development server
npm run dev

# Test build
npm run build
```

## 🌐 **Step 2: Deploy to Vercel**

### **Option A: Vercel Dashboard (Recommended)**

1. **Go to [vercel.com](https://vercel.com)**
2. **Click "New Project"**
3. **Import your GitHub repository**
4. **Configure project:**
   - **Framework Preset:** Vue.js
   - **Root Directory:** `ui` (if your repo has multiple folders)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

### **Option B: Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from ui directory
cd ui
vercel

# Follow prompts to configure
```

## ⚙️ **Step 3: Environment Variables**

**Vercel will automatically use the environment variables from `vercel.json`**, but you can also set them manually in the dashboard:

### **Required Variables (Already in vercel.json):**
- `VITE_ETH_RPC_URL`
- `VITE_ETH_CHAIN_ID`
- `VITE_ORBITAL_CONTRACT`
- `VITE_SUI_RPC_URL`
- `VITE_ORBITAL_PACKAGE_ID`
- `VITE_WORMHOLE_BRIDGE`

### **Optional Variables (Set in dashboard if needed):**
- `VITE_FS_API_KEY` - Firebase API Key
- `VITE_FS_AUTH_DOMAIN` - Firebase Auth Domain
- `VITE_FS_PROJECT_ID` - Firebase Project ID

## 🔍 **Step 4: Verify Deployment**

After deployment, verify:

1. **✅ App loads without errors**
2. **✅ Wallet connections work**
3. **✅ Contract interactions function**
4. **✅ Cross-chain features work**

## 🚨 **Troubleshooting**

### **Build Errors:**
```bash
# Clear dependencies and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run type-check
```

### **Environment Issues:**
- Ensure all `VITE_*` variables are set
- Check that contract addresses are correct
- Verify RPC URLs are accessible

### **Deployment Issues:**
- Check build logs in Vercel dashboard
- Ensure `dist` folder is generated
- Verify `vercel.json` configuration

## 🌟 **Production Checklist**

- [ ] **Local build succeeds** (`npm run build`)
- [ ] **All environment variables set**
- [ ] **Contract addresses updated**
- [ ] **Wallet connections tested**
- [ ] **Cross-chain features verified**
- [ ] **Mobile responsiveness checked**
- [ ] **Performance optimized**

## 🔗 **Useful Links**

- **Vercel Dashboard:** [vercel.com/dashboard](https://vercel.com/dashboard)
- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **Orbital Protocol:** Your deployed contracts
- **Testnet Explorers:** 
  - [Avalanche Testnet](https://testnet.snowtrace.io)
  - [Sui Testnet](https://suiexplorer.com)

## 🎉 **Success!**

Once deployed, your Orbital Protocol UI will be available at:
`https://your-project-name.vercel.app`

**Happy Deploying! 🚀**
