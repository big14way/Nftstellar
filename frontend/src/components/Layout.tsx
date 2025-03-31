import React, { ReactNode, useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import WalletConnect from './WalletConnect';
import { useAppContext } from '../providers/AppContext';
import styles from '../styles/Layout.module.css';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

const Layout = ({ 
  children, 
  title = 'Stellar NFT Marketplace', 
  description = 'NFT Marketplace built on Stellar blockchain' 
}: LayoutProps) => {
  const { state } = useAppContext();
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Set mounted state to true after first render to avoid hydration issues
  useEffect(() => {
    setMounted(true);
    setIsWalletConnected(state?.isConnected || false);
  }, [state?.isConnected]);
  
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <Link href="/" className={styles.logo}>
              Stellar NFT Marketplace
            </Link>
            
            <div className={styles.navContainer}>
              <nav className={styles.navigation}>
                <Link href="/" className={styles.navLink}>
                  Home
                </Link>
                <Link href="/browse" className={styles.navLink}>
                  Browse
                </Link>
                {mounted && isWalletConnected && (
                  <>
                    <Link href="/create" className={styles.navLink}>
                      Create
                    </Link>
                    <Link href="/my-nfts" className={styles.navLink}>
                      My NFTs
                    </Link>
                  </>
                )}
                <Link href="/wallet-demo" className={styles.navLink}>
                  Wallet Demo
                </Link>
              </nav>
              
              <div className={styles.walletConnectContainer}>
                <WalletConnect />
              </div>
            </div>
          </div>
        </header>
        
        <main className={styles.main}>
          {children}
        </main>
        
        <footer className={styles.footer}>
          <div className={styles.footerContent}>
            <p>&copy; {new Date().getFullYear()} Stellar NFT Marketplace. All rights reserved.</p>
            
            <div className={styles.footerLinks}>
              <a href="https://stellarwp.com" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>
                Stellar
              </a>
              <a href="https://github.com/stellar/soroban" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>
                Soroban
              </a>
              <a href="https://freighter.app" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>
                Freighter
              </a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Layout; 