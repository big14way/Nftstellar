import { useState, useEffect, useCallback, useContext } from 'react';
import { NFTMarketplaceClient, NFTToken, NFTListing, TransactionResult, SdkConfig } from '../sdk';
import AppContext from '../utils/AppContext';

export interface UseNFTMarketplaceProps {
  contractId: string;
  network: 'testnet' | 'mainnet' | 'custom';
  rpcUrl?: string;
  networkPassphrase?: string;
  ipfsGateway?: string;
}

export const useNFTMarketplace = ({
  contractId,
  network,
  rpcUrl,
  networkPassphrase,
  ipfsGateway
}: UseNFTMarketplaceProps) => {
  // Get client and wallet state from AppContext
  const { 
    client: appClient, 
    publicKey: appPublicKey,
    isWalletConnected,
    isWalletConnecting,
    connectWallet: appConnectWallet
  } = useContext(AppContext);
  
  const [client, setClient] = useState<NFTMarketplaceClient | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Use the client from AppContext if available
  useEffect(() => {
    if (appClient) {
      setClient(appClient);
    } else if (!client) {
      // Only create a new client if we don't have one from AppContext
      try {
        const config = {
          contractId,
          network,
          rpcUrl: rpcUrl || '',
          networkPassphrase: networkPassphrase || '',
          ipfsGateway
        };
        
        const nftClient = new NFTMarketplaceClient(config);
        setClient(nftClient);
      } catch (err) {
        console.error('Error initializing NFT marketplace client:', err);
        setError('Failed to initialize NFT marketplace client');
      }
    }
  }, [appClient, client, contractId, network, rpcUrl, networkPassphrase, ipfsGateway]);

  // Fetch NFTs owned by the connected wallet
  const getMyNFTs = useCallback(async (): Promise<NFTToken[]> => {
    if (!client) {
      console.warn('NFT client not yet initialized, returning empty array');
      return [];
    }
    
    if (!appPublicKey) {
      console.warn('Wallet not connected, returning empty array');
      return [];
    }
    
    setError(null);
    
    try {
      const nfts = await client.getTokensByOwner(appPublicKey);
      return nfts;
    } catch (err) {
      console.error('Error fetching owned NFTs:', err);
      setError('Failed to fetch your NFTs');
      return [];
    }
  }, [client, appPublicKey]);

  // Fetch all listed NFTs
  const getListedNFTs = useCallback(async (): Promise<NFTListing[]> => {
    if (!client) {
      console.warn('NFT client not yet initialized, returning empty listings array');
      return [];
    }
    
    setError(null);
    
    try {
      const listings = await client.getListedNFTs();
      return listings;
    } catch (err) {
      console.error('Error fetching listed NFTs:', err);
      setError('Failed to fetch listed NFTs');
      return [];
    }
  }, [client]);

  // Mint a new NFT
  const mintNFT = useCallback(async (tokenURI: string): Promise<TransactionResult> => {
    if (!client) {
      console.warn('NFT client not yet initialized');
      return {
        success: false,
        error: 'Client not initialized'
      };
    }
    
    if (!appPublicKey) {
      return {
        success: false,
        error: 'Wallet not connected'
      };
    }
    
    setError(null);
    
    try {
      const result = await client.mintNFT(tokenURI, appPublicKey);
      
      if (!result.success) {
        setError(result.error || 'Failed to mint NFT');
      }
      
      return result;
    } catch (err) {
      console.error('Error minting NFT:', err);
      setError('Failed to mint NFT');
      return {
        success: false,
        error: 'Error minting NFT'
      };
    }
  }, [client, appPublicKey]);

  // List an NFT for sale
  const listNFT = useCallback(async (tokenId: string, price: string): Promise<TransactionResult> => {
    if (!client) {
      console.warn('NFT client not yet initialized');
      return {
        success: false,
        error: 'Client not initialized'
      };
    }
    
    if (!appPublicKey) {
      return {
        success: false,
        error: 'Wallet not connected'
      };
    }
    
    setError(null);
    
    try {
      const result = await client.listNFT(tokenId, price, appPublicKey);
      
      if (!result.success) {
        setError(result.error || 'Failed to list NFT');
      }
      
      return result;
    } catch (err) {
      console.error('Error listing NFT:', err);
      setError('Failed to list NFT');
      return {
        success: false,
        error: 'Error listing NFT'
      };
    }
  }, [client, appPublicKey]);

  // Buy an NFT
  const buyNFT = useCallback(async (tokenId: string): Promise<TransactionResult> => {
    if (!client) {
      console.warn('NFT client not yet initialized');
      return {
        success: false,
        error: 'Client not initialized'
      };
    }
    
    if (!appPublicKey) {
      return {
        success: false,
        error: 'Wallet not connected'
      };
    }
    
    setError(null);
    
    try {
      const result = await client.buyNFT(tokenId, appPublicKey);
      
      if (!result.success) {
        setError(result.error || 'Failed to buy NFT');
      }
      
      return result;
    } catch (err) {
      console.error('Error buying NFT:', err);
      setError('Failed to buy NFT');
      return {
        success: false,
        error: 'Error buying NFT'
      };
    }
  }, [client, appPublicKey]);

  // Cancel a listing
  const cancelListing = useCallback(async (tokenId: string): Promise<TransactionResult> => {
    if (!client) {
      console.warn('NFT client not yet initialized');
      return {
        success: false,
        error: 'Client not initialized'
      };
    }
    
    if (!appPublicKey) {
      return {
        success: false,
        error: 'Wallet not connected'
      };
    }
    
    setError(null);
    
    try {
      const result = await client.cancelListing(tokenId, appPublicKey);
      
      if (!result.success) {
        setError(result.error || 'Failed to cancel listing');
      }
      
      return result;
    } catch (err) {
      console.error('Error cancelling listing:', err);
      setError('Failed to cancel listing');
      return {
        success: false,
        error: 'Error cancelling listing'
      };
    }
  }, [client, appPublicKey]);

  return {
    client,
    publicKey: appPublicKey,
    isConnected: isWalletConnected,
    isLoading: isWalletConnecting,
    error,
    connect: appConnectWallet,
    getMyNFTs,
    getListedNFTs,
    mintNFT,
    listNFT,
    buyNFT,
    cancelListing
  };
}; 