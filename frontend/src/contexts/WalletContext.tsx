import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as StellarSdk from 'stellar-sdk';
import { isConnected, getPublicKey, signTransaction } from '@stellar/freighter-api';

interface WalletContextType {
  isConnected: boolean;
  publicKey: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  sendTransaction: (destination: string, amount: string) => Promise<any>;
}

const WalletContext = createContext<WalletContextType>({
  isConnected: false,
  publicKey: null,
  connect: async () => {},
  disconnect: () => {},
  sendTransaction: async () => {},
});

export const useWallet = () => useContext(WalletContext);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Handle mounting state
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Check initial connection status
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkConnection = async () => {
      try {
        const connected = await isConnected();
        if (connected) {
          const key = await getPublicKey();
          setWalletConnected(true);
          setPublicKey(key);
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    };

    if (mounted) {
      checkConnection();
    }
  }, [mounted]);

  const connect = useCallback(async () => {
    if (typeof window === 'undefined') return;

    try {
      const connected = await isConnected();
      
      if (!connected) {
        alert('Please install and set up the Freighter wallet extension.');
        window.open('https://www.freighter.app/', '_blank');
        return;
      }
      
      const key = await getPublicKey();
      setWalletConnected(true);
      setPublicKey(key);
      console.log('Connected to Freighter wallet with public key:', key);
    } catch (error) {
      console.error('Error connecting to Freighter:', error);
      alert('Error connecting to wallet. Please make sure Freighter is installed and try again.');
    }
  }, []);

  const disconnect = useCallback(() => {
    setWalletConnected(false);
    setPublicKey(null);
  }, []);

  const sendTransaction = useCallback(async (destination: string, amount: string) => {
    if (typeof window === 'undefined') return null;
    
    try {
      if (!publicKey) {
        throw new Error('Wallet not connected');
      }

      // Set up a server connection to the Stellar network (testnet)
      const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
      
      // Fetch the account details
      const sourceAccount = await server.loadAccount(publicKey);
      
      // Start building the transaction
      const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET
      })
        .addOperation(
          StellarSdk.Operation.payment({
            destination: destination,
            asset: StellarSdk.Asset.native(),
            amount: amount
          })
        )
        .setTimeout(30)
        .build();
      
      // Sign the transaction with Freighter
      const signedXDR = await signTransaction(transaction.toXDR());
      
      // Submit the signed transaction to the Stellar network
      const transactionToSubmit = StellarSdk.TransactionBuilder.fromXDR(
        signedXDR,
        StellarSdk.Networks.TESTNET
      );
      
      const transactionResult = await server.submitTransaction(transactionToSubmit);
      console.log('Transaction successful!', transactionResult);
      return transactionResult;
    } catch (error) {
      console.error('Transaction failed!', error);
      throw error;
    }
  }, [publicKey]);

  // Don't render anything until mounted to prevent hydration issues
  if (!mounted) return <>{children}</>;

  return (
    <WalletContext.Provider
      value={{
        isConnected: walletConnected,
        publicKey,
        connect,
        disconnect,
        sendTransaction,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}; 