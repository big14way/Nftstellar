import { NFT, NFTListing, ListingStatus, ListingFilters } from '../types/nft';
import { StellarSdk } from '../sdk/stellar';
import { BigNumber } from 'bignumber.js';

export class MarketplaceService {
  private readonly sdk: StellarSdk;

  constructor(sdk: StellarSdk) {
    this.sdk = sdk;
  }

  async createListing(nft: NFT, price: string): Promise<NFTListing> {
    try {
      // Create listing transaction
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
      console.error('Error creating listing:', error);
      throw new Error('Failed to create NFT listing');
    }
  }

  async getListings(filters?: ListingFilters): Promise<NFTListing[]> {
    try {
      const listings = await this.sdk.getListedNFTs();
      
      let filteredListings = listings;

      if (filters) {
        filteredListings = this.applyFilters(listings, filters);
      }

      return filteredListings;
    } catch (error) {
      console.error('Error fetching listings:', error);
      throw new Error('Failed to fetch NFT listings');
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
      throw new Error('Failed to buy NFT');
    }
  }

  async cancelListing(listing: NFTListing): Promise<void> {
    try {
      await this.sdk.cancelNFTListing({
        listingId: listing.id,
      });
    } catch (error) {
      console.error('Error cancelling listing:', error);
      throw new Error('Failed to cancel NFT listing');
    }
  }

  private applyFilters(listings: NFTListing[], filters: ListingFilters): NFTListing[] {
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

      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        return (
          listing.nft.name.toLowerCase().includes(query) ||
          listing.nft.description.toLowerCase().includes(query)
        );
      }

      return true;
    }).sort((a, b) => {
      if (!filters.sortBy) return 0;

      if (filters.sortBy === 'price') {
        return filters.sortDirection === 'asc'
          ? new BigNumber(a.price).minus(b.price).toNumber()
          : new BigNumber(b.price).minus(a.price).toNumber();
      }

      return filters.sortDirection === 'asc'
        ? a.createdAt.getTime() - b.createdAt.getTime()
        : b.createdAt.getTime() - a.createdAt.getTime();
    });
  }
} 