import { NFT, NFTListing, ListingStatus, ListingFilters } from '../types/nft';
import { StellarSdkImpl } from '../sdk/stellar';
import { NFTListing as SdkNFTListing } from '../sdk/types';
import BigNumber from 'bignumber.js';

interface NFTAttribute {
  trait_type: string;
  value: string | number;
}

export class MarketplaceService {
  private sdk: StellarSdkImpl;

  constructor(sdk: StellarSdkImpl) {
    this.sdk = sdk;
  }

  private convertSdkListingToFrontend(sdkListing: SdkNFTListing): NFTListing {
    // Create a basic NFT object from the SDK listing
    const nft: NFT = {
      id: sdkListing.tokenId, // Use tokenId as id since SDK doesn't provide a separate id
      tokenId: sdkListing.tokenId,
      name: `NFT #${sdkListing.tokenId}`, // Default name if not provided
      description: '', // Default empty description
      image: '', // Default empty image URL
      owner: sdkListing.seller, // Use seller as owner
      creator: sdkListing.seller, // Use seller as creator since SDK doesn't provide creator
      metadata: {}, // Default empty metadata
    };

    // Create the frontend listing object
    return {
      id: sdkListing.tokenId, // Use tokenId as id since SDK doesn't provide a separate id
      nft,
      price: sdkListing.price,
      seller: sdkListing.seller,
      status: ListingStatus.ACTIVE, // Default to active since SDK doesn't provide status
      createdAt: new Date(), // Default to current date since SDK doesn't provide timestamps
      updatedAt: new Date(),
    };
  }

  async listNFT(nft: NFT, price: string): Promise<NFTListing> {
    try {
      const listing = await this.sdk.createNFTListing({
        tokenId: nft.tokenId,
        price: new BigNumber(price).toString(),
      });

      return {
        id: listing.id,
        nft,
        price,
        seller: this.sdk.getPublicKey(),
        status: ListingStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error('Error listing NFT:', error);
      throw error;
    }
  }

  async buyNFT(listing: NFTListing): Promise<void> {
    try {
      await this.sdk.buyNFT({
        listingId: listing.id,
        price: listing.price,
      });
    } catch (error) {
      console.error('Error buying NFT:', error);
      throw error;
    }
  }

  async cancelListing(listing: NFTListing): Promise<void> {
    try {
      await this.sdk.cancelNFTListing({
        listingId: listing.id,
      });
    } catch (error) {
      console.error('Error cancelling listing:', error);
      throw error;
    }
  }

  async getListedNFTs(filters?: ListingFilters): Promise<NFTListing[]> {
    try {
      const sdkListings = await this.sdk.getListedNFTs();
      const frontendListings = sdkListings.map(listing => this.convertSdkListingToFrontend(listing));
      return this.applyFilters(frontendListings, filters);
    } catch (error) {
      console.error('Error getting listed NFTs:', error);
      throw error;
    }
  }

  private applyFilters(listings: NFTListing[], filters?: ListingFilters): NFTListing[] {
    if (!filters) return listings;

    return listings.filter(listing => {
      if (filters.status && listing.status !== filters.status) {
        return false;
      }

      if (filters.minPrice && new BigNumber(listing.price).lt(filters.minPrice)) {
        return false;
      }

      if (filters.maxPrice && new BigNumber(listing.price).gt(filters.maxPrice)) {
        return false;
      }

      if (filters.seller && listing.seller !== filters.seller) {
        return false;
      }

      if (filters.creator && listing.nft.creator !== filters.creator) {
        return false;
      }

      if (filters.collection && listing.nft.collection !== filters.collection) {
        return false;
      }

      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesName = listing.nft.name.toLowerCase().includes(query);
        const matchesDescription = listing.nft.description.toLowerCase().includes(query);
        if (!matchesName && !matchesDescription) {
          return false;
        }
      }

      if (filters.traits && filters.traits.length > 0) {
        const nftAttributes = listing.nft.attributes || [];
        const hasAllTraits = filters.traits.every(trait => {
          const matchingAttribute = nftAttributes.find(function(attr) {
            return attr.trait_type === trait.trait_type && 
                   String(attr.value) === String(trait.value);
          });
          return !!matchingAttribute;
        });
        if (!hasAllTraits) {
          return false;
        }
      }

      return true;
    });
  }
} 