import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import styles from '@/styles/Browse.module.css';
import { FaSearch, FaFilter, FaHeart, FaStore, FaTag } from 'react-icons/fa';
import { useWallet } from '@/contexts/WalletContext';
import Image from 'next/image';
import { nftService } from '@/services/nft.service';
import { NFT_CONFIG } from '@/config/nft.config';

interface NFT {
  id: string;
  title: string;
  description: string;
  image: string;
  price: number | string;
  creator: string;
  owner?: string;
  likes: number;
  createdAt: string;
  isListed?: boolean;
  tokenId?: string;
}

const BrowsePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('listed');
  const [sortBy, setSortBy] = useState('recent');
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const { isConnected, publicKey, connect } = useWallet();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');

  // Fetch NFTs from Stellar
  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let marketplaceNFTs: NFT[] = [];

        // Use the NFT service to fetch real NFTs
        try {
          console.log('Fetching marketplace NFTs...');
          const rawNFTs = await nftService.getMarketplaceNFTs(30);
          
          if (rawNFTs && rawNFTs.length > 0) {
            console.log(`Processed ${rawNFTs.length} NFTs from the blockchain`);
            marketplaceNFTs = rawNFTs.map(nft => ({
              id: nft.id || nft.transactionHash || Math.random().toString(36).substr(2, 9),
              title: nft.name || 'Untitled NFT',
              description: nft.description || 'No description provided',
              image: nft.image || '/nft-placeholder.png',
              price: nft.price || '0',
              creator: nft.attributes?.find(attr => attr.trait_type === 'creator')?.value?.toString() || 'Unknown',
              owner: nft.attributes?.find(attr => attr.trait_type === 'owner')?.value?.toString() || nft.owner || 'Unknown',
              likes: Math.floor(Math.random() * 100), // Random likes for demo
              createdAt: nft.created_at || new Date().toISOString(),
              isListed: nft.isListed === true, // Ensure isListed is a boolean
              tokenId: nft.tokenId || nft.id
            }));
            
            console.log('Listed NFTs:', marketplaceNFTs.filter(nft => nft.isListed).length);
          }
        } catch (e) {
          console.error('Error fetching real NFTs:', e);
          setError('Failed to fetch NFTs. Using fallback data instead.');
          
          // Fallback to mock data if service call fails
          marketplaceNFTs = [
            {
              id: '1',
              title: 'Cosmic Horizon',
              description: 'A mesmerizing view of the cosmic horizon',
              image: '/nft-samples/cosmic.jpg',
              price: 100,
              creator: publicKey || 'GC7743KM...CL2HZTZL',
              owner: publicKey || 'GC7743KM...CL2HZTZL',
              likes: 42,
              createdAt: '2024-03-20',
              isListed: true
            },
            {
              id: '2',
              title: 'Stellar Dreams',
              description: 'A journey through the Stellar network',
              image: '/nft-samples/stellar-dreams.jpg',
              price: 150,
              creator: publicKey || 'GC7743KM...CL2HZTZL',
              owner: publicKey || 'GC7743KM...CL2HZTZL',
              likes: 28,
              createdAt: '2024-03-19',
              isListed: true
            },
            {
              id: '3',
              title: 'Digital Nebula',
              description: 'Abstract representation of a digital nebula',
              image: '/nft-samples/nebula.jpg',
              price: 200,
              creator: 'GA8TZE...ST2LME',
              owner: 'GA8TZE...ST2LME',
              likes: 56,
              createdAt: '2024-03-18',
              isListed: true
            }
          ];
        }
        
        setNfts(marketplaceNFTs);
      } catch (err) {
        console.error('Error in fetchNFTs:', err);
        setError('Something went wrong. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, [publicKey]);

  const filteredNFTs = nfts
    .filter((nft) => {
      if (searchTerm) {
        return (
          nft.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          nft.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      return true;
    })
    .filter((nft) => {
      if (filter === 'owned') return nft.owner === publicKey;
      if (filter === 'created') return nft.creator === publicKey;
      if (filter === 'listed') return nft.isListed === true;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'recent') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'price-low') {
        const priceA = typeof a.price === 'string' ? parseFloat(a.price) : a.price;
        const priceB = typeof b.price === 'string' ? parseFloat(b.price) : b.price;
        return priceA - priceB;
      }
      if (sortBy === 'price-high') {
        const priceA = typeof a.price === 'string' ? parseFloat(a.price) : a.price;
        const priceB = typeof b.price === 'string' ? parseFloat(b.price) : b.price;
        return priceB - priceA;
      }
      if (sortBy === 'popular') return b.likes - a.likes;
      return 0;
    });

  const handleNFTClick = (nft: NFT) => {
    setSelectedNFT(nft);
  };
  
  const handleBuyNFT = async (nft: NFT) => {
    if (!isConnected) {
      try {
        await connect();
      } catch (error) {
        console.error('Failed to connect wallet:', error);
        return;
      }
    }
    
    try {
      setIsProcessing(true);
      setProcessingMessage('Processing your purchase...');
      
      // Call the buyNFT method from nftService
      const result = await nftService.buyNFT(nft.tokenId || nft.id, nft.price.toString());
      
      if (result.success) {
        setProcessingMessage('Purchase successful! The NFT is now in your collection.');
        // Refresh the NFT list after successful purchase
        setTimeout(() => {
          setIsProcessing(false);
          setSelectedNFT(null);
          // We could re-fetch NFTs here, but let's just keep it simple for now
        }, 2000);
      }
    } catch (error) {
      console.error('Error buying NFT:', error);
      setProcessingMessage('Failed to complete the purchase. Please try again.');
      setTimeout(() => {
        setIsProcessing(false);
      }, 2000);
    }
  };

  return (
    <Layout title="NFT Marketplace | Stellar NFT Marketplace">
      <div className={styles.container}>
        <div className={styles.headerSection}>
          <h1 className={styles.title}>NFT Marketplace</h1>
          <p className={styles.subtitle}>Discover, collect, and trade unique Stellar NFTs</p>
        </div>
        
        <div className={styles.filters}>
          <div className={styles.searchBar}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search NFTs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className={styles.filterOptions}>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All NFTs</option>
              <option value="listed">For Sale</option>
              {isConnected && (
                <>
                  <option value="owned">Owned by me</option>
                  <option value="created">Created by me</option>
                </>
              )}
            </select>

            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="recent">Recently Added</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Loading NFTs from the Stellar blockchain...</p>
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <p>{error}</p>
          </div>
        ) : filteredNFTs.length === 0 ? (
          <div className={styles.emptyContainer}>
            <p>No NFTs found. Try changing your filters or check back later.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {filteredNFTs.map((nft) => (
              <div
                key={nft.id}
                className={styles.card}
                onClick={() => handleNFTClick(nft)}
              >
                <div className={styles.imageContainer}>
                  <Image
                    src={nft.image}
                    alt={nft.title}
                    width={300}
                    height={300}
                    className={styles.image}
                    unoptimized={nft.image.startsWith('https://nftstorage.link/')}
                  />
                  <div className={styles.likes}>
                    <FaHeart /> {nft.likes}
                  </div>
                  {nft.isListed && (
                    <div className={styles.listedBadge}>
                      <FaTag /> For Sale
                    </div>
                  )}
                </div>
                <div className={styles.info}>
                  <h3>{nft.title}</h3>
                  <p className={styles.price}>{nft.price} XLM</p>
                  <p className={styles.creator}>
                    Created by {typeof nft.creator === 'string' && nft.creator.length > 16 
                      ? `${nft.creator.slice(0, 8)}...` 
                      : nft.creator}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedNFT && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <button
                className={styles.closeButton}
                onClick={() => setSelectedNFT(null)}
                disabled={isProcessing}
              >
                ×
              </button>
              {isProcessing ? (
                <div className={styles.processingContainer}>
                  <div className={styles.spinner}></div>
                  <p>{processingMessage}</p>
                </div>
              ) : (
                <div className={styles.modalGrid}>
                  <div className={styles.modalImage}>
                    <Image
                      src={selectedNFT.image}
                      alt={selectedNFT.title}
                      width={500}
                      height={500}
                      unoptimized={selectedNFT.image.startsWith('https://nftstorage.link/')}
                    />
                  </div>
                  <div className={styles.modalInfo}>
                    <h2>{selectedNFT.title}</h2>
                    <p className={styles.description}>{selectedNFT.description}</p>
                    <div className={styles.details}>
                      <div>
                        <strong>Creator:</strong> {selectedNFT.creator}
                      </div>
                      <div>
                        <strong>Owner:</strong> {selectedNFT.owner || 'Unknown'}
                      </div>
                      <div>
                        <strong>Price:</strong> {selectedNFT.price} XLM
                      </div>
                      <div>
                        <strong>Created:</strong>{" "}
                        {new Date(selectedNFT.createdAt).toLocaleDateString()}
                      </div>
                      {selectedNFT.isListed && (
                        <div className={styles.listedInfo}>
                          <strong>Status:</strong>{" "}
                          <span className={styles.listedStatus}>Listed for sale</span>
                        </div>
                      )}
                    </div>
                    {isConnected && selectedNFT.isListed && selectedNFT.owner !== publicKey && (
                      <button 
                        className={styles.buyButton}
                        onClick={() => handleBuyNFT(selectedNFT)}
                      >
                        Buy Now for {selectedNFT.price} XLM
                      </button>
                    )}
                    {!isConnected && (
                      <button 
                        className={styles.connectButton}
                        onClick={connect}
                      >
                        Connect Wallet to Buy
                      </button>
                    )}
                    {selectedNFT.owner === publicKey && (
                      <div className={styles.ownerInfo}>
                        You own this NFT
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BrowsePage; 