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

  async getListings(filters: ListingFilters = {}): Promise<NFTListing[]> {
    try {
      // Fetch all listings from the SDK (in a real implementation this would use the filters)
      const fetchedListings = await this.sdk.getListedNFTs();
      
      // Convert to the app's NFTListing format
      let listings: NFTListing[] = fetchedListings.map(listing => ({
        id: listing.tokenId,
        nft: {
          id: listing.tokenId,
          tokenId: listing.tokenId,
          name: `NFT #${listing.tokenId}`, // This would ideally be fetched from metadata
          description: 'NFT description', // This would ideally be fetched from metadata
          image: '/nft-placeholder.png', // This would ideally be fetched from metadata
          owner: listing.seller,
          creator: listing.seller, // This would ideally be fetched from metadata
          metadata: {},
        },
        price: listing.price,
        seller: listing.seller,
        status: ListingStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      // Apply filters
      if (filters.status !== undefined) {
        listings = listings.filter(listing => listing.status === filters.status);
      }

      if (filters.minPrice !== undefined) {
        listings = listings.filter(listing => 
          new BigNumber(listing.price).isGreaterThanOrEqualTo(filters.minPrice || '0')
        );
      }

      if (filters.maxPrice !== undefined) {
        listings = listings.filter(listing => 
          new BigNumber(listing.price).isLessThanOrEqualTo(filters.maxPrice || '999999999')
        );
      }

      if (filters.seller !== undefined) {
        listings = listings.filter(listing => 
          listing.seller.toLowerCase() === filters.seller?.toLowerCase()
        );
      }

      // Apply search
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        listings = listings.filter(listing => 
          listing.nft.name.toLowerCase().includes(query) || 
          listing.nft.description.toLowerCase().includes(query)
        );
      }

      // Apply collection filter if available
      if (filters.collection) {
        listings = listings.filter(listing => 
          listing.nft.metadata.collection === filters.collection
        );
      }

      // Apply creator filter if available
      if (filters.creator) {
        listings = listings.filter(listing => 
          listing.nft.creator.toLowerCase() === filters.creator?.toLowerCase()
        );
      }

      // Apply trait/attribute filters if available
      if (filters.traits && filters.traits.length > 0) {
        listings = listings.filter(listing => {
          if (!listing.nft.metadata.attributes) return false;
          
          // Check if NFT has all the required traits
          return filters.traits!.every(trait => {
            const attribute = listing.nft.metadata.attributes.find(
              attr => attr.trait_type === trait.trait_type
            );
            if (!attribute) return false;
            return attribute.value === trait.value;
          });
        });
      }

      // Apply sorting
      if (filters.sortBy) {
        listings.sort((a, b) => {
          if (filters.sortBy === 'price') {
            const aPrice = new BigNumber(a.price);
            const bPrice = new BigNumber(b.price);
            return filters.sortDirection === 'asc' 
              ? aPrice.comparedTo(bPrice) 
              : bPrice.comparedTo(aPrice);
          } else if (filters.sortBy === 'createdAt') {
            return filters.sortDirection === 'asc'
              ? a.createdAt.getTime() - b.createdAt.getTime()
              : b.createdAt.getTime() - a.createdAt.getTime();
          }
          return 0;
        });
      }

      return listings;
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
} 