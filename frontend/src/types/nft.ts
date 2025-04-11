export interface NFT {
  id: string;
  tokenId: string;
  name: string;
  description: string;
  image: string;
  owner: string;
  creator: string;
  metadata: Record<string, any>;
  royaltyPercentage?: number;
  collection?: string;
  price?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

export interface NFTListing {
  id: string;
  nft: NFT;
  price: string;
  seller: string;
  status: ListingStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum ListingStatus {
  ACTIVE = 'active',
  SOLD = 'sold',
  CANCELLED = 'cancelled',
}

export interface ListingFilters {
  status?: ListingStatus;
  minPrice?: string;
  maxPrice?: string;
  seller?: string;
  creator?: string;
  collection?: string;
  sortBy?: 'price' | 'createdAt' | 'popularity';
  sortDirection?: 'asc' | 'desc';
  searchQuery?: string;
  traits?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

export interface NFTTransferParams {
  tokenId: string;
  toAddress: string;
}

export interface NFTListingParams {
  tokenId: string;
  price: string;
}

export interface NFTBuyParams {
  listingId: string;
}

export interface NFTCollection {
  id: string;
  name: string;
  description: string;
  image: string;
  creator: string;
  nftCount: number;
  floorPrice?: string;
  totalVolume?: string;
} 