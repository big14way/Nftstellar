import { NFTMarketplaceClient } from './nftClient';
import { StellarSdk, NFTListing, SdkConfig } from './types';

export class StellarSdkImpl implements StellarSdk {
  private client: NFTMarketplaceClient;
  private publicKey: string;

  constructor(config: SdkConfig, publicKey: string) {
    this.client = new NFTMarketplaceClient(config);
    this.publicKey = publicKey;
  }

  async getListedNFTs(): Promise<NFTListing[]> {
    return this.client.getListedNFTs();
  }

  async createNFTListing(params: { tokenId: string; price: string }): Promise<{ id: string }> {
    const result = await this.client.listNFT(params.tokenId, params.price, this.publicKey);
    if (!result.success) {
      throw new Error(result.error || 'Failed to create listing');
    }
    return { id: params.tokenId }; // Using tokenId as listing id for now
  }

  getPublicKey(): string {
    return this.publicKey;
  }

  async buyNFT(params: { listingId: string; price: string }): Promise<void> {
    const result = await this.client.buyNFT(params.listingId, this.publicKey);
    if (!result.success) {
      throw new Error(result.error || 'Failed to buy NFT');
    }
  }

  async cancelNFTListing(params: { listingId: string }): Promise<void> {
    const result = await this.client.cancelListing(params.listingId, this.publicKey);
    if (!result.success) {
      throw new Error(result.error || 'Failed to cancel listing');
    }
  }
} 