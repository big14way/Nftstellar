import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useWallet } from '@/contexts/WalletContext';
import styles from '@/styles/Home.module.css';

export default function Home() {
  const { isConnected, connect } = useWallet();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // or a loading spinner
  }

  return (
    <>
      <Head>
        <title>Stellar NFT Marketplace</title>
        <meta name="description" content="Create, buy, and sell NFTs on the Stellar blockchain" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div className={styles.hero}>
          <h1>Welcome to Stellar NFT Marketplace</h1>
          <p>Create, collect, and trade unique digital assets on the Stellar blockchain</p>
          
          {!isConnected ? (
            <button onClick={connect} className={styles.connectButton}>
              Connect Wallet to Start
            </button>
          ) : (
            <div className={styles.actions}>
              <Link href="/browse" className={styles.actionButton}>
                Browse NFTs
              </Link>
              <Link href="/create" className={styles.actionButton}>
                Create NFT
              </Link>
              <Link href="/my-nfts" className={styles.actionButton}>
                My NFTs
              </Link>
            </div>
          )}
        </div>

        <section className={styles.features}>
          <h2>Why Choose Stellar NFT Marketplace?</h2>
          <div className={styles.featureGrid}>
            <div className={styles.feature}>
              <h3>Low Fees</h3>
              <p>Benefit from Stellar's minimal transaction costs</p>
            </div>
            <div className={styles.feature}>
              <h3>Fast Transactions</h3>
              <p>Experience near-instant NFT transfers</p>
            </div>
            <div className={styles.feature}>
              <h3>Eco-Friendly</h3>
              <p>Stellar's efficient consensus mechanism minimizes environmental impact</p>
            </div>
            <div className={styles.feature}>
              <h3>User-Friendly</h3>
              <p>Simple and intuitive interface for creators and collectors</p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
} 