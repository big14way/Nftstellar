import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { FaGithub, FaTwitter, FaDiscord } from 'react-icons/fa';
import { SiStellar } from 'react-icons/si';
import styles from '@/styles/Layout.module.css';
import { useWallet } from '@/contexts/WalletContext';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title = 'Stellar NFT Marketplace',
  description = 'Create, buy, and sell NFTs on the Stellar blockchain',
}) => {
  const { isConnected, connect, disconnect, publicKey } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connect();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link href="/" className={styles.logo}>
            <SiStellar className={styles.logoIcon} />
            <span>Stellar NFTs</span>
          </Link>

          <nav className={styles.navigation}>
            <Link href="/browse" className={styles.navLink}>Browse</Link>
            {isConnected && (
              <>
                <Link href="/create" className={styles.navLink}>Create</Link>
                <Link href="/my-nfts" className={styles.navLink}>My NFTs</Link>
              </>
            )}
          </nav>

          <div className={styles.walletConnect}>
            {!isConnected ? (
              <button 
                className={`${styles.button} ${styles.connectButton} ${isConnecting ? styles.connecting : ''}`}
                onClick={handleConnect}
                disabled={isConnecting}
              >
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            ) : (
              <div className={styles.walletInfo}>
                <div className={styles.walletAddress}>
                  <div className={styles.statusDot} />
                  <span>{publicKey?.substring(0, 4)}...{publicKey?.substring(publicKey.length - 4)}</span>
                </div>
                <button 
                  className={`${styles.button} ${styles.disconnectButton}`}
                  onClick={handleDisconnect}
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {children}
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h3>About</h3>
            <p>A modern NFT marketplace built on the Stellar blockchain, enabling creators and collectors to trade unique digital assets.</p>
          </div>

          <div className={styles.footerSection}>
            <h3>Quick Links</h3>
            <Link href="/browse" className={styles.footerLink}>Browse NFTs</Link>
            {isConnected && (
              <>
                <Link href="/create" className={styles.footerLink}>Create NFT</Link>
                <Link href="/my-nfts" className={styles.footerLink}>My NFTs</Link>
              </>
            )}
          </div>

          <div className={styles.footerSection}>
            <h3>Community</h3>
            <div className={styles.socialLinks}>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                <FaGithub />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <FaTwitter />
              </a>
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer">
                <FaDiscord />
              </a>
            </div>
          </div>
        </div>
        
        <div className={styles.footerBottom}>
          <p>&copy; {new Date().getFullYear()} Stellar NFT Marketplace. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 