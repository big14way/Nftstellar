import { useState } from 'react';
import { NFT } from '@/types/nft';
import { nftService } from '@/services/nft.service';
import styles from '@/styles/TransferNFTModal.module.css';

interface TransferNFTModalProps {
  nft: NFT;
  onClose: () => void;
  onSuccess: () => void;
}

const TransferNFTModal: React.FC<TransferNFTModalProps> = ({ nft, onClose, onSuccess }) => {
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddressValid, setIsAddressValid] = useState(false);

  // Function to truncate a string with ellipsis
  const truncateString = (str: string, maxLength: number = 10): string => {
    if (!str) return 'Unknown';
    if (str.length <= maxLength) return str;
    const start = str.substring(0, maxLength / 2);
    const end = str.substring(str.length - maxLength / 2);
    return `${start}...${end}`;
  };

  const validateStellarAddress = (address: string) => {
    // Basic Stellar address validation (starts with G and is 56 characters)
    return /^G[A-Za-z0-9]{55}$/.test(address.trim());
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const address = e.target.value;
    setRecipientAddress(address);
    setIsAddressValid(validateStellarAddress(address));
    setError(null);
  };

  const handleTransfer = async () => {
    if (!isAddressValid) {
      setError('Please enter a valid Stellar address');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Debug logging to see what's being passed
      console.log('Attempting to transfer NFT with details:', {
        tokenId: nft.tokenId,
        id: nft.id,
        transactionHash: nft.transactionHash,
        allProps: JSON.stringify(nft)
      });

      // Look for CID in attributes if available
      let cidFromAttributes = '';
      if (nft.attributes) {
        const cidAttribute = nft.attributes.find(attr => 
          attr.trait_type === 'ipfs_cid' || attr.trait_type === 'cid'
        );
        if (cidAttribute) {
          cidFromAttributes = String(cidAttribute.value);
        }
      }
      
      // Try to identify the right ID to use - prioritize CIDs
      // CIDs typically start with "Qm" for IPFS v0
      const isCID = (id: string) => id && typeof id === 'string' && id.startsWith('Qm');
      
      // Choose the best identifier (prioritize CIDs)
      let idToUse = nft.tokenId;
      
      // If tokenId doesn't look like a CID but another field does, use that instead
      if (!isCID(idToUse)) {
        if (isCID(cidFromAttributes)) {
          console.log('Using CID from attributes instead of tokenId');
          idToUse = cidFromAttributes;
        } else if (isCID(nft.id)) {
          console.log('Using ID instead of tokenId');
          idToUse = nft.id;
        } else if (isCID(nft.transactionHash)) {
          console.log('Using transactionHash instead of tokenId');
          idToUse = nft.transactionHash;
        }
      }
      
      console.log('Final ID being used for transfer:', idToUse);
      const result = await nftService.transferNFT(idToUse, recipientAddress.trim());
      
      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError('Transfer failed. Please try again.');
      }
    } catch (err) {
      console.error('Error transferring NFT:', err);
      setError(err instanceof Error ? err.message : 'Failed to transfer NFT');
    } finally {
      setIsLoading(false);
    }
  };

  // Get token identifier - use tokenId if available, otherwise use fallbacks
  const tokenIdentifier = nft.tokenId || nft.transactionHash || nft.id || 'Unknown';

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>Transfer NFT</h3>
          <button 
            className={styles.closeButton} 
            onClick={onClose}
            disabled={isLoading}
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
              <div className={styles.tokenIdContainer}>
                <span className={styles.tokenIdLabel}>ID:</span>
                <span 
                  className={styles.tokenIdValue} 
                  title={tokenIdentifier}
                >
                  {truncateString(tokenIdentifier, 16)}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="recipient-address">Recipient Address</label>
            <input
              id="recipient-address"
              type="text"
              placeholder="Enter Stellar address (starts with G)"
              value={recipientAddress}
              onChange={handleAddressChange}
              disabled={isLoading}
              className={`${styles.input} ${!isAddressValid && recipientAddress ? styles.inputError : ''}`}
            />
            {!isAddressValid && recipientAddress && (
              <p className={styles.validationMessage}>Please enter a valid Stellar address</p>
            )}
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.warningMessage}>
            <p>
              Warning: This action is irreversible. Once transferred, you will no longer have access to this NFT.
            </p>
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
              className={styles.transferButton}
              onClick={handleTransfer}
              disabled={!isAddressValid || isLoading}
            >
              {isLoading ? 'Transferring...' : 'Transfer NFT'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferNFTModal; 