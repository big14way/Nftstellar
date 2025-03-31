import { useState, useEffect, useContext } from 'react';
import Head from 'next/head';
import { useNFTMarketplace } from '../hooks/useNFTMarketplace';
import AppContext from '../utils/AppContext';
import Layout from '../components/Layout';
import WalletConnect from '../components/WalletConnect';

export default function TestPage() {
  const { config } = useContext(AppContext);
  const { 
    publicKey, 
    isConnected, 
    isLoading, 
    error, 
    connect,
    client
  } = useNFTMarketplace({
    contractId: config.contractId,
    network: config.network,
    rpcUrl: config.rpcUrl,
    networkPassphrase: config.networkPassphrase,
    ipfsGateway: config.ipfsGateway
  });
  
  const [sdkStatus, setSdkStatus] = useState<{
    initialized: boolean;
    clientValid: boolean;
    configValid: boolean;
  }>({
    initialized: false,
    clientValid: false,
    configValid: false
  });
  
  // Check SDK initialization status
  useEffect(() => {
    setSdkStatus({
      initialized: !!client,
      clientValid: !!client && typeof client.getListedNFTs === 'function',
      configValid: !!config.contractId && !!config.networkPassphrase
    });
  }, [client, config]);
  
  return (
    <Layout>
      <Head>
        <title>SDK Test - {config.appName}</title>
        <meta name="description" content="Testing the Stellar NFT Marketplace SDK" />
      </Head>
      
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{config.appName} - SDK Test</h1>
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
        
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">SDK Status</h2>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <div className={`w-4 h-4 rounded-full mr-2 ${sdkStatus.initialized ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>SDK Initialized: {sdkStatus.initialized ? 'Yes' : 'No'}</span>
            </div>
            
            <div className="flex items-center">
              <div className={`w-4 h-4 rounded-full mr-2 ${sdkStatus.clientValid ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>Client Valid: {sdkStatus.clientValid ? 'Yes' : 'No'}</span>
            </div>
            
            <div className="flex items-center">
              <div className={`w-4 h-4 rounded-full mr-2 ${sdkStatus.configValid ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>Config Valid: {sdkStatus.configValid ? 'Yes' : 'No'}</span>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Configuration</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(config, null, 2)}
            </pre>
          </div>
          
          {isConnected && publicKey && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Wallet Information</h3>
              <div className="bg-gray-100 p-4 rounded">
                <div><span className="font-medium">Public Key:</span> {publicKey}</div>
                <div><span className="font-medium">Network:</span> {config.network}</div>
              </div>
            </div>
          )}
        </div>
      </main>
    </Layout>
  );
} 