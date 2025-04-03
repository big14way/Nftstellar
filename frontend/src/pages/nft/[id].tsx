import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import { RiHeartLine, RiHeartFill, RiExternalLinkLine, RiArrowLeftLine } from 'react-icons/ri';
import { mockNFTs } from '@/data/mockNFTs';
import NFTPlaceholder from '@/components/NFTPlaceholder';

const NFTDetail: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [nft, setNft] = useState(mockNFTs.find(n => n.id === id));
  const [imageError, setImageError] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (id) {
      const foundNFT = mockNFTs.find(n => n.id === id);
      setNft(foundNFT);
    }
  }, [id]);

  if (!nft) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-dark-300">
          NFT not found
        </div>
      </div>
    );
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/marketplace"
        className="inline-flex items-center text-dark-300 hover:text-white mb-8 transition-colors duration-200"
      >
        <RiArrowLeftLine className="mr-2" />
        Back to Marketplace
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column - Image */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-xl overflow-hidden bg-dark-800">
            {imageError ? (
              <NFTPlaceholder />
            ) : (
              <Image
                src={nft.image}
                alt={nft.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                onError={() => setImageError(true)}
                priority
              />
            )}
          </div>

          {/* Description */}
          <div className="bg-dark-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
            <p className="text-dark-300">{nft.description}</p>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{nft.title}</h1>
              <div className="text-dark-300">
                Created by{' '}
                <Link
                  href={`/profile/${nft.creator}`}
                  className="text-primary-500 hover:text-primary-400"
                >
                  {formatAddress(nft.creator)}
                </Link>
              </div>
            </div>
            <button
              onClick={() => setIsLiked(!isLiked)}
              className="p-2 rounded-full bg-dark-800 hover:bg-dark-700 transition-colors duration-200"
            >
              {isLiked ? (
                <RiHeartFill className="w-6 h-6 text-red-500" />
              ) : (
                <RiHeartLine className="w-6 h-6 text-white" />
              )}
            </button>
          </div>

          {/* Price and Action */}
          <div className="bg-dark-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-dark-300 mb-1">Current Price</p>
                <p className="text-3xl font-bold text-white">{nft.price} XLM</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${
                nft.isListed ? 'bg-primary-900/20 text-primary-500' : 'bg-dark-700 text-dark-300'
              }`}>
                {nft.isListed ? 'Listed' : 'Not Listed'}
              </span>
            </div>
            {nft.isListed && (
              <button className="w-full btn-primary py-3 text-lg font-semibold">
                Buy Now
              </button>
            )}
          </div>

          {/* Properties */}
          {nft.attributes && (
            <div className="bg-dark-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Properties</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {nft.attributes.map((attr, index) => (
                  <div
                    key={index}
                    className="bg-dark-700 rounded-lg p-3 text-center"
                  >
                    <p className="text-dark-400 text-sm mb-1">{attr.trait_type}</p>
                    <p className="text-white font-medium">{attr.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Collection Info */}
          {nft.collection && (
            <div className="bg-dark-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Collection</h3>
              <Link
                href={`/collection/${nft.collection}`}
                className="flex items-center justify-between text-dark-300 hover:text-white transition-colors duration-200"
              >
                <span>{nft.collection}</span>
                <RiExternalLinkLine />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NFTDetail; 