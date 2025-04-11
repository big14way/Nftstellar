import { useState } from 'react';
import { NFT } from '@/types/nft';
import { nftService } from '@/services/nft.service';
import styles from '@/styles/ListNFTModal.module.css';

interface ListNFTModalProps {
  nft: NFT;
  onClose: () => void;
  onSuccess: () => void;
}

const ListNFTModal: React.FC<ListNFTModalProps> = ({ nft, onClose, onSuccess }) => {
  const [price, setPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidPrice, setIsValidPrice] = useState(false);
  const [step, setStep] = useState<'input' | 'processing' | 'success'>('input');
  const [processingStatus, setProcessingStatus] = useState('Preparing transaction...');

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPrice(value);
    
    // Validate price - must be numeric and greater than 0
    const numValue = parseFloat(value);
    setIsValidPrice(!isNaN(numValue) && numValue > 0);
    setError(null);
  };

  // Function to truncate a string with ellipsis
  const truncateString = (str: string, maxLength: number = 10): string => {
    if (!str) return 'Unknown';
    if (str.length <= maxLength) return str;
    const start = str.substring(0, maxLength / 2);
    const end = str.substring(str.length - maxLength / 2);
    return `${start}...${end}`;
  };

  const handleListNFT = async () => {
    if (!isValidPrice) {
      setError('Please enter a valid price.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setStep('processing');
      setProcessingStatus('Preparing to list NFT...');

      // Use tokenId if available, otherwise fall back to id
      const nftTokenId = nft.tokenId || nft.id;
      
      if (!nftTokenId) {
        throw new Error('Unable to find a valid identifier for this NFT');
      }

      console.log(`Listing NFT with identifier: ${nftTokenId}`);
      
      // Log detailed information about the listing attempt
      console.log('NFT listing details:', {
        tokenId: nftTokenId,
        price: price,
        nftData: {
          name: nft.name,
          image: nft.image,
          description: nft.description?.substring(0, 50) + '...'
        }
      });
      
      setProcessingStatus('Creating listing transaction...');
      const result = await nftService.listNFTForSale(nftTokenId, price);
      
      if (result.success) {
        console.log('NFT listed successfully:', result);
        
        setStep('success');
        setProcessingStatus('NFT listed successfully!');
        // Wait a moment before closing to show success state
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        setError('Listing failed. Please try again.');
        setStep('input');
      }
    } catch (err) {
      console.error('Error listing NFT:', err);
      setStep('input');
      
      // Extract detailed error message if possible
      let errorMessage = 'Failed to list NFT for sale';
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
          <h3>List NFT for Sale</h3>
          <button 
            className={styles.closeButton} 
            onClick={onClose}
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        {step === 'input' && (
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
                    title={nft.tokenId || nft.id || 'Unknown'}
                  >
                    {truncateString(nft.tokenId || nft.id || 'Unknown', 16)}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="price">Price (XLM)</label>
              <div className={styles.priceInputContainer}>
                <input
                  id="price"
                  type="number"
                  placeholder="Enter price in XLM"
                  value={price}
                  onChange={handlePriceChange}
                  disabled={isLoading}
                  min="0.000001"
                  step="0.000001"
                  className={`${styles.input} ${!isValidPrice && price ? styles.inputError : ''}`}
                />
                <span className={styles.currencySymbol}>XLM</span>
              </div>
              {!isValidPrice && price && (
                <p className={styles.validationMessage}>Please enter a valid price greater than 0</p>
              )}
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.feeInfo}>
              <p>
                <span className={styles.feeLabel}>Platform Fee:</span>
                <span className={styles.feeValue}>2.5%</span>
              </p>
              {nft.royaltyPercentage && nft.royaltyPercentage > 0 && (
                <p>
                  <span className={styles.feeLabel}>Creator Royalty:</span>
                  <span className={styles.feeValue}>{nft.royaltyPercentage}%</span>
                </p>
              )}
              {isValidPrice && (
                <p>
                  <span className={styles.feeLabel}>You'll Receive:</span>
                  <span className={styles.feeValue}>
                    {(parseFloat(price) * (1 - (0.025 + (nft.royaltyPercentage || 0) / 100))).toFixed(6)} XLM
                  </span>
                </p>
              )}
            </div>

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
                onClick={handleListNFT}
                disabled={!isValidPrice || isLoading}
              >
                {isLoading ? 'Listing...' : 'List for Sale'}
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
              <p>Your NFT has been listed for sale</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListNFTModal; 