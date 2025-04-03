import React from 'react';
import { testCreateNFT } from '../tests/createNFT.test';
import { nftService } from '../services/nft.service';

export default function TestNFTCreation() {
  const [status, setStatus] = React.useState<string>('');
  const [error, setError] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [nftDetails, setNftDetails] = React.useState<any>(null);
  const [lastTransactionHash, setLastTransactionHash] = React.useState<string>('');

  const handleTestClick = async () => {
    try {
      setIsLoading(true);
      setStatus('Starting test...');
      setError('');
      setNftDetails(null);
      
      // Create a simple colored square as test image
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Create gradient
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#4F46E5');
        gradient.addColorStop(1, '#7C3AED');
        
        // Fill canvas
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add some text
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Test NFT', canvas.width/2, canvas.height/2);
      }

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => canvas.toBlob(blob => resolve(blob!), 'image/png'));
      const imageFile = new File([blob], 'test-nft.png', { type: 'image/png' });
      
      setStatus('Created test image, proceeding with NFT creation...');
      
      const result = await testCreateNFT(imageFile);
      setLastTransactionHash(result.transactionHash);
      
      setStatus(`Test completed successfully! Transaction hash: ${result.transactionHash}`);
    } catch (err) {
      console.error('Test error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setStatus('Test failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewNFT = async () => {
    try {
      if (!lastTransactionHash) {
        setError('No transaction hash available. Please create an NFT first.');
        return;
      }

      setStatus('Fetching NFT details...');
      setError('');
      const metadata = await nftService.getNFTMetadata(lastTransactionHash);
      setNftDetails(metadata);
      setStatus('NFT details fetched successfully!');
    } catch (err) {
      console.error('Error fetching NFT:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setStatus('Failed to fetch NFT details');
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold">NFT Creation Test</h2>
      
      <div className="space-y-2">
        <p className="text-gray-300">This test will:</p>
        <ul className="list-disc list-inside text-gray-300 space-y-1">
          <li>Create a test image with gradient background</li>
          <li>Upload it to IPFS via Pinata</li>
          <li>Create NFT metadata</li>
          <li>Mint the NFT on the contract</li>
        </ul>
      </div>
      
      <div className="flex space-x-4">
        <button
          onClick={handleTestClick}
          disabled={isLoading}
          className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Running Test...' : 'Run Test'}
        </button>

        {lastTransactionHash && (
          <button
            onClick={handleViewNFT}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            View Created NFT
          </button>
        )}
      </div>

      {status && (
        <div className="mt-4 p-4 bg-gray-800 rounded">
          <h3 className="font-semibold">Status:</h3>
          <p>{status}</p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-900 text-white rounded">
          <h3 className="font-semibold">Error:</h3>
          <p>{error}</p>
        </div>
      )}

      {nftDetails && (
        <div className="mt-4 p-4 bg-gray-800 rounded">
          <h3 className="font-semibold mb-2">NFT Details:</h3>
          <div className="space-y-2">
            <p><span className="font-medium">Name:</span> {nftDetails.name}</p>
            <p><span className="font-medium">Description:</span> {nftDetails.description}</p>
            {nftDetails.image && (
              <div>
                <p className="font-medium mb-2">Image:</p>
                <img 
                  src={nftDetails.image.startsWith('ipfs://') 
                    ? `https://ipfs.io/ipfs/${nftDetails.image.replace('ipfs://', '')}`
                    : nftDetails.image
                  } 
                  alt={nftDetails.name}
                  className="max-w-sm rounded-lg"
                />
              </div>
            )}
            {nftDetails.attributes && (
              <div>
                <p className="font-medium mb-2">Attributes:</p>
                <ul className="list-disc list-inside">
                  {nftDetails.attributes.map((attr: any, index: number) => (
                    <li key={index}>
                      {attr.trait_type}: {attr.value}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 