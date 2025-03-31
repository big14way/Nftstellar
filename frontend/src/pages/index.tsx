import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import styles from '../styles/Home.module.css';
import WalletConnect from '../components/WalletConnect';
import { useAppContext } from '../providers/AppContext';

const Home: NextPage = () => {
  const { state } = useAppContext();
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletKey, setWalletKey] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  
  // Handle client-side state after first render
  useEffect(() => {
    setMounted(true);
    setIsWalletConnected(state?.isConnected || false);
    setWalletKey(state?.walletKey || null);
  }, [state?.isConnected, state?.walletKey]);
  
  return (
    <>
      <Head>
        <title>Stellar NFT Marketplace</title>
        <meta name="description" content="NFT Marketplace built on Stellar blockchain" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.container}>
        <div className={styles.heroSection}>
          <h1 className={styles.title}>Stellar NFT Marketplace</h1>
          <p className={styles.subtitle}>
            Discover, collect, and trade unique digital assets on the Stellar blockchain
          </p>
        </div>
        
        <div className={styles.connectSection}>
          <div className={styles.connectInfo}>
            <h2 className={styles.sectionTitle}>Connect your wallet to get started</h2>
            <p className={styles.sectionText}>
              Use Freighter wallet to browse, purchase, and manage your NFTs on the Stellar blockchain.
            </p>
            
            <div className={styles.walletConnectWrapper}>
              <WalletConnect />
            </div>
          </div>
          
          <div className={styles.imageWrapper}>
            <img 
              src="/wallet-illustration.svg" 
              alt="Wallet Illustration"
              className={styles.walletImage}
            />
          </div>
        </div>
        
        {mounted && isWalletConnected && walletKey && (
          <div className={styles.successCard}>
            <h3 className={styles.cardTitle}>Connected Successfully</h3>
            <p className={styles.cardText}>
              Your wallet is now connected. You can start exploring the marketplace.
            </p>
            
            <div className={styles.buttonGrid}>
              <Link href="/browse" className={`${styles.button} ${styles.primaryButton}`}>
                Browse NFTs
              </Link>
              <Link href="/create" className={`${styles.button} ${styles.successButton}`}>
                Create NFT
              </Link>
              <Link href="/wallet-demo" className={`${styles.button} ${styles.accentButton}`}>
                Wallet Demo
              </Link>
            </div>
          </div>
        )}
        
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <h3 className={styles.cardTitle}>Discover NFTs</h3>
            <p className={styles.cardText}>
              Browse through unique digital assets created by artists and creators from around the world.
            </p>
          </div>
          
          <div className={styles.featureCard}>
            <h3 className={styles.cardTitle}>Create and Sell</h3>
            <p className={styles.cardText}>
              Create your own NFTs and sell them on the marketplace with low transaction fees.
            </p>
          </div>
          
          <div className={styles.featureCard}>
            <h3 className={styles.cardTitle}>Fast and Secure</h3>
            <p className={styles.cardText}>
              Benefit from Stellar's fast transaction times and low fees while trading your digital assets.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home; 