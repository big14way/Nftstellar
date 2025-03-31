import { useState, useEffect, useContext } from 'react';
import Image from 'next/image';
import { ipfsUriToHttpUrl } from '../sdk/utils';
import AppContext from '../utils/AppContext';

interface NFTCardProps {
  tokenId: string;
  price?: string;
  seller?: string;
  owner?: string;
  uri?: string;
  isListed?: boolean;
  isOwned?: boolean;
  isBuying?: boolean;
  isListing?: boolean;
  onBuy?: () => void;
  onList?: () => void;
  disabled?: boolean;
}

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
}

const NFTCard: React.FC<NFTCardProps> = ({
  tokenId,
  price,
  seller,
  owner,
  uri,
  isListed = false,
  isOwned = false,
  isBuying = false,
  isListing = false,
  onBuy,
  onList,
  disabled = false
}) => {
  const { config } = useContext(AppContext);
  const [metadata, setMetadata] = useState<NFTMetadata | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Format address for display
  const formatAddress = (address?: string): string => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };
  
  // Fetch NFT metadata
  useEffect(() => {
    const fetchMetadata = async () => {
      if (!uri) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Convert IPFS URI to HTTP URL
        const url = ipfsUriToHttpUrl(uri, config.ipfsGateway);
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch metadata');
        }
        
        const data = await response.json();
        setMetadata(data);
      } catch (err) {
        console.error('Error fetching NFT metadata:', err);
        setError('Failed to load NFT metadata');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMetadata();
  }, [uri, config.ipfsGateway]);
  
  // Get image URL from metadata
  const getImageUrl = (): string => {
    if (!metadata || !metadata.image) {
      return '/placeholder.png';
    }
    
    return ipfsUriToHttpUrl(metadata.image, config.ipfsGateway);
  };
  
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-200 transition-all duration-300 hover:shadow-lg">
      <div className="relative h-48 w-full bg-gray-200">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-full text-red-500">
            <span>Failed to load image</span>
          </div>
        ) : (
          <div className="relative h-full w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={getImageUrl()} 
              alt={metadata?.name || `NFT #${tokenId}`} 
              className="h-full w-full object-cover"
            />
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold truncate">
            {metadata?.name || `NFT #${tokenId}`}
          </h3>
          <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            #{tokenId}
          </span>
        </div>
        
        {metadata?.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {metadata.description}
          </p>
        )}
        
        {isListed && price && (
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-600">Price:</span>
            <span className="font-medium text-green-600">{price} XLM</span>
          </div>
        )}
        
        {seller && (
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-600">Seller:</span>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
              {formatAddress(seller)}
            </span>
          </div>
        )}
        
        {owner && (
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-600">Owner:</span>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
              {formatAddress(owner)}
            </span>
          </div>
        )}
        
        <div className="mt-4">
          {isListed && onBuy && (
            <button
              onClick={onBuy}
              disabled={disabled || isBuying}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md
                transition duration-150 ease-in-out disabled:bg-blue-300"
            >
              {isBuying ? (
                <div className="flex justify-center items-center">
                  <div className="animate-spin h-4 w-4 mr-2 border-b-2 border-white"></div>
                  Buying...
                </div>
              ) : (
                'Buy Now'
              )}
            </button>
          )}
          
          {isOwned && onList && (
            <button
              onClick={onList}
              disabled={isListing}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md
                transition duration-150 ease-in-out disabled:bg-green-300"
            >
              {isListing ? (
                <div className="flex justify-center items-center">
                  <div className="animate-spin h-4 w-4 mr-2 border-b-2 border-white"></div>
                  Listing...
                </div>
              ) : (
                'List for Sale'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NFTCard; 