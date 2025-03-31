# Stellar NFT Marketplace

A decentralized NFT marketplace built on the Stellar blockchain, allowing users to create, buy, sell, and collect digital assets.

## Features

- Wallet connection using Freighter wallet
- Browse, create, and manage NFTs
- Fast and secure transactions on Stellar blockchain
- User-friendly interface with responsive design

## Technologies

- **Frontend**: Next.js, React, TypeScript, CSS Modules
- **Blockchain**: Stellar, Soroban
- **Wallet**: Freighter

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- Freighter wallet extension installed in your browser

### Installation

1. Clone the repository
   ```bash
   git clone [your-repo-url]
   cd stellar-nft-marketplace
   ```

2. Install dependencies
   ```bash
   cd frontend
   npm install
   ```

3. Run the development server
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Wallet Connection

This project uses the Freighter wallet for Stellar blockchain interactions. To test the wallet functionality:

1. Install the [Freighter Wallet](https://www.freighter.app/)
2. Create or import a wallet
3. Visit the wallet demo page in the application
4. Connect your wallet using the "Connect Wallet" button

## Project Structure

- `frontend/src/components/` - React components
- `frontend/src/pages/` - Next.js pages
- `frontend/src/styles/` - CSS modules
- `frontend/src/sdk/` - Blockchain integration code
- `frontend/src/providers/` - Context providers
- `frontend/public/` - Static assets

## License

MIT 