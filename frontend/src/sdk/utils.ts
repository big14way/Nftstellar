import { Contract, Networks } from '@stellar/stellar-sdk';
import { NFTMarketplaceConfig, TransactionResult } from './types';

export const DEFAULT_NETWORK_CONFIG = {
  testnet: {
    networkPassphrase: Networks.TESTNET,
    rpcUrl: 'https://soroban-testnet.stellar.org',
    ipfsGateway: 'https://ipfs.io/ipfs/'
  },
  mainnet: {
    networkPassphrase: Networks.PUBLIC,
    rpcUrl: 'https://soroban.stellar.org',
    ipfsGateway: 'https://ipfs.io/ipfs/'
  }
};

export function getNetworkConfig(network: 'testnet' | 'mainnet') {
  return DEFAULT_NETWORK_CONFIG[network];
}

export function parseContractError(error: any): string {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unknown error occurred';
}

export function ipfsUriToHttpUrl(uri: string, gateway: string = 'https://ipfs.io/ipfs/'): string {
  if (!uri) {
    return '';
  }
  
  // If it's already an HTTP URL, return as is
  if (uri.startsWith('http://') || uri.startsWith('https://')) {
    return uri;
  }
  
  // Remove ipfs:// prefix if present
  const cid = uri.replace('ipfs://', '');
  
  // Ensure gateway ends with /
  const normalizedGateway = gateway.endsWith('/') ? gateway : `${gateway}/`;
  
  return `${normalizedGateway}${cid}`;
}

export async function fetchMetadata(uri: string, gateway?: string): Promise<any> {
  try {
    const url = ipfsUriToHttpUrl(uri, gateway);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching metadata:', error);
    throw error;
  }
}

export function formatBalance(balance: string): string {
  const number = parseFloat(balance);
  if (isNaN(number)) return '0';
  
  // Format with commas for thousands and 7 decimal places max
  return number.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 7
  });
}

export function parseStellarAmount(amount: string): string {
  try {
    // Convert input to a number with 7 decimal places (Stellar's precision)
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) return '0';
    
    // Return the amount in string format with 7 decimal places (Stellar's precision)
    return parsedAmount.toFixed(7);
  } catch (error) {
    console.error('Error parsing Stellar amount:', error);
    return '0';
  }
} 