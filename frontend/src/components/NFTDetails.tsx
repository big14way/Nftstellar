import { useState, useContext } from 'react';
import { NFTListing } from '../types/nft';
import { MarketplaceService } from '../services/marketplace';
import { useWallet } from '../hooks/useWallet';
import { formatBalance } from '../utils/format';
import AppContext from '../utils/AppContext';

interface NFTDetailsProps {
  listing: NFTListing;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export const NFTDetails: React.FC<NFTDetailsProps> = ({ listing, onSuccess, onError }) => {
  const [isBuying, setIsBuying] = useState(false);
  const { client } = useContext(AppContext);
  const { publicKey } = useWallet();

  const handleBuyNFT = async () => {
    if (!client || !publicKey) {
      onError('Please connect your wallet first');
      return;
    }

    setIsBuying(true);

    try {
      await client.buyNFT(listing.nft.tokenId, publicKey);
      onSuccess();
    } catch (err) {
      console.error('Error buying NFT:', err);
      onError(err instanceof Error ? err.message : 'Failed to buy NFT');
    } finally {
      setIsBuying(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">{listing.nft.name}</h3>
      <div className="mb-4">
        <p>Price: {formatBalance(listing.price)} XLM</p>
        <p>Seller: {listing.seller}</p>
        <p>Creator: {listing.nft.creator}</p>
      </div>
      <button
        onClick={handleBuyNFT}
        disabled={isBuying}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isBuying ? 'Processing...' : 'Buy Now'}
      </button>
    </div>
  );
}; 