import { Contract, Networks, SorobanRpc, TransactionBuilder, xdr, Server, TimeoutInfinite, scValToNative, nativeToScVal } from '@stellar/stellar-sdk';
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

export function getNetworkConfig(network: 'testnet' | 'mainnet'): {
  networkPassphrase: string;
  rpcUrl: string;
  ipfsGateway: string;
} {
  return DEFAULT_NETWORK_CONFIG[network];
}

export async function getServer(rpcUrl: string): Promise<SorobanRpc.Server> {
  return new SorobanRpc.Server(rpcUrl, { allowHttp: true });
}

export function getContract(
  contractId: string,
  server: SorobanRpc.Server
): Contract {
  return new Contract(contractId);
}

export async function getContractValue<T>(
  server: SorobanRpc.Server,
  contractId: string,
  method: string,
  params: any[] = []
): Promise<T> {
  try {
    const contract = new Contract(contractId);
    const result = await contract.call(server, method, ...params);
    return scValToNative(result) as T;
  } catch (error) {
    console.error(`Error getting contract value for ${method}:`, error);
    throw error;
  }
}

export function parseContractError(error: any): string {
  if (error.message) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'Unknown contract error';
}

export function ipfsUriToHttpUrl(uri: string, ipfsGateway: string): string {
  if (!uri) return '';
  
  // Handle ipfs:// protocol
  if (uri.startsWith('ipfs://')) {
    const ipfsHash = uri.replace('ipfs://', '');
    return `${ipfsGateway}${ipfsHash}`;
  }
  
  // Handle ipfs:// protocol missing the //
  if (uri.startsWith('ipfs:')) {
    const ipfsHash = uri.replace('ipfs:', '');
    return `${ipfsGateway}${ipfsHash}`;
  }
  
  // If it's already an HTTP URL, return as is
  if (uri.startsWith('http://') || uri.startsWith('https://')) {
    return uri;
  }
  
  // Default case: assume it's an IPFS CID
  return `${ipfsGateway}${uri}`;
}

export async function fetchMetadata<T = any>(uri: string, ipfsGateway: string): Promise<T> {
  try {
    const url = ipfsUriToHttpUrl(uri, ipfsGateway);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.statusText}`);
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