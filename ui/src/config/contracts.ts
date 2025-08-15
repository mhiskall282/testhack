// 🌐 Contract Configuration for Orbital Protocol
export const CONTRACTS = {
  // Ethereum (Avalanche Testnet)
  ETHEREUM: {
    RPC_URL: import.meta.env.VITE_ETH_RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc",
    CHAIN_ID: parseInt(import.meta.env.VITE_ETH_CHAIN_ID || "43113"),
    EXPLORER: import.meta.env.VITE_ETH_EXPLORER || "https://testnet.snowtrace.io",
    
    // Contract Addresses (Updated from new deployment)
    ORBITAL: import.meta.env.VITE_ORBITAL_CONTRACT || "0xE580dF77F7Bee058f640F56c0111F80f5D3df60E",
    PRICE_FEEDS: import.meta.env.VITE_PRICE_FEEDS_CONTRACT || "0x03f6dbAA4966c689Ff6138284b826d950eA6209C",
    FUD_TOKEN: import.meta.env.VITE_FUD_TOKEN || "0x95dBbcDC215407e039997589f5839dEB58827F49",
    USDT_TOKEN: import.meta.env.VITE_USDT_TOKEN || "0xac8D0593eAF1527D89343CDE8Aa46ec261D09EA4",
    ADDRESS_TO_BYTES32_LIB: import.meta.env.VITE_ADDRESS_TO_BYTES32_LIB || "0x3e3708c7Bb350FF479823F565f7FF300a48cE388",
  },

  // Sui
  SUI: {
    RPC_URL: import.meta.env.VITE_SUI_RPC_URL || "https://fullnode.testnet.sui.io:443",
    CHAIN_ID: parseInt(import.meta.env.VITE_SUI_CHAIN_ID || "21"),
    EXPLORER: import.meta.env.VITE_SUI_EXPLORER || "https://suiexplorer.com/txblock",
    
    // Package IDs (Updated from new deployment)
    ORBITAL_PACKAGE: import.meta.env.VITE_ORBITAL_PACKAGE_ID || "0x90dc37f06e229842249b1916073ee81d2025149b9f53f30cff1a48ce5e0c8f3d",
    FAUCET_PACKAGE: import.meta.env.VITE_FAUCET_PACKAGE_ID || "0x715d18ef2a6b5d101de8e4a005d01fe14c99f2b38d1672c77c18ad52714544f8",
  },

  // Wormhole
  WORMHOLE: {
    BRIDGE: import.meta.env.VITE_WORMHOLE_BRIDGE || "0x7bbcE28e64B3F8b84d876Ab298393c38ad7aac4C",
    CHAIN_ID_AVAX: parseInt(import.meta.env.VITE_WORMHOLE_CHAIN_ID_AVAX || "6"),
    CHAIN_ID_SUI: parseInt(import.meta.env.VITE_WORMHOLE_CHAIN_ID_SUI || "21"),
  },

  // App
  APP: {
    NAME: import.meta.env.VITE_APP_NAME || "Orbital Protocol",
    DESCRIPTION: import.meta.env.VITE_APP_DESCRIPTION || "Cross-chain lending protocol",
    VERSION: import.meta.env.VITE_APP_VERSION || "1.0.0",
  }
};

// 🔧 Network Configuration
export const NETWORKS = {
  AVALANCHE_TESTNET: {
    name: "Avalanche Testnet",
    chainId: CONTRACTS.ETHEREUM.CHAIN_ID,
    rpcUrl: CONTRACTS.ETHEREUM.RPC_URL,
    explorer: CONTRACTS.ETHEREUM.EXPLORER,
    nativeCurrency: {
      name: "AVAX",
      symbol: "AVAX",
      decimals: 18,
    },
  },
  
  SUI_TESTNET: {
    name: "Sui Testnet",
    chainId: CONTRACTS.SUI.CHAIN_ID,
    rpcUrl: CONTRACTS.SUI.RPC_URL,
    explorer: CONTRACTS.SUI.EXPLORER,
    nativeCurrency: {
      name: "SUI",
      symbol: "SUI",
      decimals: 9,
    },
  },
};

// 🎯 Default Configuration
export const DEFAULT_CONFIG = {
  DEFAULT_CHAIN: CONTRACTS.ETHEREUM.CHAIN_ID,
  DEFAULT_TOKEN: CONTRACTS.ETHEREUM.USDT_TOKEN,
  GAS_LIMIT: 300000,
  GAS_PRICE: "auto",
};

export default CONTRACTS;
