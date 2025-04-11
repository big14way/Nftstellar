import { useState, useContext } from 'react';
import Head from 'next/head';
import { useNFTMarketplace } from '../hooks/useNFTMarketplace';
import AppContext from '../utils/AppContext';
import Layout from '../components/Layout';
import WalletConnect from '../components/WalletConnect';

export default function MintPage() {
  const { config } = useContext(AppContext);
  const { 
    publicKey, 
    isConnected, 
    isLoading, 
    error, 
    connect,
    mintNFT
  } = useNFTMarketplace({
    contractId: config.contractId,
    network: config.network,
    rpcUrl: config.rpcUrl,
    networkPassphrase: config.networkPassphrase,
    ipfsGateway: config.ipfsGateway
  });
  
  const [tokenURI, setTokenURI] = useState<string>('');
  const [mintStatus, setMintStatus] = useState<string>('');
  const [txHash, setTxHash] = useState<string>('');
  const [isMinting, setIsMinting] = useState<boolean>(false);
  
  const handleMint = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }
    
    if (!tokenURI) {
      alert('Please enter a token URI');
      return;
    }
    
    setIsMinting(true);
    setMintStatus('');
    setTxHash('');
    
    try {
      const result = await mintNFT(tokenURI);
      
      if (result.success) {
        setMintStatus('success');
        setTxHash(result.hash || '');
      } else {
        setMintStatus('error');
        setMintStatus(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error minting NFT:', error);
      setMintStatus('error');
      setMintStatus('An unexpected error occurred');
    } finally {
      setIsMinting(false);
    }
  };
  
  return (
    <Layout>
      <Head>
        <title>Mint NFT - {config.appName}</title>
        <meta name="description" content="Mint a new NFT on the Stellar Marketplace" />
      </Head>
      
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{config.appName} - Mint NFT</h1>
          <WalletConnect />
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        <div className="bg-white shadow-md rounded-lg p-6 max-w-md mx-auto">
          <h2 className="text-xl font-bold mb-4">Mint a New NFT</h2>
          
          <div className="mb-4">
            <label htmlFor="tokenURI" className="block text-sm font-medium text-gray-700 mb-1">
              Token URI (IPFS or HTTP)
            </label>
            <input
              type="text"
              id="tokenURI"
              value={tokenURI}
              onChange={(e) => setTokenURI(e.target.value)}
              placeholder="ipfs://QmYourMetadataHash or https://example.com/metadata.json"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              URI to the metadata JSON file for your NFT. Usually an IPFS hash.
            </p>
          </div>
          
          <div className="mt-6">
            <button
              onClick={handleMint}
              disabled={!isConnected || isMinting || !tokenURI}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md
                transition duration-150 ease-in-out disabled:bg-blue-300 flex justify-center items-center"
            >
              {isMinting ? (
                <>
                  <div className="animate-spin h-5 w-5 mr-2 border-b-2 border-white rounded-full"></div>
                  Minting...
                </>
              ) : (
                'Mint NFT'
              )}
            </button>
          </div>
          
          {mintStatus === 'success' && (
            <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md">
              <p className="font-medium">NFT minted successfully!</p>
              {txHash && (
                <p className="text-xs mt-1">
                  Transaction Hash: <span className="font-mono">{txHash}</span>
                </p>
              )}
            </div>
          )}
          
          {mintStatus === 'error' && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
              <p>{mintStatus}</p>
            </div>
          )}
          
          <div className="mt-6 p-4 bg-yellow-50 rounded-md">
            <h3 className="text-sm font-medium text-yellow-800">Sample Metadata Format</h3>
            <pre className="mt-2 text-xs overflow-auto bg-white p-2 rounded border border-yellow-200">
{`{
  "name": "My Awesome NFT",
  "description": "This is a description of my NFT",
  "image": "ipfs://QmImageHash",
  "attributes": [
    {
      "trait_type": "Background",
      "value": "Blue"
    },
    {
      "trait_type": "Rarity",
      "value": "Uncommon"
    }
  ]
}`}
            </pre>
          </div>
        </div>
      </main>
    </Layout>
  );
} 