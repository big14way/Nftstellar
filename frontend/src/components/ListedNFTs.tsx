import { useState, useContext } from 'react';
import { NFTListing } from '../types/nft';
import { useNFTMarketplace } from '../hooks/useNFTMarketplace';
import AppContext from '../utils/AppContext';
import NFTCard from './NFTCard';

interface ListedNFTsProps {
  nfts: NFTListing[];
  isLoading: boolean;
  isConnected: boolean;
}

const ListedNFTs: React.FC<ListedNFTsProps> = ({ nfts, isLoading, isConnected }) => {
  const { config } = useContext(AppContext);
  const [buyingTokenId, setBuyingTokenId] = useState<string | null>(null);
  
  const { buyNFT } = useNFTMarketplace({
    contractId: config.contractId,
    network: config.network,
    rpcUrl: config.rpcUrl,
    networkPassphrase: config.networkPassphrase,
    ipfsGateway: config.ipfsGateway
  });
  
  const handleBuyNFT = async (tokenId: string) => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }
    
    setBuyingTokenId(tokenId);
    
    try {
      const result = await buyNFT(tokenId);
      
      if (result.success) {
        alert(`Successfully purchased NFT #${tokenId}`);
        // Ideally refresh the listings here
      } else {
        alert(`Failed to purchase NFT: ${result.error}`);
      }
    } catch (error) {
      console.error('Error buying NFT:', error);
      alert('Failed to purchase NFT');
    } finally {
      setBuyingTokenId(null);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (nfts.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-900">No NFTs listed yet</h3>
        <p className="mt-2 text-gray-500">Be the first to list an NFT on the marketplace!</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {nfts.map((listing) => (
          <NFTCard
            key={listing.nft.tokenId}
            nft={listing.nft}
            showDelist={false}
            showListButton={false}
            showTransferButton={false}
          />
        ))}
      </div>
    </div>
  );
};

export default ListedNFTs; 