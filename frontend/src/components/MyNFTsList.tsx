import React, { useState, useEffect } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import styles from '@/styles/MyNFTs.module.css';

interface NFT {
  id: string;
  name: string;
  description: string;
  image: string;
  owner: string;
  price?: string;
  isListed?: boolean;
}

const MyNFTsList: React.FC = () => {
  const { publicKey } = useWallet();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'owned' | 'created' | 'listed'>('owned');

  // Mock data for development - replace with actual API calls later
  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        // Simulating API call
        const mockNFTs: NFT[] = [
          {
            id: '1',
            name: 'Cosmic Explorer #1',
            description: 'A unique space-themed NFT',
            image: '/nft-samples/space-1.jpg',
            owner: publicKey || '',
            price: '100',
            isListed: false
          },
          {
            id: '2',
            name: 'Digital Art #2',
            description: 'Abstract digital artwork',
            image: '/nft-samples/art-2.jpg',
            owner: publicKey || '',
            price: '150',
            isListed: true
          },
          // Add more mock NFTs as needed
        ];

        setNfts(mockNFTs);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching NFTs:', error);
        setLoading(false);
      }
    };

    if (publicKey) {
      fetchNFTs();
    }
  }, [publicKey]);

  const filteredNFTs = nfts.filter(nft => {
    switch (activeTab) {
      case 'owned':
        return nft.owner === publicKey && !nft.isListed;
      case 'created':
        return nft.owner === publicKey;
      case 'listed':
        return nft.isListed && nft.owner === publicKey;
      default:
        return false;
    }
  });

  if (loading) {
    return (
      <div className={styles.loading}>
        Loading your NFTs...
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

      {filteredNFTs.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No NFTs found in this category</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredNFTs.map((nft) => (
            <div key={nft.id} className={styles.card}>
              <div className={styles.imageContainer}>
                <img src={nft.image} alt={nft.name} className={styles.image} />
              </div>
              <div className={styles.content}>
                <h3>{nft.name}</h3>
                <p>{nft.description}</p>
                {nft.price && (
                  <p className={styles.price}>
                    {nft.price} XLM
                  </p>
                )}
                <div className={styles.actions}>
                  {nft.isListed ? (
                    <button 
                      className={styles.button}
                      onClick={() => {/* Add delist functionality */}}
                    >
                      Delist
                    </button>
                  ) : (
                    <button 
                      className={styles.button}
                      onClick={() => {/* Add list functionality */}}
                    >
                      List for Sale
                    </button>
                  )}
                  <button 
                    className={`${styles.button} ${styles.secondary}`}
                    onClick={() => {/* Add transfer functionality */}}
                  >
                    Transfer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyNFTsList; 