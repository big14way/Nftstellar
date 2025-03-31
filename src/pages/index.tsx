import { useState, useEffect, useContext } from 'react';
import Head from 'next/head';
import { useNFTMarketplace } from '../hooks/useNFTMarketplace';
import AppContext from '../utils/AppContext';
import { NFTListing, NFTToken } from '../sdk';
import Layout from '../components/Layout';
import ListedNFTs from '../components/ListedNFTs';
import WalletConnect from '../components/WalletConnect';
import MyNFTs from '../components/MyNFTs';

export default function Home() {
  const { config } = useContext(AppContext);
  const { 
    publicKey, 
    isConnected, 
    isLoading, 
    error, 
    connect,
    getMyNFTs,
    getListedNFTs
  } = useNFTMarketplace({
    contractId: config.contractId,
    network: config.network,
    rpcUrl: config.rpcUrl,
    networkPassphrase: config.networkPassphrase,
    ipfsGateway: config.ipfsGateway
  });
  
  const [listedNFTs, setListedNFTs] = useState<NFTListing[]>([]);
  const [myNFTs, setMyNFTs] = useState<NFTToken[]>([]);
  const [activeTab, setActiveTab] = useState<'marketplace' | 'my-nfts'>('marketplace');
  
  // Fetch listed NFTs on initial load
  useEffect(() => {
    const fetchListedNFTs = async () => {
      try {
        const listings = await getListedNFTs();
        setListedNFTs(listings);
      } catch (error) {
        console.error('Error fetching listed NFTs:', error);
      }
    };
    
    fetchListedNFTs();
  }, [getListedNFTs]);
  
  // Fetch user's NFTs when connected
  useEffect(() => {
    const fetchMyNFTs = async () => {
      if (isConnected) {
        try {
          const nfts = await getMyNFTs();
          setMyNFTs(nfts);
        } catch (error) {
          console.error('Error fetching my NFTs:', error);
        }
      }
    };
    
    fetchMyNFTs();
  }, [isConnected, getMyNFTs]);
  
  return (
    <Layout>
      <Head>
        <title>{`${config.appName}`}</title>
        <meta name="description" content="NFT Marketplace on Stellar" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{config.appName}</h1>
          <WalletConnect 
            publicKey={publicKey}
            isConnected={isConnected}
            isLoading={isLoading}
            connect={connect}
          />
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('marketplace')}
                className={`${
                  activeTab === 'marketplace'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm mr-8`}
              >
                Marketplace
              </button>
              <button
                onClick={() => setActiveTab('my-nfts')}
                className={`${
                  activeTab === 'my-nfts'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                disabled={!isConnected}
              >
                My NFTs
              </button>
            </nav>
          </div>
        </div>
        
        {activeTab === 'marketplace' ? (
          <ListedNFTs 
            nfts={listedNFTs} 
            isLoading={isLoading} 
            isConnected={isConnected}
          />
        ) : (
          <MyNFTs 
            nfts={myNFTs} 
            isLoading={isLoading}
          />
        )}
      </main>
      
      <footer className="container mx-auto px-4 py-6 border-t border-gray-200">
        <div className="text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} {config.appName}. All rights reserved.
        </div>
      </footer>
    </Layout>
  );
} 