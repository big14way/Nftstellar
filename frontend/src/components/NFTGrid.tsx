import React from 'react';
import NFTCard from './NFTCard';
import { NFT } from '../types/nft';

interface NFTGridProps {
  nfts: NFT[];
  loading?: boolean;
}

const NFTGrid: React.FC<NFTGridProps> = ({ nfts, loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="card animate-pulse">
            <div className="card-inner">
              <div className="aspect-square rounded-lg bg-dark-800 mb-4" />
              <div className="space-y-3">
                <div className="h-4 bg-dark-800 rounded w-3/4" />
                <div className="h-3 bg-dark-800 rounded w-1/2" />
                <div className="h-10 bg-dark-800 rounded mt-4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (nfts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-dark-400 text-lg">No NFTs found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {nfts.map((nft) => (
        <NFTCard
          key={nft.id}
          nft={nft}
          showListButton={false}
          showDelist={false}
          showTransferButton={false}
        />
      ))}
    </div>
  );
};

export default NFTGrid; 