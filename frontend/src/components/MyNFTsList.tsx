import React, { useState, useEffect } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { nftService } from '@/services/nft.service';
import { NFT } from '@/types/nft';
import styles from '@/styles/MyNFTs.module.css';
import Image from 'next/image';
import ListNFTModal from './ListNFTModal';
import TransferNFTModal from './TransferNFTModal';
import DelistNFTModal from './DelistNFTModal';
import NFTPlaceholder from './NFTPlaceholder';
import { NFT_CONFIG } from '@/config/nft.config';

// Define a type that can hold both NFT and the service's NFTMetadata structure
type DisplayNFT = {
  id?: string;
  tokenId?: string;
  name: string;
  description?: string;
  image: string;
  price?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  transactionHash?: string;
  created_at?: string;
  owner?: string;
  creator?: string;
  metadata?: Record<string, any>;
  royaltyPercentage?: number;
  collection?: string;
};

// Type for transaction history
interface Transaction {
  id: string;
  hash: string;
  type: string;
  details: any;
  timestamp: string;
  ledger: number;
  fee_paid: string;
}

const MyNFTsList: React.FC = () => {
  const { publicKey } = useWallet();
  const [nfts, setNfts] = useState<DisplayNFT[]>([]);
  const [listedNFTs, setListedNFTs] = useState<DisplayNFT[]>([]);
  const [receivedNFTs, setReceivedNFTs] = useState<DisplayNFT[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'owned' | 'created' | 'listed' | 'received' | 'history'>('owned');
  const [selectedNFT, setSelectedNFT] = useState<DisplayNFT | null>(null);
  const [modalType, setModalType] = useState<'list' | 'transfer' | 'delist' | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!publicKey) {
        setNfts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        let fetchedNFTs: DisplayNFT[] = [];
        
        if (activeTab === 'owned') {
          fetchedNFTs = await nftService.getNFTsByOwner(publicKey);
        } else if (activeTab === 'created') {
          fetchedNFTs = await nftService.getNFTsByCreator(publicKey);
        } else if (activeTab === 'listed') {
          // Filter owned NFTs that have a price (are listed)
          const ownedNFTs = await nftService.getNFTsByOwner(publicKey);
          fetchedNFTs = ownedNFTs.filter(nft => nft.price !== undefined);
          setListedNFTs(fetchedNFTs);
        } else if (activeTab === 'received') {
          fetchedNFTs = await nftService.getNFTsReceivedByUser(publicKey);
          setReceivedNFTs(fetchedNFTs);
        } else if (activeTab === 'history') {
          const history = await nftService.getTransactionHistory(publicKey);
          setTransactions(history);
          fetchedNFTs = []; // No NFTs to display in history tab
        }

        setNfts(fetchedNFTs);
      } catch (err) {
        console.error('Error fetching NFTs:', err);
        setError('Failed to fetch NFTs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, [publicKey, activeTab]);

  const handleListNFT = (nft: DisplayNFT) => {
    setSelectedNFT(nft);
    setModalType('list');
  };

  const handleTransferNFT = (nft: DisplayNFT) => {
    setSelectedNFT(nft);
    setModalType('transfer');
  };

  const handleDelistNFT = (nft: DisplayNFT) => {
    setSelectedNFT(nft);
    setModalType('delist');
  };

  const handleCloseModal = () => {
    setSelectedNFT(null);
    setModalType(null);
  };

  const handleActionSuccess = async () => {
    // Refresh the NFT list after successful action
    if (publicKey) {
      setLoading(true);
      try {
        // Get the latest NFT data from the blockchain
        const ownedNFTs = await nftService.getNFTsByOwner(publicKey);
        
        // Update listed NFTs
        const listed = ownedNFTs.filter(nft => nft.price !== undefined);
        setListedNFTs(listed);
        
        // For transfer actions, remove the NFT immediately from the UI
        if (selectedNFT && modalType === 'transfer') {
          console.log(`Refreshing NFTs after transfer of ${selectedNFT.name}`);
          setNfts(prevNfts => prevNfts.filter(nft => 
            nft.tokenId !== selectedNFT.tokenId && 
            nft.id !== selectedNFT.id &&
            nft.transactionHash !== selectedNFT.transactionHash
          ));
        } else {
          // Update NFTs based on active tab
          if (activeTab === 'owned') {
            setNfts(ownedNFTs);
          } else if (activeTab === 'created') {
            const createdNFTs = await nftService.getNFTsByCreator(publicKey);
            setNfts(createdNFTs);
          } else if (activeTab === 'listed') {
            setNfts(listed);
          } else if (activeTab === 'received') {
            const received = await nftService.getNFTsReceivedByUser(publicKey);
            setNfts(received);
            setReceivedNFTs(received);
          } else if (activeTab === 'history') {
            const history = await nftService.getTransactionHistory(publicKey);
            setTransactions(history);
          }
        }
        
        // Close the modal
        setSelectedNFT(null);
        setModalType(null);
        
        console.log(`Refreshed NFTs for ${activeTab} tab`);
      } catch (error) {
        console.error('Error refreshing NFTs:', error);
        setError('Failed to refresh NFTs. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleImageError = (nftId: string) => {
    setImageErrors(prev => ({ ...prev, [nftId]: true }));
  };

  if (!publicKey) {
    return (
      <div className={styles.container}>
        <div className={styles.message}>
          Please connect your wallet to view your NFTs
        </div>
      </div>
    );
  }

  if (loading && nfts.length === 0 && transactions.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          Loading your data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'owned' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('owned')}
        >
          Owned
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'created' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('created')}
        >
          Created
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'listed' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('listed')}
        >
          Listed
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'received' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('received')}
        >
          Received
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'history' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
      </div>

      {activeTab !== 'history' ? (
        // Display NFTs grid for all tabs except history
        nfts.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No NFTs found in this category</p>
            {activeTab === 'owned' && (
              <p>
                Explore the marketplace to find and buy NFTs
              </p>
            )}
            {activeTab === 'created' && (
              <p>
                Start creating your own NFTs to see them here
              </p>
            )}
            {activeTab === 'listed' && (
              <p>
                List your NFTs for sale to see them here
              </p>
            )}
            {activeTab === 'received' && (
              <p>
                You haven't received any NFTs from other users yet
              </p>
            )}
          </div>
        ) : (
          <div className={styles.grid}>
            {nfts.map(nft => (
              <div key={nft.tokenId || nft.id} className={styles.card}>
                <div className={styles.imageContainer}>
                  {imageErrors[nft.id || ''] ? (
                    <NFTPlaceholder />
                  ) : (
                    <img
                      src={nft.image}
                      alt={nft.name}
                      className={styles.image}
                      onError={() => handleImageError(nft.id || '')}
                    />
                  )}
                </div>
                <div className={styles.content}>
                  <h3 className={styles.title}>{nft.name}</h3>
                  <p className={styles.description}>{nft.description?.substring(0, 60)}{nft.description && nft.description.length > 60 ? '...' : ''}</p>
                  
                  {nft.price && (
                    <div className={styles.price}>
                      <span className={styles.priceLabel}>Listed Price:</span>
                      <span className={styles.priceValue}>{nft.price} XLM</span>
                    </div>
                  )}
                  
                  {nft.attributes && nft.attributes.length > 0 && (
                    <div className={styles.attributes}>
                      {nft.attributes.map((attr, index) => (
                        <div key={index} className={styles.attribute}>
                          <span className={styles.traitType}>{attr.trait_type}:</span>
                          <span className={styles.traitValue}>{attr.value.toString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className={styles.actions}>
                    {(activeTab === 'owned' || activeTab === 'received') && (
                      <>
                        <button 
                          className={styles.listButton}
                          onClick={() => handleListNFT(nft)}
                        >
                          List for Sale
                        </button>
                        <button 
                          className={styles.transferButton}
                          onClick={() => handleTransferNFT(nft)}
                        >
                          Transfer
                        </button>
                      </>
                    )}
                    
                    {activeTab === 'listed' && (
                      <button 
                        className={styles.delistButton}
                        onClick={() => handleDelistNFT(nft)}
                      >
                        Delist
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        // Display transaction history
        <div className={styles.historyContainer}>
          <h2>Transaction History</h2>
          {transactions.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No transaction history found</p>
            </div>
          ) : (
            <div className={styles.historyList}>
              {transactions.map(tx => (
                <div key={tx.id} className={styles.historyItem}>
                  <div className={styles.txType}>
                    {tx.type === 'mint' && <span className={styles.mintBadge}>Mint</span>}
                    {tx.type === 'transfer_sent' && <span className={styles.sentBadge}>Sent</span>}
                    {tx.type === 'transfer_received' && <span className={styles.receivedBadge}>Received</span>}
                    {tx.type === 'list' && <span className={styles.listBadge}>Listed</span>}
                    {tx.type === 'delist' && <span className={styles.delistBadge}>Delisted</span>}
                    {tx.type === 'unknown' && <span className={styles.unknownBadge}>Other</span>}
                  </div>
                  <div className={styles.txDetails}>
                    {tx.type === 'mint' && tx.details.metadata && (
                      <p>Minted "{tx.details.metadata.name}" NFT</p>
                    )}
                    {tx.type === 'transfer_sent' && (
                      <p>Sent NFT to {tx.details.recipient.substring(0, 6)}...{tx.details.recipient.substring(tx.details.recipient.length - 4)}</p>
                    )}
                    {tx.type === 'transfer_received' && (
                      <p>Received NFT from {tx.details.sender.substring(0, 6)}...{tx.details.sender.substring(tx.details.sender.length - 4)}</p>
                    )}
                    {tx.type === 'list' && (
                      <p>Listed NFT for {tx.details.price} XLM</p>
                    )}
                    {tx.type === 'delist' && (
                      <p>Removed NFT listing from marketplace</p>
                    )}
                    {tx.type === 'unknown' && (
                      <p>Stellar transaction</p>
                    )}
                  </div>
                  <div className={styles.txMeta}>
                    <div className={styles.txTime}>{formatDate(tx.timestamp)}</div>
                    <a 
                      href={`https://${NFT_CONFIG.NETWORK === 'testnet' ? 'testnet.' : ''}stellar.expert/explorer/public/tx/${tx.hash}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.txLink}
                    >
                      View on Explorer
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedNFT && modalType === 'list' && (
        <ListNFTModal
          nft={selectedNFT as NFT}
          onClose={handleCloseModal}
          onSuccess={handleActionSuccess}
        />
      )}

      {selectedNFT && modalType === 'transfer' && (
        <TransferNFTModal
          nft={selectedNFT as NFT}
          onClose={handleCloseModal}
          onSuccess={handleActionSuccess}
        />
      )}
      
      {selectedNFT && modalType === 'delist' && (
        <DelistNFTModal
          nft={selectedNFT as NFT}
          onClose={handleCloseModal}
          onSuccess={handleActionSuccess}
        />
      )}
    </div>
  );
};

export default MyNFTsList; 