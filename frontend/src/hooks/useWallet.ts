import { useState, useEffect } from 'react';
import { getPublicKey, isConnected } from '@stellar/freighter-api';

export interface WalletState {
  publicKey: string | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    publicKey: null,
    isConnected: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const connected = await isConnected();
      if (!connected) {
        setState(prev => ({
          ...prev,
          isConnected: false,
          publicKey: null,
          isLoading: false
        }));
        return;
      }

      const key = await getPublicKey();
      setState(prev => ({
        ...prev,
        isConnected: true,
        publicKey: key,
        isLoading: false
      }));
    } catch (error) {
      console.error('Error checking wallet connection:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to connect to wallet',
        isLoading: false
      }));
    }
  };

  const connectWallet = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // This will prompt the user to connect if not already connected
      const key = await getPublicKey();
      
      setState(prev => ({
        ...prev,
        isConnected: true,
        publicKey: key,
        isLoading: false
      }));

      return key;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to connect wallet',
        isLoading: false
      }));
      throw error;
    }
  };

  const disconnectWallet = () => {
    setState({
      publicKey: null,
      isConnected: false,
      isLoading: false,
      error: null
    });
  };

  return {
    ...state,
    connectWallet,
    disconnectWallet,
    checkWalletConnection
  };
} 