import { useState, useEffect } from 'react';
import { useAppContext } from '../providers/AppContext';
import Layout from '../components/Layout';
import Link from 'next/link';
import styles from '../styles/Home.module.css';

const HomePage = () => {
  const { state } = useAppContext();
  const { isConnected } = state;
  const [isClientSide, setIsClientSide] = useState(false);
  
  useEffect(() => {
    setIsClientSide(true);
  }, []);
  
  if (!isClientSide) {
    return null; // Avoid rendering on server to prevent hydration issues
  }
  
  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Discover, Collect, and Sell Stellar NFTs
            </h1>
            <p className={styles.heroSubtitle}>
              The premier NFT marketplace on the Stellar blockchain
            </p>
            <div className={styles.ctaButtons}>
              <Link href="/browse" className={styles.primaryButton}>
                Explore NFTs
              </Link>
              {isConnected ? (
                <Link href="/create" className={styles.secondaryButton}>
                  Create NFT
                </Link>
              ) : (
                <button className={`${styles.secondaryButton} ${styles.disabledButton}`} disabled>
                  Connect Wallet to Create
                </button>
              )}
            </div>
          </div>
        </div>
        
        <div className={styles.features}>
          <div className={styles.featuresTitle}>
            <h2>Why Choose Stellar NFT Marketplace?</h2>
          </div>
          <div className={styles.featureCards}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>💰</div>
              <h3>Low Fees</h3>
              <p>Benefit from Stellar's low transaction costs and fast confirmation times.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🔒</div>
              <h3>Secure</h3>
              <p>Assets secured by blockchain technology and smart contracts.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🌐</div>
              <h3>Global</h3>
              <p>Connect with creators and collectors from around the world.</p>
            </div>
          </div>
        </div>
        
        <div className={styles.getStarted}>
          <h2>Ready to Get Started?</h2>
          <p>Connect your Freighter wallet and start exploring the world of Stellar NFTs.</p>
          <Link href={isConnected ? "/my-nfts" : "/browse"} className={styles.primaryButton}>
            {isConnected ? "View My NFTs" : "Browse Marketplace"}
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage; 