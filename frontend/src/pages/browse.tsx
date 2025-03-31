import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import styles from '@/styles/Browse.module.css';
import { FaSearch, FaFilter, FaHeart } from 'react-icons/fa';
import { useAppContext } from '@/providers/AppContext';
import Image from 'next/image';

interface NFT {
  id: string;
  title: string;
  description: string;
  image: string;
  price: number;
  creator: string;
  owner: string;
  likes: number;
  createdAt: string;
}

const BrowsePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const { isWalletConnected, walletAddress } = useAppContext();

  // Fetch NFTs from your Stellar contract
  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        // TODO: Implement fetching NFTs from Stellar contract
        // For now, using mock data
        const mockNFTs: NFT[] = [
          {
            id: '1',
            title: 'Cosmic Horizon',
            description: 'A mesmerizing view of the cosmic horizon',
            image: '/nft-samples/cosmic.jpg',
            price: 100,
            creator: 'GC7743KM...CL2HZTZL',
            owner: 'GC7743KM...CL2HZTZL',
            likes: 42,
            createdAt: '2024-03-20',
          },
          // Add more mock NFTs here
        ];
        setNfts(mockNFTs);
      } catch (error) {
        console.error('Error fetching NFTs:', error);
      }
    };

    fetchNFTs();
  }, []);

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
      if (filter === 'owned') return nft.owner === walletAddress;
      if (filter === 'created') return nft.creator === walletAddress;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'recent') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'popular') return b.likes - a.likes;
      return 0;
    });

  const handleNFTClick = (nft: NFT) => {
    setSelectedNFT(nft);
  };

  return (
    <Layout title="Browse NFTs | Stellar NFT Marketplace">
      <div className={styles.container}>
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
              <option value="owned">Owned by me</option>
              <option value="created">Created by me</option>
            </select>

            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="recent">Recently Added</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>

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
                />
                <div className={styles.likes}>
                  <FaHeart /> {nft.likes}
                </div>
              </div>
              <div className={styles.info}>
                <h3>{nft.title}</h3>
                <p className={styles.price}>{nft.price} XLM</p>
                <p className={styles.creator}>
                  Created by {nft.creator.slice(0, 8)}...
                </p>
              </div>
            </div>
          ))}
        </div>

        {selectedNFT && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <button
                className={styles.closeButton}
                onClick={() => setSelectedNFT(null)}
              >
                ×
              </button>
              <div className={styles.modalGrid}>
                <div className={styles.modalImage}>
                  <Image
                    src={selectedNFT.image}
                    alt={selectedNFT.title}
                    width={500}
                    height={500}
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
                      <strong>Owner:</strong> {selectedNFT.owner}
                    </div>
                    <div>
                      <strong>Price:</strong> {selectedNFT.price} XLM
                    </div>
                  </div>
                  {isWalletConnected && selectedNFT.owner !== walletAddress && (
                    <button className={styles.buyButton}>
                      Buy for {selectedNFT.price} XLM
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BrowsePage; 