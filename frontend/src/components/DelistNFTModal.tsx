import { useState } from 'react';
import { NFT } from '@/types/nft';
import { nftService } from '@/services/nft.service';
import styles from '@/styles/ListNFTModal.module.css';

interface DelistNFTModalProps {
  nft: NFT;
  onClose: () => void;
  onSuccess: () => void;
}

const DelistNFTModal: React.FC<DelistNFTModalProps> = ({ nft, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'confirm' | 'processing' | 'success'>('confirm');
  const [processingStatus, setProcessingStatus] = useState('Preparing transaction...');

  // Function to truncate a string with ellipsis
  const truncateString = (str: string, maxLength: number = 10): string => {
    if (!str) return 'Unknown';
    if (str.length <= maxLength) return str;
    const start = str.substring(0, maxLength / 2);
    const end = str.substring(str.length - maxLength / 2);
    return `${start}...${end}`;
  };

  const handleDelistNFT = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setStep('processing');
      setProcessingStatus('Preparing to delist NFT...');

      // Use tokenId if available, otherwise fall back to transactionHash or id
      const nftTokenId = nft.tokenId || nft.transactionHash || nft.id;
      
      if (!nftTokenId) {
        throw new Error('Unable to find a valid identifier for this NFT');
      }

      console.log(`Delisting NFT with identifier: ${nftTokenId}`);
      
      setProcessingStatus('Creating delisting transaction...');
      const result = await nftService.cancelNFTListing(nftTokenId);
      
      if (result.success) {
        console.log('NFT delisted successfully:', result);
        setStep('success');
        setProcessingStatus('NFT delisted successfully!');
        // Wait a moment before closing to show success state
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        setError('Delisting failed. Please try again.');
        setStep('confirm');
      }
    } catch (err) {
      console.error('Error delisting NFT:', err);
      setStep('confirm');
      
      // Extract detailed error message if possible
      let errorMessage = 'Failed to delist NFT';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        errorMessage = (err as any).message || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>Delist NFT</h3>
          <button 
            className={styles.closeButton} 
            onClick={onClose}
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        {step === 'confirm' && (
          <div className={styles.modalContent}>
            <div className={styles.nftPreview}>
              <div className={styles.nftImage}>
                <img src={nft.image} alt={nft.name} />
              </div>
              <div className={styles.nftInfo}>
                <h4>{nft.name}</h4>
                <div className={styles.tokenIdContainer}>
                  <span className={styles.tokenIdLabel}>ID:</span>
                  <span 
                    className={styles.tokenIdValue} 
                    title={nft.tokenId || nft.transactionHash || nft.id || 'Unknown'}
                  >
                    {truncateString(nft.tokenId || nft.transactionHash || nft.id || 'Unknown', 16)}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.confirmMessage}>
              <p>Are you sure you want to delist this NFT from the marketplace?</p>
              <p>This will remove the NFT from sale listings, but it will remain in your wallet.</p>
            </div>

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
                className={styles.listButton}
                onClick={handleDelistNFT}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Delist NFT'}
              </button>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className={styles.modalContent}>
            <div className={styles.processingContainer}>
              <div className={styles.spinner}></div>
              <p className={styles.processingStatus}>{processingStatus}</p>
              <p className={styles.processingNote}>Please approve the transaction in your wallet when prompted</p>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className={styles.modalContent}>
            <div className={styles.successContainer}>
              <div className={styles.successIcon}>✓</div>
              <h4>Success!</h4>
              <p>Your NFT has been delisted from the marketplace</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DelistNFTModal; 