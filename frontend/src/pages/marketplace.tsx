import { useState, useEffect } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { nftService } from '@/services/nft.service';
import { NFT, NFTListing, ListingStatus, ListingFilters, NFTCollection } from '@/types/nft';
import MarketplaceFilters from '@/components/MarketplaceFilters';
import NFTGrid from '@/components/NFTGrid';
import styles from '@/styles/Marketplace.module.css';
import NFTPlaceholder from '@/components/NFTPlaceholder';
import Image from 'next/image';
import { RiSearch2Line } from 'react-icons/ri';
import Head from 'next/head';
import NFTCard from '@/components/NFTCard';
import BuyNFTModal from '@/components/BuyNFTModal';

// Mock collections for demo purposes
const mockCollections: NFTCollection[] = [
  {
    id: 'stellar-punk',
    name: 'Stellar Punks',
    description: 'Unique pixel art characters on the Stellar blockchain',
    image: '/nft-placeholder.png',
    creator: 'GABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFG',
    nftCount: 24,
    floorPrice: '100',
  },
  {
    id: 'cosmic-creatures',
    name: 'Cosmic Creatures',
    description: 'Mystical beings from across the universe',
    image: '/nft-placeholder.png',
    creator: 'GABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEF',
    nftCount: 15,
    floorPrice: '150',
  }
];

// Mock traits for demo purposes
const mockTraits = [
  {
    trait_type: 'Background',
    values: ['Blue', 'Red', 'Green', 'Yellow', 'Purple']
  },
  {
    trait_type: 'Rarity',
    values: ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary']
  },
  {
    trait_type: 'Element',
    values: ['Fire', 'Water', 'Earth', 'Air', 'Void']
  }
];

const MarketplacePage = () => {
  const { publicKey, isConnected } = useWallet();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'newest'>('newest');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchMarketplaceNFTs = async () => {
      setLoading(true);
      setError(null);

      try {
        const fetchedNFTs = await nftService.getMarketplaceNFTs(50);
        console.log('Fetched marketplace NFTs:', fetchedNFTs);
        
        // Convert NFTMetadata to NFT
        const convertedNFTs: NFT[] = fetchedNFTs.map(nft => ({
          id: nft.id || '',
          tokenId: nft.tokenId || nft.id || '',
          name: nft.name || 'Untitled NFT',
          description: nft.description || '',
          image: nft.image || '/nft-placeholder.png',
          owner: nft.owner || '',
          creator: nft.attributes?.find(attr => attr.trait_type === 'creator')?.value?.toString() || '',
          metadata: {
            ...nft,
            attributes: nft.attributes || []
          }
        }));
        
        setNfts(convertedNFTs);
      } catch (error) {
        console.error('Error fetching marketplace NFTs:', error);
        setError('Failed to load NFTs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMarketplaceNFTs();
  }, []);

  const handleBuy = (nft: NFT) => {
    if (!isConnected) {
      alert('Please connect your wallet to buy NFTs');
      return;
    }
    
    if (nft.owner === publicKey) {
      alert('You cannot buy your own NFT');
      return;
    }
    
    setSelectedNFT(nft);
    setShowBuyModal(true);
  };

  const handleCloseBuyModal = () => {
    setShowBuyModal(false);
    setSelectedNFT(null);
  };

  const handleBuySuccess = () => {
    // Refresh NFTs after successful purchase
    setShowBuyModal(false);
    setSelectedNFT(null);
    
    // Refresh the marketplace
    const fetchMarketplaceNFTs = async () => {
      setLoading(true);
      try {
        const fetchedNFTs = await nftService.getMarketplaceNFTs(50);
        
        // Convert NFTMetadata to NFT
        const convertedNFTs: NFT[] = fetchedNFTs.map(nft => ({
          id: nft.id || '',
          tokenId: nft.tokenId || nft.id || '',
          name: nft.name || 'Untitled NFT',
          description: nft.description || '',
          image: nft.image || '/nft-placeholder.png',
          owner: nft.owner || '',
          creator: nft.attributes?.find(attr => attr.trait_type === 'creator')?.value?.toString() || '',
          metadata: {
            ...nft,
            attributes: nft.attributes || []
          }
        }));
        
        setNfts(convertedNFTs);
      } catch (error) {
        console.error('Error refreshing marketplace NFTs:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMarketplaceNFTs();
  };

  const handleImageError = (nftId: string) => {
    setImageErrors(prev => ({ ...prev, [nftId]: true }));
  };

  // Filter and sort NFTs
  const filteredNFTs = nfts.filter(nft => {
    // Always filter out NFTs without a price
    if (!nft.price) return false;
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const nameMatch = nft.name.toLowerCase().includes(query);
      const descMatch = nft.description?.toLowerCase().includes(query);
      const ownerMatch = nft.owner?.toLowerCase().includes(query);
      
      if (!(nameMatch || descMatch || ownerMatch)) {
        return false;
      }
    }
    
    // Apply category filter
    if (filter === 'my_listings' && nft.owner !== publicKey) {
      return false;
    }
    
    return true;
  });

  // Sort NFTs
  const sortedNFTs = [...filteredNFTs].sort((a, b) => {
    if (sortBy === 'price_asc') {
      return parseFloat(a.metadata.price || '0') - parseFloat(b.metadata.price || '0');
    } else if (sortBy === 'price_desc') {
      return parseFloat(b.metadata.price || '0') - parseFloat(a.metadata.price || '0');
    } else {
      // newest first
      const dateA = a.metadata.created_at ? new Date(a.metadata.created_at).getTime() : 0;
      const dateB = b.metadata.created_at ? new Date(b.metadata.created_at).getTime() : 0;
      return dateB - dateA;
    }
  });

  return (
    <>
      <Head>
        <title>NFT Marketplace | Buy and Sell Digital Assets</title>
        <meta name="description" content="Browse, buy, and sell NFTs on the Stellar blockchain" />
      </Head>
      
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>NFT Marketplace</h1>
          <p className={styles.subtitle}>Browse and buy unique digital assets on Stellar</p>
          
          <div className={styles.filters}>
            <div className={styles.searchBar}>
              <input
                type="text"
                placeholder="Search NFTs by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            
            <div className={styles.filterOptions}>
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All NFTs</option>
                {isConnected && <option value="my_listings">My Listings</option>}
              </select>
              
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className={styles.sortSelect}
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </header>
        
        <main className={styles.main}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loading}>Loading marketplace...</div>
            </div>
          ) : error ? (
            <div className={styles.errorContainer}>
              <div className={styles.error}>{error}</div>
            </div>
          ) : sortedNFTs.length === 0 ? (
            <div className={styles.emptyState}>
              <h2>No NFTs found</h2>
              {filter === 'my_listings' ? (
                <p>You don't have any NFTs listed for sale.</p>
              ) : searchQuery ? (
                <p>No NFTs match your search criteria. Try a different search term.</p>
              ) : (
                <p>There are no NFTs currently listed in the marketplace.</p>
              )}
            </div>
          ) : (
            <div className={styles.grid}>
              {sortedNFTs.map((nft) => (
                <div key={nft.id || nft.tokenId} className={styles.cardWrapper}>
                  <div className={styles.card}>
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
                      <h3 className={styles.nftTitle}>{nft.name}</h3>
                      <p className={styles.nftDescription}>
                        {nft.description?.substring(0, 60)}{nft.description && nft.description.length > 60 ? '...' : ''}
                      </p>
                      
                      {nft.price && (
                        <div className={styles.price}>
                          <span className={styles.priceValue}>{nft.price} XLM</span>
                        </div>
                      )}
                      
                      {nft.owner && (
                        <div className={styles.owner}>
                          <span className={styles.ownerLabel}>Seller: </span>
                          <span className={styles.ownerAddress}>
                            {nft.owner === publicKey 
                              ? 'You' 
                              : `${nft.owner.substring(0, 6)}...${nft.owner.substring(nft.owner.length - 4)}`}
                          </span>
                        </div>
                      )}
                      
                      <button
                        className={styles.buyButton}
                        onClick={() => handleBuy(nft)}
                        disabled={!isConnected || nft.owner === publicKey}
                      >
                        {!isConnected 
                          ? 'Connect Wallet to Buy' 
                          : nft.owner === publicKey 
                            ? 'Your Listing' 
                            : `Buy for ${nft.price} XLM`}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
      
      {selectedNFT && showBuyModal && (
        <BuyNFTModal
          nft={selectedNFT}
          onClose={handleCloseBuyModal}
          onSuccess={handleBuySuccess}
        />
      )}
    </>
  );
};

export default MarketplacePage; 