# Testing the Stellar NFT Marketplace SDK

This document provides guidance on how to test the TypeScript SDK for the Stellar NFT Marketplace.

## SDK Overview

The TypeScript SDK is located in the `src/sdk` directory and includes:

1. **nftClient.ts** - Main client for interacting with the Soroban smart contract
2. **walletConnect.ts** - Utilities for connecting to Stellar wallets (Freighter)
3. **utils.ts** - Helper functions for contract interactions, IPFS, etc.
4. **types.ts** - TypeScript type definitions

## Testing Prerequisites

Before testing:

1. Make sure you have the Freighter wallet extension installed in your browser
2. Ensure your Freighter wallet is connected to the Stellar Testnet
3. Have some test XLM in your wallet (you can get these from friendbot)

## Test Pages

We've created several test pages to verify SDK functionality:

1. **Home Page (`/`)** - Main marketplace view with listed NFTs
2. **SDK Test Page (`/test`)** - Test basic SDK initialization and configuration
3. **Mint Page (`/mint`)** - Test the NFT minting functionality

## Testing Without a Real Contract

To test without a deployed contract:

1. Use the placeholder contract ID specified in `.env` or `.env.local`
2. The SDK will initialize but actual contract calls will fail
3. UI components and wallet connectivity can still be tested
4. You can use the mock data in `src/utils/mockData.ts` for UI development

## How to Deploy and Test with a Real Contract

1. Deploy the Soroban NFT contract to the Stellar testnet
2. Update the `.env.local` file with your deployed contract ID:
   ```
   NEXT_PUBLIC_CONTRACT_ID=your_real_contract_id
   ```
3. Restart the development server
4. The SDK will automatically connect to your deployed contract

## Common Test Scenarios

1. **Wallet Connection**
   - Click the "Connect Wallet" button
   - Approve the connection in Freighter
   - Verify wallet address appears in the UI

2. **Viewing NFTs**
   - Navigate to the home page
   - Verify listed NFTs are displayed (if any)
   - Connect wallet and check "My NFTs" tab

3. **Minting an NFT**
   - Navigate to the Mint page
   - Connect wallet if not already connected
   - Enter an IPFS URI for the metadata
   - Click "Mint NFT" and approve the transaction in Freighter

4. **Listing an NFT for Sale**
   - Navigate to "My NFTs" tab
   - Click "List for Sale" on an owned NFT
   - Enter price and confirm
   - Approve transaction in Freighter

5. **Buying an NFT**
   - Navigate to the marketplace (Home)
   - Click "Buy Now" on a listed NFT
   - Approve transaction in Freighter

## Checking SDK Functionality

If the SDK is functioning correctly:

1. The `/test` page should show "SDK Initialized: Yes"
2. Wallet connection should work properly
3. Successful transactions should return transaction hashes
4. Error handling should capture and display contract errors

## Debugging Tips

1. Check browser console for errors
2. Verify Freighter wallet is on the same network specified in `.env`
3. Ensure contract ID is correct
4. Check transaction details in the Stellar Explorer 

## Troubleshooting Common Issues

1. **Wallet not connecting**
   - Make sure Freighter is installed and unlocked
   - Check if correct permission is granted for the site

2. **Transactions failing**
   - Check wallet has sufficient XLM balance
   - Verify contract ID is correct
   - Check network configuration matches Freighter

3. **UI not updating after transactions**
   - Verify transaction was successful
   - Check if data fetching hooks are triggered after state changes 