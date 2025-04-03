export interface NFT {
  id: string;
  tokenId: string;
  name: string;
  description: string;
  image: string;
  owner: string;
  creator: string;
  metadata: Record<string, any>;
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
  ACTIVE = 'ACTIVE',
  SOLD = 'SOLD',
  CANCELLED = 'CANCELLED'
}

export interface ListingFilters {
  status?: ListingStatus;
  minPrice?: string;
  maxPrice?: string;
  seller?: string;
  sortBy?: 'price' | 'createdAt';
  sortDirection?: 'asc' | 'desc';
  searchQuery?: string;
} 