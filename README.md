# 🚀 Orbital Protocol - Cross-Chain Lending Platform

> **Built for Sui Overflow Hackathon 2024** 🏆

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/mhiskall282/testhack)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🌟 **What is Orbital Protocol?**

**Orbital** is a revolutionary **cross-chain lending protocol** that enables seamless borrowing and lending between **Ethereum (Avalanche)** and **Sui** blockchains using **Wormhole's cross-chain messaging** and **Supra Oracle's price feeds**.

Think of it as a **DeFi bridge** that lets you:
- 🏦 **Borrow assets** on one chain using collateral from another
- 💰 **Access liquidity** across multiple blockchains
- ⚡ **Execute flash loans** with cross-chain arbitrage opportunities
- 🔗 **Bridge assets** without traditional bridge complexity

## 🎯 **Hackathon Innovation**

### **Why This is Revolutionary**
- **First-of-its-kind**: True cross-chain lending protocol on Sui
- **Wormhole Integration**: Leverages battle-tested cross-chain infrastructure
- **Supra Oracle**: Real-time price feeds for accurate collateral valuation
- **User Experience**: Seamless cross-chain operations in one interface

### **Technical Achievements**
- ✅ **Smart Contracts**: Deployed on Avalanche Testnet
- ✅ **Sui Move**: Native Sui blockchain integration
- ✅ **Cross-Chain Messaging**: Wormhole VAA processing
- ✅ **Real-time UI**: Vue.js frontend with wallet integration
- ✅ **Relayer Service**: Automated cross-chain transaction processing

## 🏗️ **Architecture Overview**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Ethereum      │    │   Wormhole      │    │      Sui        │
│  (Avalanche)    │◄──►│   Network       │◄──►│   Blockchain    │
│                 │    │                 │    │                 │
│ • Orbital       │    │ • VAA Messages  │    │ • Orbital       │
│ • PriceFeeds    │    │ • Cross-chain   │    │ • Faucet        │
│ • FUD/USDT      │    │ • Validation    │    │ • Move Modules  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend UI   │    │   Relayer       │    │   Supra Oracle  │
│   (Vue.js)      │    │   Service       │    │   Price Feeds   │
│                 │    │                 │    │                 │
│ • Wallet Connect│    │ • VAA Processing│    │ • Real-time     │
│ • Cross-chain   │    │ • Transaction   │    │ • Price Data    │
│ • Operations    │    │ • Relay         │    │ • Validation    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 **Key Features**

### **Cross-Chain Lending**
- **Borrow**: Get loans on Ethereum using Sui collateral
- **Lend**: Provide liquidity across multiple chains
- **Collateral**: Multi-chain asset support
- **Interest**: Dynamic rates based on utilization

### **Flash Loans**
- **Arbitrage**: Cross-chain price differences
- **Liquidation**: Automated debt settlement
- **Trading**: Quick asset swaps
- **Yield Farming**: Multi-chain strategies

### **Smart Infrastructure**
- **Wormhole Integration**: Secure cross-chain messaging
- **Supra Oracle**: Real-time price validation
- **Automated Relayer**: Seamless transaction processing
- **Multi-Wallet Support**: Sui, MetaMask, WalletConnect

## 🛠️ **Technology Stack**

### **Blockchain**
- **Ethereum**: Solidity smart contracts on Avalanche testnet
- **Sui**: Move language smart contracts
- **Wormhole**: Cross-chain messaging protocol
- **Supra Oracle**: Decentralized price feeds

### **Frontend**
- **Vue.js 3**: Modern reactive framework
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool
- **Tailwind CSS**: Utility-first styling

### **Backend**
- **Node.js**: Relayer service runtime
- **TypeScript**: Type-safe backend code
- **Redis**: Message queuing and caching
- **Web3.js**: Ethereum interaction

### **Infrastructure**
- **Vercel**: Frontend and backend hosting
- **GitHub Actions**: CI/CD automation
- **Docker**: Local development containers

## 📁 **Project Structure**

```
orbital-protocol/
├── 📁 ethereum/           # Ethereum smart contracts
│   ├── contracts/         # Solidity contracts
│   ├── ignition/          # Hardhat deployment
│   └── scripts/           # Deployment scripts
├── 📁 sui/                # Sui Move contracts
│   ├── orbital/           # Main lending protocol
│   ├── faucet/            # Test token faucet
│   └── Move.toml          # Package configuration
├── 📁 ui/                 # Frontend application
│   ├── src/               # Vue.js source code
│   ├── components/        # Reusable components
│   └── views/             # Page components
├── 📁 relayer/            # Cross-chain relay service
│   ├── src/               # TypeScript source
│   ├── config/            # Configuration files
│   └── abis/              # Contract ABIs
└── 📁 docs/               # Documentation
```

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+
- Sui CLI
- MetaMask or Sui wallet
- Testnet tokens (AVAX, SUI)

### **1. Clone Repository**
```bash
git clone https://github.com/mhiskall282/testhack.git
cd testhack
```

### **2. Setup Ethereum Contracts**
```bash
cd ethereum
npm install
npm run compile
npm run deploy
```

### **3. Setup Sui Contracts**
```bash
cd sui/orbital
sui move build
sui client publish --gas-budget 10000000
```

### **4. Run Relayer**
```bash
cd relayer
npm install
npm run build
npm start
```

### **5. Start Frontend**
```bash
cd ui
npm install
npm run dev
```

## 🌐 **Live Demo**

- **Frontend**: [orbital-protocol-ui.vercel.app](https://orbital-protocol-ui.vercel.app)
- **Relayer**: [orbital-protocol-relayer.vercel.app](https://orbital-protocol-relayer.vercel.app)
- **Ethereum**: [Avalanche Testnet](https://testnet.snowtrace.io)
- **Sui**: [Sui Testnet Explorer](https://suiexplorer.com)

## 🔗 **Contract Addresses**

### **Ethereum (Avalanche Testnet)**
- **Orbital**: `0xE580dF77F7Bee058f640F56c0111F80f5D3df60E`
- **PriceFeeds**: `0x03f6dbAA4966c689Ff6138284b826d950eA6209C`
- **FUD Token**: `0x95dBbcDC215407e039997589f5839dEB58827F49`
- **USDT Token**: `0xac8D0593eAF1527D89343CDE8Aa46ec261D09EA4`

### **Sui Testnet**
- **Orbital Package**: `0x90dc37f06e229842249b1916073ee81d2025149b9f53f30cff1a48ce5e0c8f3d`
- **Faucet Package**: `0x715d18ef2a6b5d101de8e4a005d01fe14c99f2b38d1672c77c18ad52714544f8`

## 🎯 **Use Cases**

### **For Users**
- **Cross-Chain Borrowing**: Access liquidity on any supported chain
- **Asset Diversification**: Spread risk across multiple blockchains
- **Arbitrage Opportunities**: Profit from cross-chain price differences
- **Flash Loan Strategies**: Execute complex DeFi strategies

### **For Developers**
- **Protocol Integration**: Build on top of cross-chain infrastructure
- **Cross-Chain dApps**: Create applications spanning multiple chains
- **Liquidity Provision**: Earn fees by providing cross-chain liquidity
- **Smart Contract Templates**: Reusable lending logic

## 🔒 **Security Features**

- **Wormhole Validation**: Multi-validator consensus
- **Price Oracle**: Real-time market data validation
- **Collateral Requirements**: Over-collateralized lending
- **Liquidation Mechanisms**: Automated risk management
- **Audit Ready**: Clean, documented smart contract code

## 🚧 **Development Status**

- ✅ **Smart Contracts**: Deployed and tested
- ✅ **Cross-Chain Messaging**: Wormhole integration complete
- ✅ **Frontend UI**: Vue.js application ready
- ✅ **Relayer Service**: Automated transaction processing
- 🔄 **Price Feeds**: Supra Oracle integration
- 🔄 **Mainnet**: Testnet deployment complete

## 🤝 **Contributing**

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### **Development Areas**
- **Smart Contract Audits**: Security reviews
- **Frontend Features**: UI/UX improvements
- **Testing**: Comprehensive test coverage
- **Documentation**: Code and user guides

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **Sui Foundation**: For the amazing Move language and blockchain
- **Wormhole**: Cross-chain messaging infrastructure
- **Supra Oracle**: Decentralized price feed solutions
- **Vercel**: Hosting and deployment platform
- **Sui Overflow Hackathon**: For the opportunity to build

## 📞 **Contact**

- **Developer**: [@mhiskall282](https://github.com/mhiskall282)
- **Project**: [Orbital Protocol](https://github.com/mhiskall282/testhack)
- **Email**: [devarogundade@gmail.com](mailto:devarogundade@gmail.com)

## 🌟 **Hackathon Impact**

**Orbital Protocol** represents the future of **decentralized finance** - a world where:
- **Liquidity flows freely** across blockchain boundaries
- **Users access financial services** regardless of their preferred chain
- **DeFi becomes truly universal** and accessible to everyone
- **Innovation happens** at the intersection of multiple ecosystems

---

**🚀 Built with ❤️ for the Sui Overflow Hackathon 2024**

*"Cross-chain lending is not just a feature - it's the future of DeFi"*