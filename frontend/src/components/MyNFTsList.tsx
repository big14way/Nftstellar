import React, { useState, useEffect } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { nftService } from '@/services/nft.service';
import styles from '@/styles/MyNFTs.module.css';

interface NFT {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

const MyNFTsList: React.FC = () => {
  const { publicKey } = useWallet();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'owned' | 'created' | 'listed'>('owned');

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

        let fetchedNFTs: NFT[] = [];
        if (activeTab === 'owned') {
          fetchedNFTs = await nftService.getNFTsByOwner(publicKey);
        } else if (activeTab === 'created') {
          fetchedNFTs = await nftService.getNFTsByCreator(publicKey);
        }
        // Note: 'listed' tab will be implemented later with marketplace functionality

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

  if (!publicKey) {
    return (
      <div className={styles.container}>
        <div className={styles.message}>
          Please connect your wallet to view your NFTs
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          Loading your NFTs...
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
          className={`${styles.tab} ${activeTab === 'owned' ? styles.active : ''}`}
          onClick={() => setActiveTab('owned')}
        >
          Owned
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'created' ? styles.active : ''}`}
          onClick={() => setActiveTab('created')}
        >
          Created
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'listed' ? styles.active : ''}`}
          onClick={() => setActiveTab('listed')}
        >
          Listed
        </button>
      </div>

      {nfts.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No NFTs found in this category</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {nfts.map((nft, index) => (
            <div key={index} className={styles.card}>
              <div className={styles.imageContainer}>
                <img src={nft.image} alt={nft.name} className={styles.image} />
              </div>
              <div className={styles.content}>
                <h3>{nft.name}</h3>
                <p>{nft.description}</p>
                {nft.attributes?.map((attr, i) => (
                  <div key={i} className={styles.attribute}>
                    <span className={styles.traitType}>{attr.trait_type}:</span>
                    <span className={styles.traitValue}>{attr.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyNFTsList; 