import { NetworkType } from '../sdk/types';

// Configuration for the NFT marketplace
export interface MarketplaceConfig {
  contractId: string;
  network: string;
  rpcUrl: string;
  networkPassphrase: string;
  ipfsGateway: string;
  appName: string;
}

// Default configuration
const config: MarketplaceConfig = {
  contractId: process.env.NEXT_PUBLIC_CONTRACT_ID || 'CBF76W56VN5OTU6GORWMTLURTVKMQAMAAX7F7A5IBPEZKP6K22SULPM5',
  network: process.env.NEXT_PUBLIC_NETWORK || 'testnet',
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'https://soroban-testnet.stellar.org',
  networkPassphrase: process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015',
  ipfsGateway: process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://ipfs.io/ipfs/',
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'Stellar NFT Marketplace'
};

export default config; 