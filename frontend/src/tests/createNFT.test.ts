import { nftService } from '../services/nft.service';
import { getPublicKey } from '@stellar/freighter-api';

async function testCreateNFT(imageFile: File) {
  try {
    console.log('Starting NFT creation test...');
    
    // Get the public key from Freighter
    const publicKey = await getPublicKey();
    
    // Create NFT parameters
    const params = {
      name: "Test NFT",
      description: "This is a test NFT created via the marketplace",
      imageFile,
      publicKey,
      royaltyPercentage: 2.5
    };

    console.log('Creating NFT with params:', params);

    // Create the NFT
    const result = await nftService.createNFT(params);

    console.log('NFT created successfully!');
    console.log('Transaction hash:', result.transactionHash);
    console.log('Metadata URL:', result.metadataUrl);

    return result;
  } catch (error) {
    console.error('Error in test:', error);
    throw error;
  }
}

// Export the test function
export { testCreateNFT }; 