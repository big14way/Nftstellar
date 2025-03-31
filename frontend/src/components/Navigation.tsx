import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '@/styles/Navigation.module.css';
import { FaHome, FaStore, FaPlus, FaUserCircle } from 'react-icons/fa';
import { useAppContext } from '@/providers/AppContext';

const Navigation = () => {
  const router = useRouter();
  const { isWalletConnected, walletAddress, disconnectWallet } = useAppContext();

  const links = [
    { href: '/', label: 'Home', icon: <FaHome /> },
    { href: '/browse', label: 'Browse NFTs', icon: <FaStore /> },
    { href: '/create', label: 'Create NFT', icon: <FaPlus /> },
    { href: '/my-nfts', label: 'My NFTs', icon: <FaUserCircle /> },
  ];

  return (
    <nav className={styles.navigation}>
      <div className={styles.navLinks}>
        {links.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={`${styles.navLink} ${
              router.pathname === href ? styles.active : ''
            }`}
          >
            <span className={styles.icon}>{icon}</span>
            {label}
          </Link>
        ))}
      </div>
      {isWalletConnected && (
        <div className={styles.walletInfo}>
          <span className={styles.address}>
            {walletAddress?.slice(0, 8)}...{walletAddress?.slice(-8)}
          </span>
          <button onClick={disconnectWallet} className={styles.disconnectButton}>
            Disconnect
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navigation; 