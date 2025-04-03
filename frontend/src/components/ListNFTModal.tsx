import { useState } from 'react';
import { NFT } from '../types/nft';
import { MarketplaceService } from '../services/marketplace';
import { useWallet } from '../hooks/useWallet';
import { BigNumber } from 'bignumber.js';

interface ListNFTModalProps {
  nft: NFT;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ListNFTModal: React.FC<ListNFTModalProps> = ({ nft, isOpen, onClose, onSuccess }) => {
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { sdk } = useWallet();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!price || new BigNumber(price).lte(0)) {
        throw new Error('Please enter a valid price');
      }

      const marketplaceService = new MarketplaceService(sdk);
      await marketplaceService.createListing(nft, price);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to list NFT');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black opacity-50"></div>
        
        <div className="relative bg-white rounded-lg w-full max-w-md p-6">
          <h2 className="text-2xl font-bold mb-4">List NFT for Sale</h2>
          
          <div className="mb-6">
            <img
              src={nft.image}
              alt={nft.name}
              className="w-full h-48 object-cover rounded-lg"
            />
            <h3 className="mt-2 text-lg font-semibold">{nft.name}</h3>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (XLM)
              </label>
              <input
                type="number"
                step="0.000001"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter price in XLM"
                required
              />
            </div>

            {error && (
              <div className="mb-4 text-red-500 text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Listing...' : 'List NFT'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ListNFTModal; 