import { useState } from 'react';
import { NFTListing, ListingStatus } from '../types/nft';
import { MarketplaceService } from '../services/marketplace';
import { useWallet } from '../hooks/useWallet';
import { BigNumber } from 'bignumber.js';

interface NFTDetailsProps {
  listing: NFTListing;
  onSuccess: () => void;
}

const NFTDetails: React.FC<NFTDetailsProps> = ({ listing, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { sdk, publicKey } = useWallet();

  const handleBuyNFT = async () => {
    setError('');
    setLoading(true);

    try {
      const marketplaceService = new MarketplaceService(sdk);
      await marketplaceService.buyNFT(listing);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to buy NFT');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelListing = async () => {
    setError('');
    setLoading(true);

    try {
      const marketplaceService = new MarketplaceService(sdk);
      await marketplaceService.cancelListing(listing);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel listing');
    } finally {
      setLoading(false);
    }
  };

  const isOwner = listing.seller === publicKey;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <img
        src={listing.nft.image}
        alt={listing.nft.name}
        className="w-full h-64 object-cover"
      />
      
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-2">{listing.nft.name}</h2>
        <p className="text-gray-600 mb-4">{listing.nft.description}</p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">Creator</p>
            <p className="font-medium">{listing.nft.creator}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Owner</p>
            <p className="font-medium">{listing.nft.owner}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Price</p>
            <p className="font-medium">{listing.price} XLM</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className="font-medium">{listing.status}</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 text-red-500 text-sm">
            {error}
          </div>
        )}

        {listing.status === ListingStatus.ACTIVE && (
          <div className="flex justify-end gap-4">
            {isOwner ? (
              <button
                onClick={handleCancelListing}
                disabled={loading}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
              >
                {loading ? 'Cancelling...' : 'Cancel Listing'}
              </button>
            ) : (
              <button
                onClick={handleBuyNFT}
                disabled={loading}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Buying...' : 'Buy Now'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NFTDetails; 