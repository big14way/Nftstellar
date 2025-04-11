import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { RiHeartLine, RiHeartFill, RiExternalLinkLine } from 'react-icons/ri';
import NFTPlaceholder from './NFTPlaceholder';
import styles from '../styles/NFTCard.module.css';
import { NFT } from '../types/nft';

interface NFTCardProps {
  nft: NFT;
  showDelist?: boolean;
  onDelistClick?: (nft: NFT) => void;
  showListButton?: boolean;
  onListClick?: (nft: NFT) => void;
  showTransferButton?: boolean;
  onTransferClick?: (nft: NFT) => void;
}

const NFTCard = ({ 
  nft, 
  showDelist = false,
  onDelistClick,
  showListButton = false,
  onListClick,
  showTransferButton = false,
  onTransferClick 
}: NFTCardProps) => {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  
  const defaultNftImage = '/nft-placeholder.png';
  
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    return numPrice.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  };

  const handleDelist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelistClick) {
      onDelistClick(nft);
    }
  };

  return (
    <div className={styles.nftCard} onClick={() => router.push(`/nft/${nft.id}`)}>
      <div className={styles.imageContainer}>
        <img 
          src={nft.image || defaultNftImage} 
          alt={nft.name}
          onError={(e) => {
            (e.target as HTMLImageElement).src = defaultNftImage;
          }}
          className={styles.nftImage}
        />
        </div>
      <div className={styles.cardContent}>
        <h3 className={styles.nftName}>{nft.name}</h3>
        <p className={styles.nftCollection}>{nft.collection || 'Uncategorized'}</p>
        
        {nft.price && (
          <div className={styles.priceContainer}>
            <div className={styles.priceLabel}>Price</div>
            <div className={styles.priceValue}>{formatPrice(nft.price)} XLM</div>
          </div>
        )}
        
        <div className={styles.actionsContainer}>
          {showDelist && nft.price && (
            <button 
              className={styles.delistButton}
              onClick={handleDelist}
            >
              Delist
            </button>
          )}
          
          {showListButton && !nft.price && (
            <button 
              className={styles.listButton}
              onClick={(e) => {
                e.stopPropagation();
                if (onListClick) onListClick(nft);
              }}
            >
              List for Sale
            </button>
          )}
          
          {showTransferButton && (
            <button 
              className={styles.transferButton}
              onClick={(e) => {
                e.stopPropagation();
                if (onTransferClick) onTransferClick(nft);
              }}
            >
              Transfer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NFTCard; 