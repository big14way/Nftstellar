import { useState, useContext } from 'react';
import { NFTToken } from '../sdk';
import { useNFTMarketplace } from '../hooks/useNFTMarketplace';
import AppContext from '../utils/AppContext';
import NFTCard from './NFTCard';

interface MyNFTsProps {
  nfts: NFTToken[];
  isLoading: boolean;
}

const MyNFTs: React.FC<MyNFTsProps> = ({ nfts, isLoading }) => {
  const { config } = useContext(AppContext);
  const [listingTokenId, setListingTokenId] = useState<string | null>(null);
  const [price, setPrice] = useState<string>('');
  const [showListingModal, setShowListingModal] = useState<boolean>(false);
  const [selectedNFT, setSelectedNFT] = useState<string | null>(null);
  
  const { listNFT } = useNFTMarketplace({
    contractId: config.contractId,
    network: config.network,
    rpcUrl: config.rpcUrl,
    networkPassphrase: config.networkPassphrase,
    ipfsGateway: config.ipfsGateway
  });
  
  const handleListNFT = async () => {
    if (!selectedNFT || !price) {
      return;
    }
    
    setListingTokenId(selectedNFT);
    
    try {
      const result = await listNFT(selectedNFT, price);
      
      if (result.success) {
        alert(`Successfully listed NFT #${selectedNFT} for ${price} XLM`);
        setShowListingModal(false);
        setSelectedNFT(null);
        setPrice('');
        // Ideally refresh the NFTs list here
      } else {
        alert(`Failed to list NFT: ${result.error}`);
      }
    } catch (error) {
      console.error('Error listing NFT:', error);
      alert('Failed to list NFT');
    } finally {
      setListingTokenId(null);
    }
  };
  
  const openListingModal = (tokenId: string) => {
    setSelectedNFT(tokenId);
    setShowListingModal(true);
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
        <h3 className="text-lg font-medium text-gray-900">You don't own any NFTs yet</h3>
        <p className="mt-2 text-gray-500">Mint or purchase NFTs to get started!</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {nfts.map((nft) => (
          <NFTCard
            key={nft.tokenId}
            tokenId={nft.tokenId}
            owner={nft.owner}
            uri={nft.uri}
            isOwned={true}
            isListing={listingTokenId === nft.tokenId}
            onList={() => openListingModal(nft.tokenId)}
          />
        ))}
      </div>
      
      {/* Listing Modal */}
      {showListingModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="relative mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">List NFT for Sale</h3>
              <div className="mt-4 px-7 py-3">
                <p className="text-sm text-gray-500 mb-4">
                  You are listing NFT #{selectedNFT} for sale.
                </p>
                <div className="mb-4">
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 text-left mb-1">
                    Price (XLM)
                  </label>
                  <input
                    type="number"
                    id="price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Enter price in XLM"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowListingModal(false)}
                    className="px-4 py-2 bg-white text-gray-700 text-base font-medium rounded-md border border-gray-300 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleListNFT}
                    disabled={!price || listingTokenId !== null}
                    className="px-4 py-2 bg-blue-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
                  >
                    {listingTokenId !== null ? (
                      <div className="flex items-center">
                        <div className="animate-spin h-4 w-4 mr-2 border-b-2 border-white"></div>
                        Listing...
                      </div>
                    ) : (
                      'List for Sale'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyNFTs; 