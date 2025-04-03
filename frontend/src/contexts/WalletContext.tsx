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

  // Check if wallet was previously connected
  useEffect(() => {
    if (typeof window === 'undefined' || !mounted) return;

    const checkPreviousConnection = async () => {
      try {
        const wasConnected = localStorage.getItem('walletConnected') === 'true';
        if (wasConnected) {
          const connected = await isConnected();
          if (connected) {
            const key = await getPublicKey();
            setWalletConnected(true);
            setPublicKey(key);
          } else {
            // Clear stored connection if wallet is no longer connected
            localStorage.removeItem('walletConnected');
          }
        }
      } catch (error) {
        console.error('Error checking previous wallet connection:', error);
        localStorage.removeItem('walletConnected');
      }
    };

    checkPreviousConnection();
  }, [mounted]);

  const connect = useCallback(async () => {
    if (typeof window === 'undefined') return;

    try {
      const connected = await isConnected();
      
      if (!connected) {
        window.open('https://www.freighter.app/', '_blank');
        throw new Error('Please install and set up the Freighter wallet extension.');
      }
      
      const key = await getPublicKey();
      setWalletConnected(true);
      setPublicKey(key);
      localStorage.setItem('walletConnected', 'true');
      console.log('Connected to Freighter wallet with public key:', key);
    } catch (error) {
      console.error('Error connecting to Freighter:', error);
      throw error;
    }
  }, []);

  const disconnect = useCallback(() => {
    setWalletConnected(false);
    setPublicKey(null);
    localStorage.removeItem('walletConnected');
  }, []);

  const sendTransaction = useCallback(async (destination: string, amount: string) => {
    if (typeof window === 'undefined') return null;
    
    try {
      if (!publicKey) {
        throw new Error('Wallet not connected');
      }

      const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
      const sourceAccount = await server.loadAccount(publicKey);
      
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
      
      const signedXDR = await signTransaction(transaction.toXDR());
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