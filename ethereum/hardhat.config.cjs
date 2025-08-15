require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const MNEMONIC = process.env.MNEMONIC || "cabbage offer wonder actual thing kind output twin oval quiz never screen";
const SCAN_API_KEY = process.env.SCAN_API_KEY || "dummy_key";

module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
      viaIR: true
    },
  },
  networks: {
    avalanche: {
      url: `https://api.avax-test.network/ext/bc/C/rpc`,
      chainId: 43113,
      accounts: {
        mnemonic: MNEMONIC,
        initialIndex: 0,
      },
    },
  },
  etherscan: {
    apiKey: {
      avalanche: SCAN_API_KEY || "dummy_key",
    },
    customChains: [
      {
        network: 'avalanche',
        chainId: 43113,
        urls: {
          apiURL: 'https://api.routescan.io/v2/network/testnet/evm/43113/etherscan/api',
          browserURL: 'https://testnet.snowtrace.io/',
        },
      },
    ],
  },
  sourcify: {
    enabled: true,
  },
};
