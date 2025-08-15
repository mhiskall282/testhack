import Web3 from 'web3';
import {
    Environment,
    StandardRelayerApp,
    StandardRelayerContext,
} from "@wormhole-foundation/relayer-engine";
import { CHAIN_ID_SUI, CHAIN_ID_AVAX } from "@certusone/wormhole-sdk";

import { bcs } from '@mysten/bcs';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { getFullnodeUrl, SuiClient } from '@mysten/sui.js/client';

import http from 'http';
import { parseSuiOnBorrowHex } from "./utils/sui_on_borrow_parser";
import { parseSuiOnRepayHex } from "./utils/sui_on_repay_parser";

// Import configuration
import config from './config';

// Ethereum contract abi //
import ethOrbitalAbi from "./abis/ethereum/orbital.json";

// Configuration constants
const LOAN_COLLECTION = "loans";

// Cloud configuration overrides
const cloudConfig = {
    ...config,
    // Override Redis host for cloud - prioritize Upstash
    redisHost: process.env.UPSTASH_REDIS_URL || process.env.REDIS_CLOUD_URL || config.redisHost,
    // Override spy host for public endpoint - try multiple endpoints
    spyHost: process.env.SPY_HOST || "https://wormhole-v2-testnet-api.certus.one",
};

// Helper function to parse Redis connection details safely
function parseRedisConnection(redisUrl: string): { host: string; port: number; password?: string } {
    try {
        if (redisUrl.includes('upstash')) {
            // Handle Upstash Redis URL format: redis://default:password@host:port
            const url = new URL(redisUrl);
            const host = url.hostname;
            const port = parseInt(url.port) || 6379;
            const password = url.password;
            
            return { host, port, password };
        } else {
            // Handle standard Redis URL format
            const parts = redisUrl.replace('redis://', '').split('@');
            if (parts.length === 2) {
                // Format: username:password@host:port
                const [auth, hostPort] = parts;
                const [username, password] = auth.split(':');
                const [host, portStr] = hostPort.split(':');
                const port = parseInt(portStr) || 6379;
                
                return { host, port, password };
            } else {
                // Format: host:port
                const [host, portStr] = redisUrl.replace('redis://', '').split(':');
                const port = parseInt(portStr) || 6379;
                
                return { host, port };
            }
        }
    } catch (error) {
        console.warn('⚠️ Failed to parse Redis URL, using defaults:', error);
        return { host: 'localhost', port: 6379 };
    }
}

// Fallback Wormhole endpoints if primary fails
const wormholeEndpoints = [
    "https://testnet.query.wormhole.com",
    "https://wormhole-v2-testnet-api.certus.one",
    "https://api.testnet.wormhole.com",
    "https://wormhole-testnet-api.stability.one",
    "https://wormhole-testnet-api.certus.one:7073",
    "https://wormhole-testnet-api.certus.one:8080"
];

// Function to test Wormhole endpoint connectivity
async function testWormholeEndpoint(endpoint: string): Promise<boolean> {
    try {
        // Try a simple GET request to the root endpoint
        const response = await fetch(endpoint, { 
            method: 'GET'
        });
        return response.status < 500; // Accept any response that's not a server error
    } catch (error: any) {
        console.log(`❌ Endpoint ${endpoint} failed:`, error.message || 'Unknown error');
        return false;
    }
}

// Function to find working Wormhole endpoint
async function findWorkingEndpoint(): Promise<string> {
    console.log("🔍 Testing Wormhole endpoints...");
    
    for (const endpoint of wormholeEndpoints) {
        console.log(`🧪 Testing: ${endpoint}`);
        if (await testWormholeEndpoint(endpoint)) {
            console.log(`✅ Found working endpoint: ${endpoint}`);
            return endpoint;
        }
    }
    
    console.log("⚠️ All endpoints failed health checks, but will try to use default");
    console.log("💡 This is normal for testnet endpoints - relayer will retry connections");
    return wormholeEndpoints[0];
}

// Function to test Redis connection
async function testRedisConnection(): Promise<void> {
    try {
        // Use Upstash REST client if available
        if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
            const { Redis } = require('@upstash/redis');
            
            const redis = new Redis({
                url: process.env.UPSTASH_REDIS_REST_URL,
                token: process.env.UPSTASH_REDIS_REST_TOKEN,
            });
            
            // Test connection with a simple operation
            await redis.set('test_connection', 'success');
            const result = await redis.get('test_connection');
            await redis.del('test_connection');
            
            if (result === 'success') {
                console.log("✅ Upstash Redis REST connection successful!");
                return;
            } else {
                throw new Error('Redis test operation failed');
            }
        } else {
            // Fallback to traditional Redis connection
            const Redis = require('ioredis');
            
            // Use the same parsing logic
            const redisConfig = parseRedisConnection(cloudConfig.redisHost);
            
            const redis = new Redis({
                ...redisConfig,
                maxRetriesPerRequest: 5,
                connectTimeout: 20000, // Increased timeout
                lazyConnect: true,
                enableOfflineQueue: true,
                enableReadyCheck: false,
            });
            
            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    redis.disconnect();
                    reject(new Error('Redis connection timeout after 20 seconds'));
                }, 20000);
                
                redis.on('connect', () => {
                    clearTimeout(timeout);
                    redis.disconnect();
                    resolve();
                });
                
                redis.on('error', (error: any) => {
                    clearTimeout(timeout);
                    redis.disconnect();
                    reject(new Error(`Redis connection failed: ${error.message}`));
                });
                
                redis.on('timeout', () => {
                    clearTimeout(timeout);
                    redis.disconnect();
                    reject(new Error('Redis connection timeout'));
                });
                
                redis.connect();
            });
        }
    } catch (error: any) {
        throw new Error(`Redis connection test failed: ${error.message}`);
    }
}

// Function to start relayer with retry logic
async function startRelayer(attempt: number = 1): Promise<void> {
    const maxAttempts = 5;
    const retryDelay = 5000; // 5 seconds
    
    try {
        console.log(`🚀 Starting Cloud Relayer... (Attempt ${attempt}/${maxAttempts})`);
        
        // Find working Wormhole endpoint
        const workingEndpoint = await findWorkingEndpoint();
        cloudConfig.spyHost = workingEndpoint;
        
        console.log(`🔗 Wormhole Guardian: ${cloudConfig.spyHost}`);
        console.log(`🗄️  Redis: ${cloudConfig.redisHost}`);
        
        // Test Redis connection before starting relayer
        console.log("🧪 Testing Redis connection...");
        let redisAvailable = false;
        
        try {
            await testRedisConnection();
            console.log("✅ Redis connection successful!");
            redisAvailable = true;
        } catch (error: any) {
            console.warn("⚠️ Redis connection failed:", error.message);
            console.log("💡 Continuing without Redis - some features may be limited");
            redisAvailable = false;
        }
        
        // initialize relayer engine app, pass relevant config options
        const app = new StandardRelayerApp<StandardRelayerContext>(
            Environment.TESTNET,
            {
                name: cloudConfig.relayerName,
                missedVaaOptions: {
                    startingSequenceConfig: {
                        '21': BigInt(1), /* sui */
                        '6': BigInt(1) /* avalanche */
                    }
                },
                spyEndpoint: cloudConfig.spyHost,
                redis: redisAvailable ? (() => {
                    const redisConfig = parseRedisConnection(cloudConfig.redisHost);
                    return {
                        ...redisConfig,
                        maxRetriesPerRequest: 10,
                        connectTimeout: 30000,
                        lazyConnect: true,
                        enableOfflineQueue: true,
                        enableReadyCheck: false,
                    };
                })() : undefined
            },
        );

        // add a filter with a callback that will be
        // invoked on finding a VAA that matches the filter
        app.multiple(
            {
                [CHAIN_ID_SUI]: cloudConfig.orbitalSuiEmitter,
                [CHAIN_ID_AVAX]: cloudConfig.orbitalAvax
            },
            async (ctx) => {
                const vaa = ctx.vaa;

                // Check if VAA has a payload.
                if (!vaa?.payload) {
                    console.log('Not payload was sent: ', vaa);
                    return;
                }
                // Parse payload to HEX format.
                const hexPayload = '0x' + vaa?.payload.toString('hex');
                const sourceTxHash = ctx.sourceTxHash!;

                console.log('⚡[new vaa]: ', hexPayload);

                // Check for emitter chain.
                if (vaa?.emitterChain == CHAIN_ID_SUI) {
                    // @dev Get the VAA method.
                    if (hexPayload.startsWith(removeTrailingZeros(cloudConfig.onBorrowMethod))) {
                        const params = parseSuiOnBorrowHex(hexPayload);

                        const tx = await signOnBorrowTransactionOnEth(
                            vaa.nonce,
                            params.loanId,
                            params.receiver,
                            CHAIN_ID_SUI,
                            params.fromContractId,
                            getDefaultEthTokenIn(),
                            getDefaultEthTokenOut(),
                            params.coinInValue,
                            sourceTxHash
                        );

                        console.log('⚡Trx hash: ', tx);
                        return;
                    }

                    // @dev Get the VAA method.
                    if (hexPayload.startsWith(removeTrailingZeros(cloudConfig.onRepayMethod))) {
                        const params = parseSuiOnRepayHex(hexPayload);

                        const tx = await signOnRepayTransactionOnEth(
                            vaa.nonce,
                            params.loanId
                        );

                        console.log('⚡Trx hash: ', tx);
                        return;
                    }
                }
            }
        );

        // Start the relayer
        await app.listen();
        console.log("✅ Cloud Relayer started successfully!");

    } catch (error) {
        console.error(`❌ Failed to start Cloud Relayer (Attempt ${attempt}):`, error);
        
        if (attempt < maxAttempts) {
            console.log(`🔄 Retrying in ${retryDelay/1000} seconds... (${attempt}/${maxAttempts})`);
            console.log("💡 This might be due to temporary network issues or Redis being busy");
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            return startRelayer(attempt + 1);
        } else {
            console.error("❌ Max retry attempts reached. Relayer failed to start.");
            console.log("\n💡 Troubleshooting:");
            console.log("1. Check your .env file has correct Redis credentials");
            console.log("2. Ensure Redis Cloud is accessible from Railway");
            console.log("3. Verify your private keys are set");
            console.log("4. Check Railway logs for more details");
            console.log("5. Try restarting the Railway deployment");
            console.log("6. Consider using Upstash Redis as an alternative");
            
            // Exit gracefully
            process.exit(1);
        }
    }
}

// Main execution
(async function main() {
    try {
        await startRelayer();
    } catch (error) {
        console.error("❌ Fatal error in main:", error);
        process.exit(1);
    }
})();

// Helper functions (copied from your existing relayer)
function removeTrailingZeros(hexString: string): string {
    return hexString.replace(/0+$/, '');
}

function addressToBytes32(address: string): string {
    return '0x000000000000000000000000' + address.slice(2);
}

function getDefaultEthTokenIn(): string {
    return addressToBytes32("0xac8D0593eAF1527D89343CDE8Aa46ec261D09EA4"); // Updated USDT address
}

function getDefaultEthTokenOut(): string {
    return addressToBytes32("0x95dBbcDC215407e039997589f5839dEB58827F49"); // Updated FUD address
}

async function signOnBorrowTransactionOnEth(
    nonce: number,
    loanId: string,
    receiver: string,
    sourceChain: number,
    fromContractId: string,
    tokenIn: string,
    tokenOut: string,
    coinInValue: string,
    sourceTxHash: string
): Promise<string> {
    try {
        const web3 = new Web3(cloudConfig.ethRpcUrl);

        const orbital = new web3.eth.Contract(ethOrbitalAbi as any, cloudConfig.orbitalAvax);

        // create signer object from private key.
        const ethSigner = web3.eth.accounts.privateKeyToAccount(
            cloudConfig.ethPrivateKey
        );

        const gasEstimate = await orbital.methods
            .onBorrow(
                nonce,
                loanId,
                receiver,
                sourceChain,
                fromContractId,
                tokenIn,
                tokenOut,
                coinInValue,
                sourceTxHash
            )
            .estimateGas({ from: ethSigner.address });

        const tx = await orbital.methods
            .onBorrow(
                nonce,
                loanId,
                receiver,
                sourceChain,
                fromContractId,
                tokenIn,
                tokenOut,
                coinInValue,
                sourceTxHash
            )
            .send({
                from: ethSigner.address,
                gas: Math.floor(Number(gasEstimate) * 1.2),
            });

        return tx.transactionHash;
    } catch (error) {
        console.error('Error signing onBorrow transaction:', error);
        throw error;
    }
}

async function signOnRepayTransactionOnEth(
    nonce: number,
    loanId: string
): Promise<string> {
    try {
        const web3 = new Web3(cloudConfig.ethRpcUrl);

        const orbital = new web3.eth.Contract(ethOrbitalAbi as any, cloudConfig.orbitalAvax);

        // create signer object from private key.
        const ethSigner = web3.eth.accounts.privateKeyToAccount(
            cloudConfig.ethPrivateKey
        );

        const gasEstimate = await orbital.methods
            .onRepay(nonce, loanId)
            .estimateGas({ from: ethSigner.address });

        const tx = await orbital.methods
            .onRepay(nonce, loanId)
            .send({
                from: ethSigner.address,
                gas: Math.floor(Number(gasEstimate) * 1.2),
            });

        return tx.transactionHash;
    } catch (error) {
        console.error('Error signing onRepay transaction:', error);
        throw error;
    }
}
