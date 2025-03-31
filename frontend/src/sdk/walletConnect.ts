import * as StellarSdk from 'stellar-sdk';
import * as freighter from '@stellar/freighter-api';

/**
 * Safely execute a function with fallback value if it fails
 */
const safeExecute = async <T>(fn: () => Promise<T>, fallback: T): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    console.error('Error in safeExecute:', error);
    return fallback;
  }
};

/**
 * Check if Freighter wallet is installed in the browser
 */
export const isFreighterInstalled = async (): Promise<boolean> => {
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return false;
    }
    
    // Check if freighter exists in window
    const hasFreighterInWindow = 'freighter' in window;
    console.log('Freighter object exists in window:', hasFreighterInWindow);
    
    // Check if our API has the isConnected function
    const hasIsConnected = typeof freighter.isConnected === 'function';
    console.log('freighter.isConnected is a function:', hasIsConnected);
    
    return hasFreighterInWindow || hasIsConnected;
  } catch (error) {
    console.error('Error checking if Freighter is installed:', error);
    return false;
  }
};

/**
 * Check if the user's wallet is connected
 * @param userInitiated If true, this check was initiated by user action (clicking connect)
 */
export const isWalletConnected = async (userInitiated: boolean = false): Promise<boolean> => {
  try {
    // If not in browser or Freighter not installed, return false
    if (typeof window === 'undefined' || !await isFreighterInstalled()) {
      return false;
    }
    
    // Try different methods to check if connected
    
    // 1. Use the API's isConnected function
    if (typeof freighter.isConnected === 'function') {
      // Only call isConnected API if explicitly initiated by user or if the app thinks we're already connected
      // This prevents unwanted popups on page load
      const storedConnection = localStorage.getItem('walletConnected');
      if (userInitiated || storedConnection === 'true') {
        const result = await safeExecute(
          async () => await freighter.isConnected(),
          { isConnected: false }
        );
        console.log('isWalletConnected API result:', result);
        
        if (result && result.isConnected === true) {
          return true;
        }
      } else {
        console.log('Skipping direct wallet check to avoid popup (not user initiated)');
      }
    }
    
    // 2. Try to get the address as another way to check, but only if userInitiated
    // or we already have a stored connection to avoid triggering wallet popup
    const storedConnection = localStorage.getItem('walletConnected');
    if (userInitiated || storedConnection === 'true') {
      try {
        const addressResult = await getUserPublicKey(userInitiated);
        const isConnected = !!addressResult;
        console.log('isWalletConnected via address check:', isConnected);
        return isConnected;
      } catch (e) {
        console.log('Error checking connection via address:', e);
      }
    } else {
      console.log('Skipping address check to avoid popup (not user initiated)');
      // If not user initiated and no stored connection, assume not connected
      return false;
    }
    
    // Default to false if nothing worked
    return false;
  } catch (error) {
    console.error('Error checking wallet connection:', error);
    return false;
  }
};

/**
 * Connect to the Freighter wallet
 */
export const connectWallet = async (): Promise<string | null> => {
  try {
    console.log('Attempting to connect to wallet...');
    
    // Check if wallet is installed
    const isInstalled = await isFreighterInstalled();
    if (!isInstalled) {
      console.log('Freighter not installed, opening installation page');
      window.open('https://www.freighter.app/', '_blank');
      return null;
    }
    
    // First try with requestAccess if available (to ensure permission)
    try {
      if (typeof freighter.requestAccess === 'function') {
        console.log('Requesting access to Freighter wallet...');
        const accessResult = await freighter.requestAccess();
        console.log('Access result:', accessResult);
      }
    } catch (e) {
      console.warn('Error requesting access:', e);
      // Continue anyway, as getAddress might still work
    }
    
    // Direct access to window.freighter if API fails
    if (typeof window !== 'undefined' && window.freighter) {
      try {
        // @ts-ignore - Accessing window.freighter directly
        if (typeof window.freighter.getPublicKey === 'function') {
          // @ts-ignore
          const directKey = await window.freighter.getPublicKey();
          console.log('Got key directly from window.freighter:', directKey);
          if (directKey) {
            localStorage.setItem('walletConnected', 'true');
            return directKey;
          }
        }
      } catch (e) {
        console.warn('Error getting key directly from window.freighter:', e);
      }
    }
    
    // Then try to get the public key using the API
    try {
      console.log('Getting address from Freighter API...');
      // Since this is a connect request, pass true for userInitiated
      const publicKey = await getUserPublicKey(true);
      if (publicKey) {
        console.log('Connected to wallet with public key:', publicKey);
        localStorage.setItem('walletConnected', 'true');
        return publicKey;
      } else {
        console.log('Failed to get public key from wallet');
      }
    } catch (error) {
      console.error('Error getting public key:', error);
    }
    
    return null;
  } catch (error) {
    console.error('Error connecting to wallet:', error);
    return null;
  }
};

/**
 * Get the public key using the Freighter API directly
 * @param userInitiated If true, this check was initiated by user action (clicking connect)
 */
export const getUserPublicKey = async (userInitiated: boolean = false): Promise<string | null> => {
  try {
    // First check localStorage to see if we already know connection status
    // This prevents unwanted popups
    const storedConnection = localStorage.getItem('walletConnected');
    
    // Only proceed with API calls if user initiated or we're already connected
    if (!userInitiated && storedConnection !== 'true') {
      console.log('Skipping public key fetch to avoid popup (not user initiated and no stored connection)');
      return null;
    }
    
    // Try to use the getAddress function from the API
    if (typeof freighter.getAddress === 'function') {
      console.log('Calling getAddress...');
      const response = await freighter.getAddress();
      console.log('getAddress response:', response);
      
      if (response && response.address) {
        return response.address;
      }
      
      if (response && response.error) {
        console.error('Error in getAddress response:', response.error);
      }
    }
    
    // Try other methods as fallback
    if (typeof window !== 'undefined' && window.freighter) {
      try {
        // @ts-ignore - Accessing window.freighter directly
        if (typeof window.freighter.getPublicKey === 'function') {
          // @ts-ignore
          return await window.freighter.getPublicKey();
        }
      } catch (e) {
        console.warn('Error in fallback getPublicKey:', e);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting public key:', error);
    return null;
  }
};

/**
 * Get the public key from the connected wallet
 * @param userInitiated If true, this check was initiated by user action
 */
export const getPublicKey = async (userInitiated: boolean = false): Promise<string | null> => {
  try {
    return await getUserPublicKey(userInitiated);
  } catch (error) {
    console.error('Error getting public key:', error);
    return null;
  }
};

/**
 * Get the network the wallet is connected to
 */
export const getWalletNetwork = async (): Promise<string | null> => {
  try {
    // Get network details using getNetwork()
    if (typeof freighter.getNetwork === 'function') {
      const networkDetails = await freighter.getNetwork();
      console.log('Network details:', networkDetails);
      
      if (networkDetails && networkDetails.networkPassphrase) {
        return networkDetails.networkPassphrase;
      }
    }
    
    // Fall back to getNetworkDetails() if needed
    if (typeof freighter.getNetworkDetails === 'function') {
      const backupDetails = await freighter.getNetworkDetails();
      if (backupDetails && backupDetails.networkPassphrase) {
        return backupDetails.networkPassphrase;
      }
    }
    
    // Try direct window access as a last resort
    if (typeof window !== 'undefined' && window.freighter) {
      try {
        // @ts-ignore
        if (typeof window.freighter.getNetworkDetails === 'function') {
          // @ts-ignore
          const details = await window.freighter.getNetworkDetails();
          if (details && details.networkPassphrase) {
            return details.networkPassphrase;
          }
        }
      } catch (e) {
        console.warn('Error getting network from window.freighter:', e);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting wallet network:', error);
    return null;
  }
};

/**
 * Sign a transaction using the Freighter wallet
 */
export const signWithWallet = async (xdr: string, networkPassphrase: string): Promise<string | null> => {
  try {
    const result = await freighter.signTransaction(xdr, { networkPassphrase });
    console.log('Sign transaction result:', result);
    
    if (result && result.signedTxXdr) {
      return result.signedTxXdr;
    }
    
    // Try direct window access as a fallback
    if (typeof window !== 'undefined' && window.freighter) {
      try {
        // @ts-ignore
        if (typeof window.freighter.signTransaction === 'function') {
          // @ts-ignore
          const directResult = await window.freighter.signTransaction(xdr, { network: networkPassphrase });
          if (directResult && directResult.signedTxXdr) {
            return directResult.signedTxXdr;
          }
        }
      } catch (e) {
        console.warn('Error signing via window.freighter:', e);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error signing transaction:', error);
    return null;
  }
};

/**
 * Disconnect from the Freighter wallet
 */
export const disconnectWallet = async (): Promise<boolean> => {
  try {
    console.log('Attempting to disconnect from wallet...');
    
    // Clear any stored connection data - Freighter relies on this to know if your app is connected
    localStorage.removeItem('walletConnected');
    
    // Also clear any other wallet-related items in localStorage/sessionStorage
    // that might be used by Freighter to track connection state
    const localStorageKeys = Object.keys(localStorage);
    for (const key of localStorageKeys) {
      if (key.toLowerCase().includes('freighter') || 
          key.toLowerCase().includes('wallet') ||
          key.toLowerCase().includes('stellar')) {
        console.log(`Removing localStorage item: ${key}`);
        localStorage.removeItem(key);
      }
    }
    
    // Do the same for sessionStorage
    const sessionStorageKeys = Object.keys(sessionStorage);
    for (const key of sessionStorageKeys) {
      if (key.toLowerCase().includes('freighter') || 
          key.toLowerCase().includes('wallet') ||
          key.toLowerCase().includes('stellar')) {
        console.log(`Removing sessionStorage item: ${key}`);
        sessionStorage.removeItem(key);
      }
    }
    
    // Note: Freighter doesn't seem to have a proper disconnect API
    // Most wallet connections in Freighter are maintained by the app's state
    // For debugging, let's list what's available in the API
    if (typeof window !== 'undefined') {
      console.log('Available freighter API methods:', 
        Object.keys(freighter).filter(key => typeof freighter[key] === 'function'));
      
      if (window.freighter) {
        console.log('Available window.freighter methods:', 
          Object.keys(window.freighter).filter(key => typeof window.freighter[key] === 'function'));
      }
    }
    
    // Try to use Freighter's disconnect function if available (for future compatibility)
    if (typeof freighter.disconnect === 'function') {
      console.log('Calling Freighter disconnect API...');
      try {
        await freighter.disconnect();
        console.log('Successfully called disconnect API');
      } catch (e) {
        console.warn('Error calling freighter.disconnect:', e);
      }
    } 
    
    // Try direct window access as fallback
    if (typeof window !== 'undefined' && window.freighter) {
      try {
        // @ts-ignore
        if (typeof window.freighter.disconnect === 'function') {
          // @ts-ignore
          await window.freighter.disconnect();
          console.log('Successfully called window.freighter.disconnect');
        }
      } catch (e) {
        console.warn('Error calling window.freighter.disconnect:', e);
      }
    }
    
    // Set a clear flag in localStorage to indicate we've explicitly disconnected
    // This helps prevent auto-connect attempts
    localStorage.setItem('wallet_explicitly_disconnected', 'true');
    
    // This function will always return true since disconnection is primarily
    // about clearing app state rather than an actual wallet API call
    return true;
  } catch (error) {
    console.error('Error disconnecting wallet:', error);
    // Still return true to trigger UI update
    return true;
  }
};

// Add a type declaration for window.freighter
declare global {
  interface Window {
    freighter?: {
      isConnected: () => Promise<boolean>;
      getPublicKey: () => Promise<string>;
      getNetwork: () => Promise<{ network: string; networkPassphrase: string }>;
      signTransaction: (
        xdr: string,
        options?: { networkPassphrase?: string }
      ) => Promise<{ signedTxXdr: string }>;
      disconnect: () => Promise<void>;
    };
  }
} 