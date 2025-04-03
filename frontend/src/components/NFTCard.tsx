import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { RiHeartLine, RiHeartFill, RiExternalLinkLine } from 'react-icons/ri';
import NFTPlaceholder from './NFTPlaceholder';

interface NFTCardProps {
  id: string;
  title: string;
  image: string;
  price: string;
  creator: string;
  likes?: number;
  isListed?: boolean;
  onLike?: () => void;
  isLiked?: boolean;
}

const NFTCard: React.FC<NFTCardProps> = ({
  id,
  title,
  image,
  price,
  creator,
  likes = 0,
  isListed = false,
  onLike,
  isLiked = false,
}) => {
  const [imageError, setImageError] = useState(false);
  
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="group relative">
      <div className="card overflow-hidden transition-all duration-300 bg-dark-800 hover:bg-dark-700 rounded-xl">
        <div className="relative aspect-square">
          {imageError ? (
            <NFTPlaceholder />
          ) : (
            <>
              <Image
                src={image}
                alt={title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-110"
                onError={() => setImageError(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </>
          )}
          <button
            onClick={onLike}
            className="absolute top-3 right-3 p-2 rounded-full bg-dark-800/50 backdrop-blur-sm hover:bg-dark-700 transition-colors duration-200"
          >
            {isLiked ? (
              <RiHeartFill className="w-5 h-5 text-red-500" />
            ) : (
              <RiHeartLine className="w-5 h-5 text-white" />
            )}
          </button>
        </div>

        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-semibold text-lg text-white mb-1 line-clamp-1">
                {title}
              </h3>
              <p className="text-sm text-dark-300">
                by {formatAddress(creator)}
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <div>
              <p className="text-sm text-dark-400">Price</p>
              <p className="text-lg font-semibold text-white">{price} XLM</p>
            </div>
            <Link
              href={`/nft/${id}`}
              className="btn-primary flex items-center gap-2 py-2 px-4"
            >
              {isListed ? 'Buy Now' : 'View'}
              <RiExternalLinkLine className="w-4 h-4" />
            </Link>
          </div>

          <div className="mt-4 pt-4 border-t border-dark-700">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1 text-dark-300">
                <RiHeartLine className="w-4 h-4" />
                <span className="text-sm">{likes}</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${
                isListed ? 'bg-primary-900/20 text-primary-500' : 'bg-dark-700 text-dark-300'
              }`}>
                {isListed ? 'Listed' : 'Not Listed'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTCard; 