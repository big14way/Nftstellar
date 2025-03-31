import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import styles from '../styles/Browse.module.css';

const BrowsePage = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Sample NFT data - would come from an API in a real app
  const nftItems = [
    { id: 1, title: 'Cosmic Voyage', creator: 'StellarArtist', price: '100 XLM', image: 'https://via.placeholder.com/300x300?text=Cosmic+NFT' },
    { id: 2, title: 'Digital Horizon', creator: 'BlockchainCreator', price: '75 XLM', image: 'https://via.placeholder.com/300x300?text=Digital+NFT' },
    { id: 3, title: 'Stellar Dreams', creator: 'CryptoDesigner', price: '120 XLM', image: 'https://via.placeholder.com/300x300?text=Stellar+NFT' },
    { id: 4, title: 'Abstract Universe', creator: 'GalacticArtist', price: '90 XLM', image: 'https://via.placeholder.com/300x300?text=Abstract+NFT' },
    { id: 5, title: 'Space Oddity', creator: 'NFTCreator', price: '150 XLM', image: 'https://via.placeholder.com/300x300?text=Space+NFT' },
    { id: 6, title: 'Digital Frontier', creator: 'PixelArtist', price: '85 XLM', image: 'https://via.placeholder.com/300x300?text=Digital+Frontier' },
  ];

  if (!isClient) {
    return null; // Avoid rendering on server to prevent hydration issues
  }

  return (
    <Layout title="Browse NFTs | Stellar NFT Marketplace" description="Browse and discover NFTs on the Stellar blockchain">
      <div className={styles.container}>
        <h1 className={styles.title}>Browse NFTs</h1>
        
        <div className={styles.filters}>
          <select className={styles.filter}>
            <option value="recent">Recently Added</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="popular">Most Popular</option>
          </select>
          
          <div className={styles.search}>
            <input type="text" placeholder="Search NFTs..." className={styles.searchInput} />
            <button className={styles.searchButton}>Search</button>
          </div>
        </div>
        
        <div className={styles.grid}>
          {nftItems.map((nft) => (
            <div key={nft.id} className={styles.card}>
              <div className={styles.imageContainer}>
                <img src={nft.image} alt={nft.title} className={styles.image} />
              </div>
              <div className={styles.content}>
                <h2 className={styles.nftTitle}>{nft.title}</h2>
                <p className={styles.creator}>Created by <span>{nft.creator}</span></p>
                <div className={styles.priceRow}>
                  <p className={styles.price}>{nft.price}</p>
                  <button className={styles.button}>View Details</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default BrowsePage; 