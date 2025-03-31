import { useState, useEffect, useCallback } from 'react';
import { SiStellar } from 'react-icons/si';
import styles from '@/styles/WalletConnect.module.css';

const WalletConnect = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletKey, setWalletKey] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [hasFreighter, setHasFreighter] = useState<boolean | null>(null);
  const [isClientSide, setIsClientSide] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Check if we're on client side
  useEffect(() => {
    setIsClientSide(true);
  }, []);

  // Check Freighter installation and connection status
  useEffect(() => {
    if (!isClientSide) return;

    const checkFreighter = async () => {
      try {
        setIsChecking(true);
        const installed = typeof window.freighter !== 'undefined';
        setHasFreighter(installed);

        if (installed) {
          // Check localStorage first to avoid popups
          const storedConnection = localStorage.getItem('walletConnected');
          
          if (storedConnection === 'true') {
            const connected = await window.freighter.isConnected();
            if (connected) {
              const publicKey = await window.freighter.getPublicKey();
              setWalletKey(publicKey);
              setIsConnected(true);
            }
          }
        }
      } catch (err) {
        console.error('Error checking Freighter:', err);
        setHasFreighter(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkFreighter();

    // Re-check when window gains focus
    const handleFocus = () => {
      const storedConnection = localStorage.getItem('walletConnected');
      if (storedConnection === 'true') {
        checkFreighter();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [isClientSide]);

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      
      if (!hasFreighter) {
        window.open('https://www.freighter.app/', '_blank');
        return;
      }

      const publicKey = await window.freighter.getPublicKey();
      setWalletKey(publicKey);
      setIsConnected(true);
      localStorage.setItem('walletConnected', 'true');

    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      setIsConnected(false);
      setWalletKey(null);
      localStorage.removeItem('walletConnected');
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  if (!isClientSide || isChecking) {
    return (
      <div className={styles.walletConnect}>
        <button className={`${styles.connectButton} ${styles.loading}`} disabled>
          <SiStellar className={styles.icon} />
          Checking Wallet...
        </button>
      </div>
    );
  }

  return (
    <div className={styles.walletConnect}>
      {!isConnected ? (
        <button 
          className={`${styles.connectButton} ${isConnecting ? styles.loading : ''}`}
          onClick={connectWallet}
          disabled={isConnecting}
        >
          <SiStellar className={styles.icon} />
          {!hasFreighter ? 'Install Freighter' : isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      ) : (
        <div className={styles.connectedWallet}>
          <span className={styles.address} title={walletKey || ''}>
            {formatAddress(walletKey || '')}
          </span>
          <button 
            className={styles.disconnectButton}
            onClick={disconnectWallet}
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletConnect; 