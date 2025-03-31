import { useState, useEffect } from 'react';
import { useAppContext } from '../providers/AppContext';
import Layout from '../components/Layout';
import styles from '../styles/MyNFTs.module.css';

// Sample owned NFT data
const mockOwnedNFTs = [
  {
    id: '1',
    title: 'Cosmic Voyager',
    description: 'Journey through the stellar network',
    image: 'https://picsum.photos/id/1/400/400',
    price: '100',
    isListed: true,
    creator: 'GCEC7GHYOTQTOJ5JBH3YNHRCQP6LHMIJE3CZRDIT3SE4VIRFTMQIQ4MC',
  },
  {
    id: '4',
    title: 'Stellar Gateway',
    description: 'Portal to the world of blockchain',
    image: 'https://picsum.photos/id/24/400/400',
    price: '0',
    isListed: false,
    creator: 'GCEC7GHYOTQTOJ5JBH3YNHRCQP6LHMIJE3CZRDIT3SE4VIRFTMQIQ4MC',
  },
];

// Sample created NFT data
const mockCreatedNFTs = [
  {
    id: '1',
    title: 'Cosmic Voyager',
    description: 'Journey through the stellar network',
    image: 'https://picsum.photos/id/1/400/400',
    price: '100',
    isListed: true,
    owner: 'GCEC7GHYOTQTOJ5JBH3YNHRCQP6LHMIJE3CZRDIT3SE4VIRFTMQIQ4MC',
  },
  {
    id: '4',
    title: 'Stellar Gateway',
    description: 'Portal to the world of blockchain',
    image: 'https://picsum.photos/id/24/400/400',
    price: '0',
    isListed: false,
    owner: 'GCEC7GHYOTQTOJ5JBH3YNHRCQP6LHMIJE3CZRDIT3SE4VIRFTMQIQ4MC',
  },
  {
    id: '2',
    title: 'Digital Horizon',
    description: 'Where technology meets art',
    image: 'https://picsum.photos/id/20/400/400',
    price: '150',
    isListed: true,
    owner: 'GBEZLFBWZIOAY5WNMOW7FEV7YVHG4GVD7HPMKY6JGAU4ODHFZJX2HOLN',
  },
];

type OwnedNFT = {
  id: string;
  title: string;
  description: string;
  image: string;
  price: string;
  isListed: boolean;
  creator: string;
};

type CreatedNFT = {
  id: string;
  title: string;
  description: string;
  image: string;
  price: string;
  isListed: boolean;
  owner: string;
};

const NFTCard = ({ 
  nft, 
  type, 
  onList, 
  onDelist 
}: { 
  nft: OwnedNFT | CreatedNFT; 
  type: 'owned' | 'created';
  onList: (id: string) => void;
  onDelist: (id: string) => void;
}) => {
  const isOwned = type === 'owned';
  const isListed = 'isListed' in nft && nft.isListed;
  const nftPrice = nft.price !== '0' ? `${nft.price} XLM` : 'Not listed';
  
  return (
    <div className={styles.nftCard}>
      <div className={styles.imageContainer}>
        <img src={nft.image} alt={nft.title} className={styles.nftImage} />
        {isListed && (
          <div className={styles.listedBadge}>Listed</div>
        )}
      </div>
      <div className={styles.nftDetails}>
        <h3 className={styles.nftTitle}>{nft.title}</h3>
        <p className={styles.nftDescription}>{nft.description}</p>
        <div className={styles.nftInfo}>
          <p className={styles.nftPrice}>{nftPrice}</p>
          {!isOwned && 'owner' in nft && (
            <p className={styles.nftOwner}>
              Owner: {nft.owner.substring(0, 4)}...{nft.owner.substring(nft.owner.length - 4)}
            </p>
          )}
          {isOwned && 'creator' in nft && (
            <p className={styles.nftCreator}>
              Creator: {nft.creator.substring(0, 4)}...{nft.creator.substring(nft.creator.length - 4)}
            </p>
          )}
        </div>
        
        {isOwned && (
          <div className={styles.actionButtons}>
            {isListed ? (
              <button 
                className={styles.delistButton} 
                onClick={() => onDelist(nft.id)}
              >
                Delist NFT
              </button>
            ) : (
              <button 
                className={styles.listButton} 
                onClick={() => onList(nft.id)}
              >
                List for Sale
              </button>
            )}
            <button className={styles.transferButton}>
              Transfer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const MyNFTsPage = () => {
  const { state } = useAppContext();
  const { isConnected, walletKey } = state;
  
  const [activeTab, setActiveTab] = useState('owned');
  const [ownedNFTs, setOwnedNFTs] = useState<OwnedNFT[]>([]);
  const [createdNFTs, setCreatedNFTs] = useState<CreatedNFT[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClientSide, setIsClientSide] = useState(false);
  
  // Set client-side flag
  useEffect(() => {
    setIsClientSide(true);
  }, []);
  
  // Fetch NFTs owned and created by the user
  useEffect(() => {
    if (!isClientSide || !isConnected || !walletKey) {
      return;
    }
    
    const fetchNFTs = async () => {
      setIsLoading(true);
      
      try {
        // In a real implementation, fetch from blockchain
        // For now, use mock data
        setTimeout(() => {
          setOwnedNFTs(mockOwnedNFTs);
          setCreatedNFTs(mockCreatedNFTs);
          setIsLoading(false);
        }, 1000);
        
        // Example of real implementation:
        // const nftClient = await getNFTClient();
        // const userNFTs = await nftClient.getNFTsByOwner(walletKey);
        // const createdNFTs = await nftClient.getNFTsByCreator(walletKey);
        // setOwnedNFTs(userNFTs);
        // setCreatedNFTs(createdNFTs);
      } catch (error) {
        console.error('Error fetching NFTs:', error);
        setIsLoading(false);
      }
    };
    
    fetchNFTs();
  }, [isConnected, walletKey, isClientSide]);
  
  // List an NFT for sale
  const handleListNFT = (id: string) => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }
    
    // Show price input dialog (simplified version)
    const price = prompt('Enter listing price in XLM:');
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      alert('Please enter a valid price');
      return;
    }
    
    // In a real implementation, this would call the smart contract
    console.log(`Listing NFT ${id} for ${price} XLM`);
    
    // Update the local state to reflect the change
    setOwnedNFTs(prevNFTs => 
      prevNFTs.map(nft => 
        nft.id === id 
          ? { ...nft, isListed: true, price } 
          : nft
      )
    );
  };
  
  // Delist an NFT from sale
  const handleDelistNFT = (id: string) => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }
    
    // In a real implementation, this would call the smart contract
    console.log(`Delisting NFT ${id}`);
    
    // Update the local state to reflect the change
    setOwnedNFTs(prevNFTs => 
      prevNFTs.map(nft => 
        nft.id === id 
          ? { ...nft, isListed: false, price: '0' } 
          : nft
      )
    );
  };
  
  if (!isClientSide) {
    return null; // Avoid rendering on server
  }
  
  return (
    <Layout>
      <div className={styles.container}>
        <h1 className={styles.title}>My NFTs</h1>
        
        {!isConnected ? (
          <div className={styles.walletWarning}>
            <p>Please connect your wallet to view your NFTs</p>
          </div>
        ) : (
          <>
            <div className={styles.tabsContainer}>
              <button 
                className={`${styles.tab} ${activeTab === 'owned' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('owned')}
              >
                NFTs I Own
              </button>
              <button 
                className={`${styles.tab} ${activeTab === 'created' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('created')}
              >
                NFTs I Created
              </button>
            </div>
            
            {isLoading ? (
              <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Loading your NFTs...</p>
              </div>
            ) : (
              <div className={styles.nftContent}>
                {activeTab === 'owned' && (
                  <>
                    <div className={styles.tabDescription}>
                      <p>NFTs currently in your wallet. You can list these for sale or transfer them to other addresses.</p>
                    </div>
                    
                    {ownedNFTs.length > 0 ? (
                      <div className={styles.nftGrid}>
                        {ownedNFTs.map(nft => (
                          <NFTCard 
                            key={nft.id} 
                            nft={nft} 
                            type="owned" 
                            onList={handleListNFT}
                            onDelist={handleDelistNFT}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className={styles.emptyState}>
                        <p>You don't own any NFTs yet</p>
                        <a href="/browse" className={styles.browseLink}>Browse Marketplace</a>
                      </div>
                    )}
                  </>
                )}
                
                {activeTab === 'created' && (
                  <>
                    <div className={styles.tabDescription}>
                      <p>NFTs you've created. Track ownership and sales of your creations.</p>
                    </div>
                    
                    {createdNFTs.length > 0 ? (
                      <div className={styles.nftGrid}>
                        {createdNFTs.map(nft => (
                          <NFTCard 
                            key={nft.id} 
                            nft={nft} 
                            type="created" 
                            onList={handleListNFT}
                            onDelist={handleDelistNFT}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className={styles.emptyState}>
                        <p>You haven't created any NFTs yet</p>
                        <a href="/create" className={styles.createLink}>Create an NFT</a>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default MyNFTsPage; 