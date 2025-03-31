# Stellar NFT Marketplace Frontend

This is a Next.js frontend for interacting with the Stellar NFT Marketplace smart contract.

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- A Stellar wallet (like Freighter browser extension)

## Getting Started

1. First, install the dependencies:

```bash
cd frontend
npm install
# or
yarn install
```

2. Configure your environment by creating a `.env.local` file with the following content:

```
NEXT_PUBLIC_CONTRACT_ID=CBF76W56VN5OTU6GORWMTLURTVKMQAMAAX7F7A5IBPEZKP6K22SULPM5
NEXT_PUBLIC_NETWORK=testnet
NEXT_PUBLIC_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
NEXT_PUBLIC_IPFS_GATEWAY=https://ipfs.io/ipfs/
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

- Connect with Stellar wallet (Freighter)
- Browse NFTs listed on the marketplace
- View NFT details and metadata
- Mint new NFTs
- List NFTs for sale
- Buy NFTs from other users
- Manage your owned NFTs

## Architecture

The frontend is built with:
- Next.js for the React framework
- Tailwind CSS for styling
- Soroban SDK for interacting with the Stellar blockchain
- IPFS for storing NFT metadata and images

## Pages

- **Home**: Displays featured NFTs and marketplace overview
- **Browse**: Browse all NFTs listed for sale
- **Create**: Mint new NFTs
- **My NFTs**: View and manage your owned NFTs
- **Profile**: User profile and settings

## Development

### Directory Structure

```
frontend/
├── components/     # Reusable UI components
├── hooks/          # Custom React hooks
├── pages/          # Next.js pages
├── public/         # Static assets
├── sdk/            # Soroban SDK integration
├── styles/         # Global styles
└── utils/          # Utility functions
```

### SDK Integration

The frontend interacts with the smart contract through a custom SDK in the `sdk/` directory. This SDK provides methods for all contract functions and handles wallet authentication and transaction signing.

Currently, the NFT Marketplace Client uses mock data for development and testing purposes. This allows frontend development to progress independently of the contract deployment.

When integrating with the real contract, we'll:

1. Update the SDK to use the Stellar SDK's contract client functionality
2. Use the `@stellar/stellar-sdk` package to interact with the Soroban contract
3. Implement proper transaction building, signing, and submission

Example of future implementation using the Client approach:

```typescript
// Import necessary components from the Stellar SDK
import { contract } from "@stellar/stellar-sdk";

// Create a typed client for our contract
const nftClient = await contract.Client.from({
  contractId: "CONTRACT_ID_HERE",
  networkPassphrase: "NETWORK_PASSPHRASE",
  rpcUrl: "RPC_URL",
  publicKey: userPublicKey,
  signTransaction: signTransactionCallback
});

// Then you can call contract methods in a type-safe way
const mintTx = await nftClient.mint({
  to: userPublicKey,
  uri: "ipfs://CID_HERE"
});
const { result } = await mintTx.signAndSend();
```

This approach provides better type safety and a more intuitive way to interact with the contract.

### IPFS Integration

NFT metadata and images are stored on IPFS. The frontend uses an IPFS gateway to retrieve and display this data. When minting a new NFT, the metadata is uploaded to IPFS and the resulting CID is stored on-chain.

## Deployment

To build the production version:

```bash
npm run build
# or
yarn build
```

You can then deploy this to any static site hosting service like Vercel, Netlify, or GitHub Pages. 