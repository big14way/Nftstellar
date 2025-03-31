import { createContext, useContext } from 'react';
import { NFTMarketplaceClient } from '../sdk';
import config from './config';
import { isWalletConnected as checkWalletConnection, getPublicKey } from '../sdk/walletConnect';

interface AppContextType {
  client: NFTMarketplaceClient | null;
  config: typeof config;
  // Wallet connection state
  publicKey: string | null;
  isWalletConnected: boolean;
  isWalletConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
}

// Default context values
const defaultContext: AppContextType = {
  client: null,
  config,
  // Default wallet state
  publicKey: null,
  isWalletConnected: false,
  isWalletConnecting: false,
  connectWallet: async () => {},
  disconnectWallet: async () => {}
};

// Create the context
const AppContext = createContext<AppContextType>(defaultContext);

// Create a hook to use the app context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppContext.Provider');
  }
  return context;
};

export default AppContext; 