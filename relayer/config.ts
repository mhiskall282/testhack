import * as dotenv from "dotenv";

dotenv.config();

export const config = {
  // Wormhole Configuration
  spyHost: process.env.SPY_HOST || "localhost:7073",
  redisHost: process.env.REDIS_HOST || "localhost:6379",
  
  // Ethereum Configuration (Avalanche Testnet)
  ethRpcUrl: process.env.ETH_RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc",
  ethPrivateKey: process.env.ETH_PRIVATE_KEY || "",
  ethChainId: parseInt(process.env.ETH_CHAIN_ID || "43113"),
  
  // Sui Configuration
  suiRpcUrl: process.env.SUI_RPC_URL || "https://fullnode.testnet.sui.io:443",
  suiPrivateKey: process.env.SUI_PRIVATE_KEY || "",
  
  // Contract Addresses
  orbitalSui: "0xabb45ed94ba7366b631bee1dce8ecb456508f66b66bf7135841d8d57d2026270",
  orbitalSuiEmitter: "0xb872e9e85580f1b53e1bdb4f7abccb5c523a99f47cc8876106387971781f19a0",
  orbitalAvax: "0xE580dF77F7Bee058f640F56c0111F80f5D3df60E", // Updated to new deployment
  
  // Cross chain method identifiers
  onBorrowMethod: "0x4f4e5f424f52524f575f4d4554484f4400000000000000000000000000000000",
  onRepayMethod: "0x4f4e5f52455041595f4d4554484f4400000000000000000000000000000000",
  
  // Relayer Configuration
  relayerName: process.env.RELAYER_NAME || "OrbitalRelayer",
  environment: process.env.ENVIRONMENT || "TESTNET",
  
  // Block Eden API Key
  blockEdenKey: process.env.BLOCK_EDEN_KEY || "yoWczNougaeiUqV41Y96",
  
  // Firebase Configuration (Optional)
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }
};

// Validation
if (!config.ethPrivateKey) {
  console.warn("⚠️  ETH_PRIVATE_KEY not set. Relayer may not function properly.");
}

if (!config.suiPrivateKey) {
  console.warn("⚠️  SUI_PRIVATE_KEY not set. Relayer may not function properly.");
}

export default config;
