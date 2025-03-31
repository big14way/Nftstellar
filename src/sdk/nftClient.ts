import * as SorobanClient from 'soroban-client';
import { 
  NFTMarketplaceConfig, 
  NetworkType, 
  SdkConfig, 
  NFTToken, 
  NFTListing, 
  TokenMetadata,
  TransactionResult 
} from './types';
import { 
  getContract, 
  getNetworkConfig, 
  parseContractError,
  ipfsUriToHttpUrl,
  fetchMetadata
} from './utils';
import { signTransaction } from './walletConnect';

export class NFTMarketplaceClient {
  private contract: SorobanClient.Contract;
  private server: SorobanClient.Server;
  private config: NFTMarketplaceConfig;

  constructor(config: SdkConfig) {
    try {
      const networkConfig = config.network === 'custom' 
        ? {
            networkPassphrase: config.networkPassphrase,
            rpcUrl: config.rpcUrl,
            ipfsGateway: config.ipfsGateway || 'https://ipfs.io/ipfs/'
          }
        : getNetworkConfig(config.network);

      this.config = {
        contractId: config.contractId,
        networkPassphrase: networkConfig.networkPassphrase,
        rpcUrl: networkConfig.rpcUrl,
        ipfsGateway: networkConfig.ipfsGateway
      };
      
      this.server = new SorobanClient.Server(this.config.rpcUrl, { allowHttp: true });
      this.contract = new SorobanClient.Contract(this.config.contractId);
    } catch (error) {
      console.error('Error initializing NFTMarketplaceClient:', error);
      throw error;
    }
  }

  /**
   * Get the contract metadata
   */
  async getMetadata(): Promise<TokenMetadata> {
    try {
      const response = await this.contract.call(
        "get_token_metadata"
      );
      
      const metadata = SorobanClient.scValToNative(response) as any;
      
      return {
        name: metadata.name,
        symbol: metadata.symbol,
        description: metadata.description || '',
        baseUri: metadata.base_uri || ''
      };
    } catch (error) {
      console.error('Error getting metadata:', error);
      throw error;
    }
  }

  // Rest of the file remains unchanged
} 