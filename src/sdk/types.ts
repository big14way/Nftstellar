import * as SorobanClient from 'soroban-client';

export interface TokenMetadata {
  name: string;
  symbol: string;
  description: string;
  baseUri: string;
}

export interface NFTToken {
  tokenId: string;
  owner: string;
  uri: string;
}

export interface NFTListing {
  tokenId: string;
  price: string;
  seller: string;
}

export interface WalletConnection {
  address: string;
  publicKey: string;
  networkPassphrase: string;
  connected: boolean;
}

export interface TransactionResult {
  success: boolean;
  hash?: string;
  error?: string;
}

export interface NFTMarketplaceConfig {
  contractId: string;
  networkPassphrase: string;
  rpcUrl: string;
  ipfsGateway: string; 
}

export type NetworkType = 'testnet' | 'mainnet' | 'custom';

export interface SdkConfig {
  network: NetworkType;
  rpcUrl: string;
  contractId: string;
  networkPassphrase: string;
  ipfsGateway?: string;
}

export type TransactionStatus = 
  | 'idle'
  | 'creating'
  | 'submitting'
  | 'pending'
  | 'success'
  | 'error';

export interface TransactionState {
  status: TransactionStatus;
  error?: string;
  hash?: string;
  result?: SorobanClient.SorobanRpc.GetTransactionResponse;
} 