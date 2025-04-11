import {
  StellarWalletsKit,
  WalletNetwork,
  allowAllModules,
  FREIGHTER_ID,
  FreighterModule,
  ISupportedWallet
} from '@creit.tech/stellar-wallets-kit';
import config from '../utils/config';

// Create a singleton instance of the wallet kit
let walletKitInstance: StellarWalletsKit | null = null;

/**
 * Get or initialize the StellarWalletsKit instance
 */
export const getWalletKit = () => {
  if (!walletKitInstance) {
    walletKitInstance = new StellarWalletsKit({
      network: config.network === 'testnet' ? WalletNetwork.TESTNET : WalletNetwork.PUBLIC,
      selectedWalletId: FREIGHTER_ID, // Default to Freighter
      modules: allowAllModules(), // Use all available modules
    });
  }
  
  return walletKitInstance;
};

/**
 * Check if wallet is connected
 */
export const isWalletConnected = async (): Promise<boolean> => {
  const kit = getWalletKit();
  
  try {
    // Try to get address which will return null if not connected
    const { address } = await kit.getAddress();
    return !!address;
  } catch (error) {
    console.error('Error checking wallet connection:', error);
    return false;
  }
};

/**
 * Connect wallet using the integrated modal
 */
export const connectWalletWithModal = async (): Promise<string | null> => {
  const kit = getWalletKit();
  
  try {
    return new Promise((resolve) => {
      kit.openModal({
        onWalletSelected: async (option) => {
          try {
            kit.setWallet(option.id);
            const { address } = await kit.getAddress();
            resolve(address);
          } catch (error) {
            console.error('Error connecting to wallet:', error);
            resolve(null);
          }
        },
        onClosed: () => {
          resolve(null);
        },
        modalTitle: 'Connect your Stellar Wallet',
      });
    });
  } catch (error) {
    console.error('Error opening wallet modal:', error);
    return null;
  }
};

/**
 * Connect to wallet directly (without modal)
 */
export const connectWallet = async (): Promise<string | null> => {
  const kit = getWalletKit();
  
  try {
    const { address } = await kit.getAddress();
    return address;
  } catch (error) {
    console.error('Error connecting to wallet:', error);
    return null;
  }
};

/**
 * Disconnect wallet
 */
export const disconnectWallet = async (): Promise<void> => {
  const kit = getWalletKit();
  walletKitInstance = null;
};

/**
 * Get public key from wallet
 */
export const getPublicKey = async (): Promise<string | null> => {
  try {
    const kit = getWalletKit();
    const { address } = await kit.getAddress();
    return address;
  } catch (error) {
    console.error('Error getting public key:', error);
    return null;
  }
};

/**
 * Sign a transaction using wallet
 */
export const signWithWallet = async (xdr: string): Promise<string | null> => {
  try {
    const kit = getWalletKit();
    const { address } = await kit.getAddress();
    
    if (!address) {
      throw new Error('Wallet not connected');
    }
    
    const networkPassphrase = config.network === 'testnet' 
      ? WalletNetwork.TESTNET 
      : WalletNetwork.PUBLIC;
    
    const { signedTxXdr } = await kit.signTransaction(xdr, {
      address,
      networkPassphrase
    });
    
    return signedTxXdr;
  } catch (error) {
    console.error('Error signing transaction:', error);
    return null;
  }
};

/**
 * Create a wallet connect button in the provided container
 */
export const createWalletButton = async (
  container: HTMLElement,
  onConnect: (address: string) => void,
  onDisconnect: () => void
): Promise<void> => {
  const kit = getWalletKit();
  
  await kit.createButton({
    container,
    buttonText: 'Connect Wallet',
    horizonUrl: config.rpcUrl,
    onConnect: ({ address }) => {
      onConnect(address);
    },
    onDisconnect: () => {
      onDisconnect();
    },
  });
}; 