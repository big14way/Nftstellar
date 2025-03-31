import { useState, useEffect, useCallback } from 'react';
import { connectWallet, disconnectWallet, isFreighterInstalled, isWalletConnected } from '../sdk/walletConnect';
import { useAppContext } from '../providers/AppContext';
import styles from '../styles/WalletConnect.module.css';

const WalletConnect = () => {
  const { state, dispatch } = useAppContext();
  const { isConnecting = false, isConnected = false, walletKey = null } = state || {};
  
  const [hasFreighter, setHasFreighter] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClientSide, setIsClientSide] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  // Check if we're on client side
  useEffect(() => {
    setIsClientSide(true);
  }, []);

  // Check if Freighter is installed
  useEffect(() => {
    if (!isClientSide) return;
    
    const checkFreighter = async () => {
      try {
        setIsChecking(true);
        const installed = await isFreighterInstalled();
        console.log('🔍 Freighter installed check result:', installed);
        setHasFreighter(installed);
        
        // If installed, check if already connected but only based on local state
        if (installed) {
          // Check localStorage first to avoid popups
          const storedConnection = localStorage.getItem('walletConnected');
          console.log('walletConnected in localStorage:', storedConnection);
          setDebugInfo(`localStorage connection: ${storedConnection || 'none'}`);
          
          // Only check via API if localStorage indicates we're connected
          // This prevents unwanted popups
          if (storedConnection === 'true') {
            const connected = await isWalletConnected(false); // not user initiated
            console.log('🔍 Freighter connection check result:', connected);
            
            if (connected && !isConnected) {
              console.log("Wallet is connected but app state doesn't reflect it. Updating state...");
              const result = await connectWallet();
              if (result) {
                dispatch({
                  type: 'SET_WALLET_CONNECTION',
                  payload: { isConnected: true, walletKey: result }
                });
              }
            } else if (!connected && isConnected) {
              // If wallet reports as disconnected but our state thinks it's connected, fix that
              console.log("Wallet is disconnected but app state shows connected. Fixing state...");
              dispatch({
                type: 'SET_WALLET_CONNECTION',
                payload: { isConnected: false, walletKey: null }
              });
            }
          } else if (isConnected) {
            // If localStorage says we're not connected but state says we are, fix the state
            console.log("State shows connected but localStorage doesn't. Fixing state...");
            dispatch({
              type: 'SET_WALLET_CONNECTION',
              payload: { isConnected: false, walletKey: null }
            });
          }
        }
        
        setIsChecking(false);
      } catch (err) {
        console.error('Error checking Freighter installation:', err);
        setHasFreighter(false);
        setIsChecking(false);
        setError('Error checking wallet installation');
      }
    };

    checkFreighter();

    // Re-check when window gains focus only if we're already connected
    // This prevents unwanted popups
    const handleFocus = () => {
      const storedConnection = localStorage.getItem('walletConnected');
      if (storedConnection === 'true') {
        console.log('Window focus event - checking Freighter status');
        checkFreighter();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [dispatch, isConnected, isClientSide]);

  const handleConnectWallet = async () => {
    try {
      console.log('Connecting to wallet...');
      dispatch({
        type: 'SET_IS_CONNECTING',
        payload: true
      });

      const publicKey = await connectWallet();
      console.log('connectWallet result:', publicKey);
      
      if (publicKey) {
        console.log('Wallet connected successfully with public key:', publicKey);
        dispatch({
          type: 'SET_WALLET_CONNECTION',
          payload: { isConnected: true, walletKey: publicKey }
        });
      } else {
        console.warn('Connect wallet returned null public key');
        setError('Failed to connect wallet. Please try again.');
      }
    } catch (connectionError) {
      console.error('Error in wallet connection:', connectionError);
      setError(`Connection error: ${connectionError.message || 'Unknown error'}`);
    } finally {
      dispatch({
        type: 'SET_IS_CONNECTING',
        payload: false
      });
    }
  };

  const handleDisconnectWallet = async () => {
    try {
      console.log('Disconnecting wallet');
      
      // First update UI state to provide immediate feedback
      dispatch({
        type: 'SET_WALLET_CONNECTION',
        payload: { isConnected: false, walletKey: null }
      });
      
      // Then try the actual disconnect
      const disconnected = await disconnectWallet();
      console.log('Disconnect result:', disconnected);
      
      if (!disconnected) {
        console.warn('Disconnect returned false');
        setError('Warning: Disconnect may not have completed properly');
      }
    } catch (disconnectError) {
      console.error('Error disconnecting wallet:', disconnectError);
      setError(`Disconnect error: ${disconnectError.message || 'Unknown error'}`);
    }
  };

  const handleWalletClick = useCallback(async () => {
    if (!isClientSide) return;
    
    try {
      setError(null);
      
      // If Freighter is not installed, open installation page
      if (!hasFreighter) {
        console.log('Opening Freighter installation page');
        window.open('https://www.freighter.app/', '_blank');
        return;
      }

      // If we're already connected, disconnect
      if (isConnected) {
        await handleDisconnectWallet();
      } else {
        // Otherwise connect
        await handleConnectWallet();
      }
    } catch (err) {
      console.error('Error in handleWalletClick:', err);
      dispatch({
        type: 'SET_IS_CONNECTING',
        payload: false
      });
      setError(`Unexpected error: ${err.message || 'Unknown error'}`);
    }
  }, [dispatch, hasFreighter, isConnected, isClientSide]);

  const getButtonText = useCallback(() => {
    if (isChecking) return 'Checking Wallet...';
    if (!hasFreighter) return 'Install Freighter';
    if (isConnected) return 'Disconnect Wallet';
    if (isConnecting) return 'Connecting...';
    return 'Connect Wallet';
  }, [isChecking, hasFreighter, isConnected, isConnecting]);

  return (
    <div className={styles.container}>
      <button
        onClick={isClientSide ? handleWalletClick : undefined}
        className={`${styles.button} ${isConnected ? styles.disconnect : styles.connect} ${(isChecking || isConnecting) ? styles.loading : ''}`}
        disabled={!isClientSide || isChecking || isConnecting}
      >
        {(isChecking || isConnecting) && isClientSide && (
          <div className={styles.loadingIndicator}>
            <span className={styles.loadingDot}></span>
            <span className={styles.loadingDot}></span>
            <span className={styles.loadingDot}></span>
          </div>
        )}
        {getButtonText()}
      </button>
      
      {error && isClientSide && (
        <div className={styles.error}>
          <div className={styles.errorContent}>
            <h4 className={styles.errorTitle}>Connection Error</h4>
            <p className={styles.errorMessage}>{error}</p>
            <button 
              className={styles.closeButton}
              onClick={() => setError(null)}
              aria-label="Close"
            >
              &times;
            </button>
          </div>
        </div>
      )}
      
      {isConnected && walletKey && isClientSide && (
        <div className={styles.connectedInfo}>
          <p className={styles.walletAddress}>
            Connected: {walletKey.substring(0, 8)}...{walletKey.substring(walletKey.length - 8)}
          </p>
        </div>
      )}
    </div>
  );
};

export default WalletConnect; 