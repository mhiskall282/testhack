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

(async function main() {
    // initialize relayer engine app, pass relevant config options
    const app = new StandardRelayerApp<StandardRelayerContext>(
        Environment.TESTNET,
        {
            name: config.relayerName,
            missedVaaOptions: {
                startingSequenceConfig: {
                    '21': BigInt(1), /* sui */
                    '6': BigInt(1) /* avalanche */
                }
            },
            spyEndpoint: config.spyHost,
            redis: {
                host: config.redisHost
            }
        },
    );

    // add a filter with a callback that will be
    // invoked on finding a VAA that matches the filter
    app.multiple(
        {
            [CHAIN_ID_SUI]: config.orbitalSuiEmitter,
            [CHAIN_ID_AVAX]: config.orbitalAvax
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
                if (hexPayload.startsWith(removeTrailingZeros(config.onBorrowMethod))) {
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
                if (hexPayload.startsWith(removeTrailingZeros(config.onRepayMethod))) {
                    const params = parseSuiOnRepayHex(hexPayload);

                    const tx = await signOnRepayTransactionOnEth(
                        vaa.nonce,
                        params.loanId
                    );

                    console.log('⚡Trx hash: ', tx);

                    return;
                }
            } else if (vaa?.emitterChain == CHAIN_ID_AVAX) {
                const web3 = new Web3();

                // @dev Get the VAA method.
                if (hexPayload.startsWith(removeTrailingZeros(config.onBorrowMethod))) {
                    const params = web3.eth.abi.decodeParameters(
                        ['bytes32', 'bytes32', 'bytes32', 'bytes32', 'uint16', 'bytes32', 'bytes32', 'bytes32', 'uint256'],
                        hexPayload
                    );

                    const tx = await signOnBorrowTransactionOnSui(
                        vaa.nonce,
                        params[3], // receiver
                        params[1], // loanId
                        CHAIN_ID_AVAX,
                        params[8], // loan value
                        getDefaultSUICoinOutType(), // tokenOut
                        sourceTxHash
                    );

                    console.log('⚡Trx hash: ', tx);

                    return;
                }

                // @dev Get the VAA method.
                if (hexPayload.startsWith(removeTrailingZeros(config.onRepayMethod))) {
                    const params = web3.eth.abi.decodeParameters(
                        ['bytes32', 'bytes32', 'uint16', 'bytes32', 'bytes32'],
                        hexPayload
                    );

                    const tx = await signOnRepayTransactionOnSui(
                        vaa.nonce,
                        params[1],
                        getDefaultSUICoinInType()
                    );

                    console.log('⚡Trx hash: ', tx);

                    return;
                }
            } else {
                console.error('Undefined emiitter id');
            }
        },
    );

    // add and configure any other middleware ..
    // start app, blocks until unrecoverable error or process is stopped
    await app.listen();
})();

(function server(): void {
    // use hostname 127.0.0.1 unless there exists a preconfigured port
    const hostname = process.env.HOST || '127.0.0.1';

    // use port 3000 unless there exists a preconfigured port
    const port = process.env.PORT || 3000;

    http.createServer(function (request: any, response: any) {
        const headers = {
            'Access-Control-Allow-Origin': '*', /* @dev First, read about security */
            'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
            'Access-Control-Max-Age': 2592000, /* 30 days */
            'Content-Type': 'application/json'
        };

        if (request.method === 'OPTIONS') {
            response.writeHead(204, headers);
            response.end();
            return;
        }

        if (['GET', 'POST'].indexOf(request.method!!) > -1) {
            response.writeHead(200, headers);
            response.end(JSON.stringify({ 'status': "OK" }), 'utf-8');
            return;
        }

        response.writeHead(405, headers);
        response.end(`${request.method} is not allowed for the request.`);
    }).listen(port);

    console.log(`[server]: Server running at http://${hostname}:${port}`);
    console.log('spy', config.spyHost);

})();

// SUI DEPS //

const state: string = "0xfb27fa6eac7fa42133e8c414cd066175ffecff49d4343306a0db7a4b1ac61082";
const ownerCap: string = "0xdf170db1a8fa28aa9840f18e307778bb038f74f91f1d1b6ec82001cc8454b2af";
const theClock: string = "0x0000000000000000000000000000000000000000000000000000000000000006";
const faucet = "0xae28fd09dc8df11e5b3a1d3389723cd9469988944661e708f6ddf4fb2f1fd644";

// SUI TRANSACTIONS //

async function signOnBorrowTransactionOnSui(
    nonce: number,
    receiver: string,
    loanId: string,
    fromChainId: number,
    coinOutValue: number,
    coinOutType: string,
    txHash: string
): Promise<string | null> {
    // const rpcUrl = getFullnodeUrl('testnet');
    const rpcUrl = `https://api.blockeden.xyz/sui/testnet/${config.blockEdenKey}`;

    const client = new SuiClient({ url: rpcUrl });

    try {
        const txb = new TransactionBlock();

        txb.moveCall({
            target: `${config.orbitalSui}::orbital::receive_on_borrow`,
            arguments: [
                txb.object(ownerCap),
                txb.object(state),
                txb.pure.u32(nonce),
                txb.pure(bcs.vector(bcs.u8()).serialize(hexToUint8Array(loanId))),
                txb.pure.u16(fromChainId),
                txb.pure.address(receiver),
                txb.pure.u128(coinOutValue),
                txb.object(theClock)
            ],
            typeArguments: [coinOutType]
        });

        txb.setGasBudget(50_000_000);

        // create signer object from private key.
        const keypair = Ed25519Keypair.deriveKeypair(
            config.suiPrivateKey
        );

        const { digest, effects } = await client.signAndExecuteTransactionBlock(
            { signer: keypair, transactionBlock: txb, options: { showEffects: true } }
        );

        if (effects && effects.created) {
            for (let index = 0; index < effects.created.length; index++) {
                const created = effects.created[index];
                const owner: any = created.owner;

                if ('Shared' in owner && 'initial_shared_version' in owner.Shared) {
                    const newLoanId = created.reference.objectId;

                    const data = { loanId: newLoanId };

                    // TODO: Add loan tracking logic here
                    console.log('New loan created:', newLoanId);

                    break;
                }
            }
        }

        await client.waitForTransactionBlock({ digest });

        return digest;
    } catch (error) {
        console.error('Transaction: ', error);

        return null;
    }
}

async function signOnRepayTransactionOnSui(
    nonce: number,
    loan: string,
    coinInType: string
): Promise<string | null> {
    // const rpcUrl = getFullnodeUrl('testnet');
    const rpcUrl = `https://api.blockeden.xyz/sui/testnet/${config.blockEdenKey}`;

    const client = new SuiClient({ url: rpcUrl });

    try {
        const txb = new TransactionBlock();

        txb.moveCall({
            target: `${config.orbitalSui}::orbital::receive_on_repay`,
            arguments: [
                txb.object(ownerCap),
                txb.object(state),
                txb.pure(nonce),
                txb.object(loan)
            ],
            typeArguments: [coinInType]
        });

        txb.setGasBudget(50_000_000);

        // create signer object from private key.
        const keypair = Ed25519Keypair.deriveKeypair(
            config.suiPrivateKey
        );

        const result = await client.signAndExecuteTransactionBlock(
            { signer: keypair, transactionBlock: txb }
        );

        return result.digest;
    } catch (error) {
        console.error('Transaction: ', error);

        return null;
    }
}

// ETHEREUM TRANSACTIONS //

async function signOnBorrowTransactionOnEth(
    nonce: number,
    loanId: string,
    receiver: string,
    fromChainId: number,
    fromContractId: string,
    tokenIn: string,
    tokenOut: string,
    value: string,
    txHash: string
) {
    const data = { loanId };

    // TODO: Add loan tracking logic here
    console.log('Loan data:', data);

    const web3 = new Web3(config.ethRpcUrl);

    const orbital = new web3.eth.Contract(ethOrbitalAbi as any, config.orbitalAvax);

    // create signer object from private key.
    const ethSigner = web3.eth.accounts.privateKeyToAccount(
        config.ethPrivateKey
    );

    // add signer to web3.
    web3.eth.accounts.wallet.add(ethSigner);

    try {
        // estimate base eth gas fee.
        const gas = await orbital.methods.receiveOnBorrow(
            nonce,
            loanId,
            receiver,
            fromChainId,
            fromContractId,
            tokenIn,
            tokenOut,
            value
        ).estimateGas({ from: ethSigner.address });

        // get base eth gas price.
        const gasPrice = await web3.eth.getGasPrice();

        // call the transaction.
        const { transactionHash } = await orbital.methods.receiveOnBorrow(
            nonce,
            loanId,
            receiver,
            fromChainId,
            fromContractId,
            tokenIn,
            tokenOut,
            value
        ).send({
            from: ethSigner.address,
            gasPrice: gasPrice.toString(),
            gas: gas.toString()
        });

        return transactionHash;
    } catch (error) {
        console.error('Transaction: ', error);

        return null;
    }
}

async function signOnRepayTransactionOnEth(
    nonce: number,
    loanId: string
) {
    const web3 = new Web3(config.ethRpcUrl);

    const orbital = new web3.eth.Contract(ethOrbitalAbi as any, config.orbitalAvax);

    // create signer object from private key.
    const ethSigner = web3.eth.accounts.privateKeyToAccount(
        config.ethPrivateKey
    );

    // add signer to web3.
    web3.eth.accounts.wallet.add(ethSigner);

    try {
        // estimate base eth gas fee.
        const gas = await orbital.methods.receiveOnRepay(
            nonce,
            loanId
        ).estimateGas({ from: ethSigner.address });

        // get base eth gas price.
        const gasPrice = await web3.eth.getGasPrice();

        // call the transaction.
        const { transactionHash } = await orbital.methods.receiveOnRepay(
            nonce,
            loanId
        ).send({
            from: ethSigner.address,
            gasPrice: gasPrice.toString(),
            gas: gas.toString()
        });

        return transactionHash;
    } catch (error) {
        console.error('Transaction: ', error);

        return null;
    }
}

// Extraction methods //

function getDefaultSUICoinInType(): string {
    return `${faucet}::usdt::USDT`;
}

function getDefaultSUICoinOutType(): string {
    return `${faucet}::fud::FUD`;
}

function getDefaultEthTokenIn(): string {
    return addressToBytes32("0xac8D0593eAF1527D89343CDE8Aa46ec261D09EA4"); // Updated USDT address
}

function getDefaultEthTokenOut(): string {
    return addressToBytes32("0x95dBbcDC215407e039997589f5839dEB58827F49"); // Updated FUD address
}

function addressToBytes32(address: string): string {
    // Remove the '0x' prefix if present
    const strippedAddress = address.startsWith('0x') ? address.slice(2) : address;

    // Pad the address with leading zeros to ensure it is 32 bytes long
    const paddedAddress = strippedAddress.padStart(64, '0');

    // Add the '0x' prefix back
    return '0x' + paddedAddress;
}

function hexToUint8Array(hex: string): number[] {
    // Ensure the hex string is valid
    if (typeof hex !== 'string') {
        throw new TypeError('Expected input to be a string');
    }

    // Remove any potential leading "0x"
    if (hex.startsWith('0x')) {
        hex = hex.slice(2);
    }

    // Check if the length of the string is even
    if (hex.length % 2 !== 0) {
        throw new Error('Hex string must have an even number of characters');
    }

    // Create a Uint8Array
    const byteArray = new Uint8Array(hex.length / 2);

    for (let i = 0; i < hex.length; i += 2) {
        byteArray[i / 2] = parseInt(hex.substr(i, 2), 16);
    }

    const numberArray: number[] = [];

    for (let i = 0; i < byteArray.length; i++) {
        if (byteArray[i] > 0) {
            numberArray.push(byteArray[i]);
        }
    }

    return numberArray;
}

function removeTrailingZeros(bytes32: string): string {
    // Ensure the input starts with '0x' and is 66 characters long (including '0x')
    if (!bytes32.startsWith('0x') || bytes32.length !== 66) {
        throw new Error('Invalid bytes32 format or length');
    }

    // Remove the '0x' prefix
    let hexData = bytes32.slice(2);

    // Remove trailing zeros
    hexData = hexData.replace(/0+$/, '');

    // Add the '0x' prefix back
    return '0x' + hexData;
}