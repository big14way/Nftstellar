import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import styles from '../styles/WalletDemo.module.css';
import WalletConnect from '../components/WalletConnect';
import { useAppContext } from '../providers/AppContext';
import { isFreighterInstalled, getWalletNetwork } from '../sdk/walletConnect';

const WalletDemo: NextPage = () => {
  const { state } = useAppContext();
  
  const [isConnected, setIsConnected] = useState(false);
  const [walletKey, setWalletKey] = useState<string | null>(null);
  const [hasFreighter, setHasFreighter] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [network, setNetwork] = useState<string | null>(null);
  const [freighterDetails, setFreighterDetails] = useState<any>({});
  const [mounted, setMounted] = useState(false);
  
  // Handle client-side state
  useEffect(() => {
    setMounted(true);
    setIsConnected(state?.isConnected || false);
    setWalletKey(state?.walletKey || null);
  }, [state?.isConnected, state?.walletKey]);
  
  // Check if Freighter is installed
  useEffect(() => {
    if (!mounted) return;
    
    const checkFreighter = async () => {
      try {
        setIsChecking(true);
        const installed = await isFreighterInstalled();
        setHasFreighter(installed);
        console.log('Is Freighter installed?', installed);
        
        // Check for window.freighter object details
        if (typeof window !== 'undefined' && window.freighter) {
          const details = {
            exists: true,
            // @ts-ignore - Accessing window.freighter directly
            version: window.freighter.version || 'unknown',
            // @ts-ignore
            hasGetPublicKey: typeof window.freighter.getPublicKey === 'function',
            // @ts-ignore
            hasIsConnected: typeof window.freighter.isConnected === 'function',
            // @ts-ignore
            hasSignTransaction: typeof window.freighter.signTransaction === 'function',
          };
          setFreighterDetails(details);
        }
        
        setIsChecking(false);
      } catch (err) {
        console.error('Error checking Freighter:', err);
        setHasFreighter(false);
        setIsChecking(false);
      }
    };
    
    checkFreighter();
  }, [mounted]);
  
  // Get network info when connected
  useEffect(() => {
    if (!mounted || !isConnected) {
      setNetwork(null);
      return;
    }
    
    const fetchNetworkInfo = async () => {
      try {
        const networkInfo = await getWalletNetwork();
        setNetwork(networkInfo);
      } catch (err) {
        console.error('Error fetching network info:', err);
      }
    };
    
    fetchNetworkInfo();
  }, [isConnected, mounted]);
  
  const getNetworkName = (passphrase: string | null): string => {
    if (!passphrase) return 'Unknown';
    
    if (passphrase.includes('Test SDF')) return 'Testnet';
    if (passphrase.includes('Public Global Stellar')) return 'Public Network (Mainnet)';
    if (passphrase.includes('Standalone')) return 'Standalone (Local)';
    if (passphrase.includes('Futurenet')) return 'Futurenet';
    
    return 'Custom Network';
  };
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Wallet Connection Demo</h1>
        <p>Test the Freighter wallet connection functionality</p>
      </div>
      
      <div className={styles.grid}>
        <div className={styles.card}>
          <h2>Connect Your Wallet</h2>
          <p>Use the button below to connect your Freighter wallet</p>
          
          <WalletConnect />
          
          {mounted && (
            <>
              {isChecking ? (
                <div className={styles.alert}>
                  <span className={styles.alertIcon}>ℹ️</span>
                  Checking for Freighter wallet...
                </div>
              ) : hasFreighter === false ? (
                <div className={`${styles.alert} ${styles.warning}`}>
                  <span className={styles.alertIcon}>⚠️</span>
                  Freighter wallet is not installed. Please install it to continue.
                </div>
              ) : null}
            </>
          )}
        </div>
        
        <div className={styles.card}>
          <h2>Connection Status</h2>
          
          <ul className={styles.list}>
            <li className={styles.listItem}>
              <span className={styles.listIcon}>
                {mounted && hasFreighter ? '✅' : '⚠️'}
              </span>
              Freighter Extension: {mounted && hasFreighter ? 'Installed' : 'Not Installed'}
            </li>
            
            <li className={styles.listItem}>
              <span className={styles.listIcon}>
                {mounted && isConnected ? '✅' : 'ℹ️'}
              </span>
              Wallet Connection: {mounted && isConnected ? 'Connected' : 'Not Connected'}
            </li>
            
            {mounted && isConnected && walletKey && (
              <>
                <li className={styles.listItem}>
                  <span className={styles.listIcon}>✅</span>
                  Public Key:
                  <pre className={styles.code}>
                    {walletKey}
                  </pre>
                </li>
                
                <li className={styles.listItem}>
                  <span className={styles.listIcon}>ℹ️</span>
                  Network: {getNetworkName(network)}
                  {network && (
                    <pre className={styles.code}>
                      {network}
                    </pre>
                  )}
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
      
      {mounted && (
        <div className={styles.card}>
          <h2>Freighter Extension Details</h2>
          
          <hr className={styles.divider} />
          
          {Object.keys(freighterDetails).length > 0 ? (
            <div className={styles.grid}>
              <div>
                <p className={styles.sectionTitle}>Window.freighter Object</p>
                <ul className={styles.list}>
                  <li className={styles.listItem}>
                    <span className={styles.listIcon}>
                      {freighterDetails.exists ? '✅' : '❌'}
                    </span>
                    Exists: {freighterDetails.exists ? 'Yes' : 'No'}
                  </li>
                  <li className={styles.listItem}>
                    <span className={styles.listIcon}>ℹ️</span>
                    Version: {freighterDetails.version}
                  </li>
                </ul>
              </div>
              
              <div>
                <p className={styles.sectionTitle}>Available Methods</p>
                <ul className={styles.list}>
                  <li className={styles.listItem}>
                    <span className={styles.listIcon}>
                      {freighterDetails.hasGetPublicKey ? '✅' : '❌'}
                    </span>
                    getPublicKey: {freighterDetails.hasGetPublicKey ? 'Available' : 'Not Available'}
                  </li>
                  <li className={styles.listItem}>
                    <span className={styles.listIcon}>
                      {freighterDetails.hasIsConnected ? '✅' : '❌'}
                    </span>
                    isConnected: {freighterDetails.hasIsConnected ? 'Available' : 'Not Available'}
                  </li>
                  <li className={styles.listItem}>
                    <span className={styles.listIcon}>
                      {freighterDetails.hasSignTransaction ? '✅' : '❌'}
                    </span>
                    signTransaction: {freighterDetails.hasSignTransaction ? 'Available' : 'Not Available'}
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className={`${styles.alert} ${styles.warning}`}>
              <span className={styles.alertIcon}>⚠️</span>
              No Freighter extension details available. Please check if the extension is properly installed.
            </div>
          )}
        </div>
      )}
      
      {mounted && (
        <div className={styles.card}>
          <h2>Troubleshooting</h2>
          
          <ul className={styles.list}>
            <li className={styles.listItem}>
              <span className={styles.listIcon}>⚠️</span>
              <strong>If the wallet is not connecting:</strong>
              <p className={styles.subText}>Try refreshing the page or restarting your browser</p>
            </li>
            
            <li className={styles.listItem}>
              <span className={styles.listIcon}>⚠️</span>
              <strong>If you don't see the Freighter extension:</strong>
              <p className={styles.subText}>Make sure it's installed from the <a href="https://www.freighter.app/" target="_blank" rel="noopener noreferrer" className={styles.link}>Freighter Website</a></p>
            </li>
            
            <li className={styles.listItem}>
              <span className={styles.listIcon}>⚠️</span>
              <strong>If connection fails with errors:</strong>
              <p className={styles.subText}>Check the browser console for detailed error messages</p>
            </li>
            
            <li className={styles.listItem}>
              <span className={styles.listIcon}>ℹ️</span>
              <strong>Debug steps:</strong>
              <p className={styles.subText}>
                1. Open browser developer tools (F12)<br />
                2. Check the console for error messages<br />
                3. Verify that Freighter extension is enabled<br />
                4. Try using a different browser
              </p>
            </li>
          </ul>
          
          <button 
            className={`${styles.button} ${styles.resetButton}`}
            onClick={() => {
              // Clear all local storage related to wallet connections
              localStorage.clear();
              console.log('Local storage cleared');
              // Reload the page to reset all states
              window.location.reload();
            }}
          >
            Reset Connection State & Reload
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletDemo; 