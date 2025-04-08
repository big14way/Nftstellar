import { useState } from 'react';
import { nftService } from '@/services/nft.service';
import styles from '@/styles/BuyNFTModal.module.css';

interface NFT {
  id: string;
  tokenId: string;
  name: string;
  description: string;
  image: string;
  price?: string;
  owner?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

interface BuyNFTModalProps {
  nft: NFT;
  onClose: () => void;
  onSuccess: () => void;
}

const BuyNFTModal: React.FC<BuyNFTModalProps> = ({ nft, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleBuy = async () => {
    if (!nft.tokenId || !nft.price) {
      setError('NFT data is incomplete');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // First step - show confirmation UI
      if (!isConfirming) {
        setIsConfirming(true);
        setIsLoading(false);
        return;
      }

      // Call the buyNFT service method
      const result = await nftService.buyNFT(nft.tokenId, nft.price);
      
      if (result && result.success) {
        onSuccess();
      } else {
        setError('Transaction failed. Please try again.');
      }
    } catch (err) {
      console.error('Error buying NFT:', err);
      setError(err instanceof Error ? err.message : 'Failed to buy NFT');
    } finally {
      setIsLoading(false);
    }
  };

  // Format address for display
  const formatAddress = (address?: string) => {
    if (!address) return 'Unknown';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>{isConfirming ? 'Confirm Purchase' : 'Buy NFT'}</h3>
          <button 
            className={styles.closeButton} 
            onClick={onClose}
            disabled={isLoading}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className={styles.modalContent}>
          <div className={styles.nftPreview}>
            <div className={styles.nftImage}>
              <img src={nft.image} alt={nft.name} />
            </div>
            <div className={styles.nftInfo}>
              <h4>{nft.name}</h4>
              <p className={styles.nftDescription}>
                {nft.description?.substring(0, 100)}{nft.description && nft.description.length > 100 ? '...' : ''}
              </p>
              {nft.owner && (
                <div className={styles.ownerInfo}>
                  <span className={styles.ownerLabel}>Seller:</span>
                  <span className={styles.ownerValue}>{formatAddress(nft.owner)}</span>
                </div>
              )}
            </div>
          </div>

          <div className={styles.purchaseDetails}>
            <div className={styles.priceContainer}>
              <span className={styles.priceLabel}>Price:</span>
              <span className={styles.priceValue}>{nft.price} XLM</span>
            </div>
            
            {isConfirming && (
              <div className={styles.confirmationMessage}>
                <p>You are about to purchase this NFT for <strong>{nft.price} XLM</strong>.</p>
                <p>This action cannot be undone. The NFT will be transferred to your wallet and the XLM will be sent to the seller.</p>
              </div>
            )}

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.actions}>
              <button 
                className={styles.cancelButton}
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button 
                className={styles.buyButton}
                onClick={handleBuy}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : isConfirming ? 'Confirm Purchase' : `Buy for ${nft.price} XLM`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyNFTModal; 