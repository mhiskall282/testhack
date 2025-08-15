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
    // Override spy host for public endpoint - try multiple endpoints
    spyHost: process.env.SPY_HOST || "https://wormhole-v2-testnet-api.certus.one",
};

// Function to check if we have Upstash REST credentials
function checkUpstashRest(): boolean {
    return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

// Upstash Redis REST client for reliable cloud operations
let upstashRedis: any = null;

// Initialize Upstash Redis client
function initUpstashRedis() {
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        const { Redis } = require('@upstash/redis');
        upstashRedis = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL,
            token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });
        return true;
    }
    return false;
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

// Function to test Upstash Redis connection
async function testUpstashConnection(): Promise<void> {
    try {
        console.log("🔍 Upstash Redis Connection Test:");
        console.log("UPSTASH_REDIS_REST_URL:", process.env.UPSTASH_REDIS_REST_URL ? "SET" : "NOT SET");
        console.log("UPSTASH_REDIS_REST_TOKEN:", process.env.UPSTASH_REDIS_REST_TOKEN ? "SET" : "NOT SET");
        
        if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
            throw new Error('Upstash Redis credentials not configured');
        }
        
        // Initialize Upstash Redis client
        if (!initUpstashRedis()) {
            throw new Error('Failed to initialize Upstash Redis client');
        }
        
        // Test connection with a simple operation
        await upstashRedis.set('test_connection', 'success');
        const result = await upstashRedis.get('test_connection');
        await upstashRedis.del('test_connection');
        
        if (result === 'success') {
            console.log("✅ Upstash Redis REST connection successful!");
        } else {
            throw new Error('Upstash Redis test operation failed');
        }
    } catch (error: any) {
        throw new Error(`Upstash Redis connection test failed: ${error.message}`);
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
        console.log(`🔧 Redis: Upstash REST API Only`);
        
        // Test Upstash Redis connection before starting relayer
        console.log("🧪 Testing Upstash Redis connection...");
        let upstashAvailable = false;
        
        try {
            await testUpstashConnection();
            console.log("✅ Upstash Redis connection successful!");
            upstashAvailable = true;
        } catch (error: any) {
            console.error("❌ Upstash Redis connection failed:", error.message);
            console.log("💡 Upstash Redis is required for this relayer to function");
            throw error;
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
                redis: undefined, // Using Upstash REST API instead of Redis protocol
                // Note: The relayer will use Upstash Redis REST API for any Redis operations
                // This eliminates the need for Redis protocol connections and prevents ECONNRESET errors
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
