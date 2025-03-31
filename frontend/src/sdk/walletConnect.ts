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
 */
export const isWalletConnected = async (): Promise<boolean> => {
  try {
    // If not in browser or Freighter not installed, return false
    if (typeof window === 'undefined' || !await isFreighterInstalled()) {
      return false;
    }
    
    // Try different methods to check if connected
    
    // 1. Use the API's isConnected function
    if (typeof freighter.isConnected === 'function') {
      const result = await safeExecute(
        async () => await freighter.isConnected(),
        { isConnected: false }
      );
      console.log('isWalletConnected API result:', result);
      
      if (result && result.isConnected === true) {
        return true;
      }
    }
    
    // 2. Try to get the address as another way to check
    try {
      const addressResult = await getUserPublicKey();
      const isConnected = !!addressResult;
      console.log('isWalletConnected via address check:', isConnected);
      return isConnected;
    } catch (e) {
      console.log('Error checking connection via address:', e);
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
      const publicKey = await getUserPublicKey();
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
 */
export const getUserPublicKey = async (): Promise<string | null> => {
  try {
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
 */
export const getPublicKey = async (): Promise<string | null> => {
  try {
    return await getUserPublicKey();
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
    };
  }
} 