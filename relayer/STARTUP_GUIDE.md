# 🚀 Orbital Relayer Startup Guide

## 📋 Prerequisites

Before starting the relayer, make sure you have:
- Node.js 18+ installed
- Docker and Docker Compose installed
- Private keys for Ethereum (Avalanche) and Sui networks

## 🔧 Setup Steps

### 1. Environment Configuration

Create a `.env` file in the relayer directory:

```bash
# Relayer Environment Configuration

# Wormhole Configuration
SPY_HOST=localhost:7073
REDIS_HOST=localhost:6379

# Ethereum Configuration (Avalanche Testnet)
ETH_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
ETH_PRIVATE_KEY=your_ethereum_private_key_here
ETH_CHAIN_ID=43113

# Sui Configuration
SUI_RPC_URL=https://fullnode.testnet.sui.io:443
SUI_PRIVATE_KEY=your_sui_private_key_here

# Block Eden API Key (for Sui indexing)
BLOCK_EDEN_KEY=yoWczNougaeiUqV41Y96

# Relayer Configuration
RELAYER_NAME=OrbitalRelayer
ENVIRONMENT=TESTNET
```

**⚠️ IMPORTANT:** Replace `your_ethereum_private_key_here` and `your_sui_private_key_here` with your actual private keys.

### 2. Install Dependencies

```bash
npm install
```

### 3. Build the Relayer

```bash
npm run build
```

### 4. Start Infrastructure Services

Start Redis and Guardian services using Docker:

```bash
# Start Redis
docker-compose up redis -d

# Start Guardian (Wormhole spy)
docker-compose up guardiand -d
```

### 5. Start the Relayer

```bash
# Production mode
npm start

# Development mode (with auto-reload)
npm run dev
```

## 🌐 Service Endpoints

- **Relayer API:** http://localhost:3000
- **Redis:** localhost:6379
- **Guardian Spy:** localhost:7073

## 📊 Monitoring

The relayer will log:
- VAA (Validator Approval Authority) messages
- Cross-chain transactions
- Loan creation and repayment events
- Error messages and transaction status

## 🔍 Troubleshooting

### Common Issues:

1. **"Cannot connect to Redis"**
   - Ensure Redis is running: `docker-compose ps`
   - Check Redis logs: `docker-compose logs redis`

2. **"Cannot connect to Guardian"**
   - Ensure Guardian is running: `docker-compose ps`
   - Check Guardian logs: `docker-compose logs guardiand`

3. **"Private key not set"**
   - Verify your `.env` file has the correct private keys
   - Ensure no extra spaces or quotes around the keys

4. **"Build failed"**
   - Run `npm install` to ensure all dependencies are installed
   - Check TypeScript errors in the console

### Logs:

```bash
# View relayer logs
npm run dev

# View Docker service logs
docker-compose logs -f
```

## 🚨 Security Notes

- **Never commit your `.env` file** to version control
- **Keep your private keys secure** and never share them
- **Use testnet keys** for development
- **Monitor transactions** on both networks

## 🔄 Next Steps

After the relayer is running:

1. **Test cross-chain functionality** by creating loans on one network
2. **Monitor VAA messages** in the console
3. **Verify transactions** on both Avalanche and Sui explorers
4. **Set up monitoring** for production use

## 📞 Support

If you encounter issues:
1. Check the logs for error messages
2. Verify all services are running
3. Ensure your private keys are correct
4. Check network connectivity to RPC endpoints

---

**Happy Relaying! 🎉**
