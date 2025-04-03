import { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import { MarketplaceService } from '../services/marketplace';
import { NFTListing, ListingStatus, ListingFilters } from '../types/nft';
import MarketplaceFilters from '../components/MarketplaceFilters';
import NFTDetails from '../components/NFTDetails';
import ListNFTModal from '../components/ListNFTModal';

const Marketplace = () => {
  const { sdk } = useWallet();
  const [listings, setListings] = useState<NFTListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<NFTListing | null>(null);
  const [filters, setFilters] = useState<ListingFilters>({
    status: ListingStatus.ACTIVE,
    sortBy: 'createdAt',
    sortDirection: 'desc',
  });

  const marketplaceService = new MarketplaceService(sdk);

  useEffect(() => {
    loadListings();
  }, [filters]);

  const loadListings = async () => {
    try {
      setLoading(true);
      const fetchedListings = await marketplaceService.getListings(filters);
      setListings(fetchedListings);
    } catch (error) {
      console.error('Error loading listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: Partial<ListingFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleListingSuccess = () => {
    loadListings();
    setSelectedListing(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="lg:w-1/4">
          <MarketplaceFilters
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Main Content */}
        <div className="lg:w-3/4">
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-3xl font-bold">NFT Marketplace</h1>
            <p className="text-gray-600">
              {listings.length} {listings.length === 1 ? 'NFT' : 'NFTs'} found
            </p>
          </div>

          {/* NFT Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="cursor-pointer"
                onClick={() => setSelectedListing(listing)}
              >
                <NFTDetails
                  listing={listing}
                  onSuccess={handleListingSuccess}
                />
              </div>
            ))}
          </div>

          {listings.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No NFTs found matching your criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* NFT Details Modal */}
      {selectedListing && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-black opacity-50"
              onClick={() => setSelectedListing(null)}
            ></div>
            <div className="relative bg-white rounded-lg w-full max-w-2xl">
              <NFTDetails
                listing={selectedListing}
                onSuccess={handleListingSuccess}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace; 