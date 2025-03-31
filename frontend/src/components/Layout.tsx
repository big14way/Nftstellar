import React, { ReactNode, useState, useEffect } from 'react';
import Head from 'next/head';
import Navigation from './Navigation';
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
  const [mounted, setMounted] = useState(false);
  
  // Set mounted state to true after first render to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);
  
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className={styles.container}>
        <Navigation />
        
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