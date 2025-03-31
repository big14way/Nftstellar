import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import WalletConnect from './WalletConnect';
import { useAppContext } from '../providers/AppContext';
import styles from '../styles/Navigation.module.css';

const Navigation: React.FC = () => {
  const router = useRouter();
  const { state } = useAppContext();
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/browse', label: 'Browse NFTs' },
  ];
  
  const authLinks = [
    { href: '/create', label: 'Create NFT' },
    { href: '/my-nfts', label: 'My NFTs' },
  ];
  
  const devLinks = [
    { href: '/wallet-demo', label: 'Wallet Demo' }
  ];
  
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          Stellar NFT Marketplace
        </Link>
        
        <nav className={styles.nav}>
          <ul className={styles.navList}>
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link 
                  href={link.href}
                  className={`${styles.navLink} ${router.pathname === link.href ? styles.active : ''}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            
            {isClient && state.isConnected && authLinks.map((link) => (
              <li key={link.href}>
                <Link 
                  href={link.href}
                  className={`${styles.navLink} ${router.pathname === link.href ? styles.active : ''}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            
            {devLinks.map((link) => (
              <li key={link.href}>
                <Link 
                  href={link.href}
                  className={`${styles.navLink} ${router.pathname === link.href ? styles.active : ''}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className={styles.wallet}>
          <WalletConnect />
        </div>
      </div>
    </header>
  );
};

export default Navigation; 