import { getPublicKey, signTransaction } from '@stellar/freighter-api';
import { ipfsService } from './ipfs.service';
import { NFT_CONFIG } from '@/config/nft.config';
import type { Server, TransactionBuilder, Operation, Asset } from 'stellar-sdk';

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  transactionHash?: string;
  created_at?: string;
}

interface NFTCreateParams {
  name: string;
  description: string;
  imageFile: File;
  publicKey: string;
  royaltyPercentage?: number;
}

interface AccountDataAttribute {
  name: string;
  value: string;
}

export class NFTService {
  private server: Server | null = null;
  private networkPassphrase: string = '';
  private contractId: string;
  private stellarSdk: any = null;

  constructor() {
    this.contractId = NFT_CONFIG.NFT_CONTRACT_ID;
  }

  private async initialize() {
    if (typeof window === 'undefined') return;
    
    if (!this.stellarSdk) {
      this.stellarSdk = await import('stellar-sdk');
    }

    if (!this.server) {
        // Initialize server
      this.server = new this.stellarSdk.Server(
          NFT_CONFIG.NETWORK === 'testnet'
            ? 'https://horizon-testnet.stellar.org'
            : 'https://horizon.stellar.org',
          { allowHttp: true }
        );

        // Set network passphrase
        this.networkPassphrase = NFT_CONFIG.NETWORK === 'testnet'
          ? 'Test SDF Network ; September 2015'
          : 'Public Global Stellar Network ; September 2015';

        console.log('Stellar SDK initialized successfully');
    }
      }

  private async ensureInitialized() {
    await this.initialize();
    if (!this.server || !this.stellarSdk) {
      throw new Error('Failed to initialize Stellar SDK');
    }
  }

  async uploadNFTImage(imageFile: File): Promise<string> {
    try {
      // Validate file type
      if (!NFT_CONFIG.ALLOWED_FILE_TYPES.includes(imageFile.type)) {
        throw new Error('Invalid file type. Supported types: ' + NFT_CONFIG.ALLOWED_FILE_TYPES.join(', '));
      }

      // Validate file size
      if (imageFile.size > NFT_CONFIG.MAX_FILE_SIZE) {
        throw new Error(`File size too large. Maximum size: ${NFT_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`);
      }

      // Upload to IPFS
      const imageUrl = await ipfsService.uploadFile(imageFile);
      return imageUrl;
    } catch (error) {
      console.error('Error uploading NFT image:', error);
      throw error;
    }
  }

  async createNFTMetadata(params: NFTCreateParams): Promise<string> {
    try {
      // 1. Upload image to IPFS
      const imageUrl = await this.uploadNFTImage(params.imageFile);

      // 2. Create and upload metadata
      const metadata: NFTMetadata = {
        name: params.name,
        description: params.description,
        image: imageUrl,
        attributes: [
          {
            trait_type: 'creator',
            value: params.publicKey
          },
          {
            trait_type: 'royalty',
            value: params.royaltyPercentage || 0
          }
        ]
      };

      const metadataUrl = await ipfsService.uploadMetadata(metadata);
      console.log('Metadata uploaded to IPFS:', metadataUrl);
      return metadataUrl;
    } catch (error) {
      console.error('Error creating NFT metadata:', error);
      throw error;
    }
  }

  async createNFTTransaction(metadataUrl: string, royaltyPercentage: number = 0): Promise<string> {
    try {
      // Ensure SDK is initialized
        await this.initialize();
      if (!this.server || !this.stellarSdk) {
        throw new Error('Stellar SDK not initialized');
      }

      const sdk = this.stellarSdk;

      // Get the creator's public key
      const publicKey = await getPublicKey();
      const account = await this.server.loadAccount(publicKey);

      // Extract CID from IPFS URL
      const cid = metadataUrl.split('/').pop() || '';
      if (!cid) {
        throw new Error('Invalid IPFS URL format');
      }

      // Create transaction
      const transaction = new sdk.TransactionBuilder(account, {
        fee: '100000',
        networkPassphrase: this.networkPassphrase
      })
        .addOperation(sdk.Operation.manageData({
          name: 'nft_metadata_cid',
          value: cid
        }))
        .addOperation(sdk.Operation.manageData({
          name: 'nft_royalty',
          value: (royaltyPercentage * 100).toString()
        }))
        .setTimeout(30)
        .build();

      // Sign transaction
      const signedXDR = await signTransaction(transaction.toXDR(), {
        networkPassphrase: this.networkPassphrase
      });

      return signedXDR;
    } catch (error) {
      console.error('Error creating NFT transaction:', error);
      throw error;
    }
  }

  async submitNFTTransaction(signedXDR: string): Promise<{ success: boolean; transactionHash: string }> {
    try {
      await this.initialize();
      if (!this.server || !this.stellarSdk) {
        throw new Error('Stellar SDK not initialized');
      }

      const sdk = this.stellarSdk;
      const transaction = sdk.TransactionBuilder.fromXDR(signedXDR, this.networkPassphrase);
      const submittedTx = await this.server.submitTransaction(transaction);

      console.log('NFT created successfully:', submittedTx);

      return {
        success: true,
        transactionHash: submittedTx.hash
      };
    } catch (error) {
      console.error('Error submitting NFT transaction:', error);
      throw error;
    }
  }

  async createNFT(params: NFTCreateParams) {
    try {
      console.log('Starting NFT creation process...');
      
      // Step 1: Upload image and create metadata
      console.log('Creating NFT metadata...');
      const metadataUrl = await this.createNFTMetadata(params);
      console.log('Metadata created and uploaded:', metadataUrl);

      // Step 2: Create and sign transaction
      console.log('Creating and signing NFT transaction...');
      const signedXDR = await this.createNFTTransaction(
        metadataUrl, 
        params.royaltyPercentage || 0
      );
      console.log('Transaction created and signed');

      // Step 3: Submit transaction
      console.log('Submitting NFT transaction...');
      const result = await this.submitNFTTransaction(signedXDR);
      console.log('NFT created successfully!');
      console.log('Transaction hash:', result.transactionHash);
      console.log('Metadata URL:', metadataUrl);

      return result;
    } catch (error) {
      console.error('Error in NFT creation process:', error);
      throw error;
    }
  }

  async listNFTForSale(tokenId: string, price: string) {
    try {
      await this.ensureInitialized();
      const sdk = this.stellarSdk;

      // Get the seller's public key
      const publicKey = await getPublicKey();
      const account = await this.server!.loadAccount(publicKey);

      // Convert price from XLM to stroops (1 XLM = 10000000 stroops)
      const priceInStroops = Math.floor(parseFloat(price) * 10000000);

      // Create transaction
      const transaction = new sdk.TransactionBuilder(account, {
        fee: '100000',
        networkPassphrase: this.networkPassphrase
      })
        .addOperation(sdk.Operation.manageData({
          name: `nft_${tokenId}_price`,
          value: priceInStroops.toString()
        }))
        .setTimeout(30)
        .build();

      // Sign transaction
      const signedXDR = await signTransaction(transaction.toXDR(), {
        networkPassphrase: this.networkPassphrase
      });

      // Submit transaction
      const submittedTx = await this.server!.submitTransaction(transaction);

      return {
        success: true,
        transactionHash: submittedTx.hash
      };
    } catch (error) {
      console.error('Error listing NFT:', error);
      throw error;
    }
  }

  async buyNFT(tokenId: string, price: string) {
    try {
      await this.ensureInitialized();
      const sdk = this.stellarSdk;

      // Get the buyer's public key
      const publicKey = await getPublicKey();
      const account = await this.server!.loadAccount(publicKey);

      // Convert price from XLM to stroops
      const priceInStroops = Math.floor(parseFloat(price) * 10000000);

      // Create transaction
      const transaction = new sdk.TransactionBuilder(account, {
        fee: '100000',
        networkPassphrase: this.networkPassphrase
      })
        .addOperation(sdk.Operation.payment({
          destination: this.contractId,
          asset: sdk.Asset.native(),
          amount: (priceInStroops / 10000000).toString()
        }))
        .setTimeout(30)
        .build();

      // Sign transaction
      const signedXDR = await signTransaction(transaction.toXDR(), {
        networkPassphrase: this.networkPassphrase
      });

      // Submit transaction
      const submittedTx = await this.server!.submitTransaction(transaction);

      return {
        success: true,
        transactionHash: submittedTx.hash
      };
    } catch (error) {
      console.error('Error buying NFT:', error);
      throw error;
    }
  }

  async getNFTMetadata(cid: string): Promise<NFTMetadata> {
    try {
      await this.ensureInitialized();

      // Decode base64 CID if needed
      let decodedCid = cid;
      try {
        if (cid.includes('=')) { // Check if it looks like base64
          decodedCid = Buffer.from(cid, 'base64').toString('utf8');
          console.log('Decoded base64 CID:', decodedCid);
        }
      } catch (error) {
        console.warn('Failed to decode CID as base64, using as-is:', cid);
      }

      // Clean the CID - remove any invalid characters and whitespace
      const cleanCid = decodedCid.trim().replace(/[^\w\-]/g, '');
      console.log('Original CID:', cid);
      console.log('Clean CID:', cleanCid);

      // Use multiple IPFS gateways in case one fails
      const gateways = [
        `https://nftstorage.link/ipfs/${cleanCid}`,
        `https://ipfs.io/ipfs/${cleanCid}`,
        `https://cloudflare-ipfs.com/ipfs/${cleanCid}`
      ];

      let lastError;
      for (const gateway of gateways) {
        try {
          console.log('Attempting to fetch NFT metadata from:', gateway);
          const response = await fetch(gateway, {
            method: 'GET',
            headers: {
              'Accept': 'application/json'
            }
          });

          if (response.ok) {
            const metadata = await response.json();
            console.log('Successfully fetched metadata:', metadata);
            
            // If the metadata has an IPFS image URL, ensure it uses a working gateway
            if (metadata.image && metadata.image.startsWith('ipfs://')) {
              const imageCid = metadata.image.replace('ipfs://', '');
              metadata.image = `https://nftstorage.link/ipfs/${imageCid}`;
            }
            
            return metadata;
          }
          
          console.warn(`Failed to fetch from ${gateway}:`, response.status);
          lastError = new Error(`${response.status} ${response.statusText}`);
        } catch (error) {
          console.warn(`Error fetching from ${gateway}:`, error);
          lastError = error;
        }
      }

      throw lastError || new Error('Failed to fetch metadata from all gateways');
    } catch (error) {
      console.error('Error fetching NFT metadata:', {
        cid,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async validateNFTParams(price: string, royaltyPercentage: string): Promise<void> {
    const priceNum = Number(price);
    const royaltyNum = Number(royaltyPercentage);

    if (isNaN(priceNum) || priceNum < Number(NFT_CONFIG.MIN_PRICE)) {
      throw new Error(`Price must be at least ${NFT_CONFIG.MIN_PRICE} XLM`);
    }

    if (
      isNaN(royaltyNum) ||
      royaltyNum < 0 ||
      royaltyNum > Number(NFT_CONFIG.MAX_ROYALTY)
    ) {
      throw new Error(`Royalty must be between 0 and ${NFT_CONFIG.MAX_ROYALTY}%`);
    }
  }

  async getNFTsByOwner(ownerAddress: string): Promise<NFTMetadata[]> {
    try {
      await this.ensureInitialized();
      
      // Get account data
      const account = await this.server!.loadAccount(ownerAddress);
      const nfts: NFTMetadata[] = [];

      // Filter data entries for NFT metadata
      const dataEntries = Object.entries(account.data_attr || {})
        .filter(([key]) => key.startsWith('nft_metadata_cid'))
        .map(([_, value]) => {
          try {
            // First decode from base64
            const decoded = Buffer.from(value as string, 'base64').toString('utf8');
            console.log('Decoded CID:', decoded);
            return decoded;
          } catch (error) {
            console.error('Error decoding CID:', error);
            return null;
          }
        })
        .filter((cid): cid is string => cid !== null); // Type guard to remove nulls

      // Fetch metadata for each NFT
      for (const cid of dataEntries) {
        try {
          console.log('Processing CID for owned NFT:', cid);
          const metadata = await this.getNFTMetadata(cid);
          nfts.push(metadata);
        } catch (error) {
          console.error(`Error fetching metadata for NFT with CID ${cid}:`, error);
        }
      }

      return nfts;
    } catch (error) {
      console.error('Error fetching NFTs by owner:', error);
      throw error;
    }
  }

  async getNFTsByCreator(creatorAddress: string): Promise<NFTMetadata[]> {
    try {
      await this.ensureInitialized();
      
      // Get account transactions
      const transactions = await this.server!.transactions()
        .forAccount(creatorAddress)
        .limit(200)
        .order('desc')
        .call();

      const nfts: NFTMetadata[] = [];
      const processedCIDs = new Set();

      // Process each transaction
      for (const tx of transactions.records) {
        try {
          const operations = await tx.operations();
          
          // Look for NFT creation operations
          for (const op of operations.records) {
            if (op.type === 'manage_data' && op.name === 'nft_metadata_cid') {
              try {
                const value = op.value as unknown as Buffer;
                const cid = value.toString('utf8');
                console.log('Processing CID for created NFT:', cid);
                
                // Skip if we've already processed this CID
                if (processedCIDs.has(cid)) continue;
                processedCIDs.add(cid);

                const metadata = await this.getNFTMetadata(cid);
                nfts.push({
                  ...metadata,
                  transactionHash: tx.hash,
                  created_at: tx.created_at
                });
              } catch (error) {
                console.error('Error processing NFT metadata:', error);
              }
            }
          }
        } catch (error) {
          console.error('Error processing transaction:', error);
        }
      }

      // Sort NFTs by creation date, newest first
      return nfts.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
        const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
    } catch (error) {
      console.error('Error fetching NFTs by creator:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const nftService = new NFTService();



// Now that we've added the ability to view the created NFT, here's what we can do next:
// Verify the NFT:
// Go to http://localhost:3000/test
// Click the new "View Created NFT" button to see the details of your newly minted NFT
// You should see the name, description, image, and attributes (including creator and royalty information)
// Next Features to Implement:
// We can proceed with implementing the following features:
// NFT Listing:
// Create a marketplace page where users can list their NFTs for sale
// Implement price setting functionality
// Add listing status tracking
// NFT Browsing:
// Create a gallery page to browse all listed NFTs
// Add filtering and sorting options
// Implement search functionality
// NFT Trading:
// Implement the buy functionality
// Add transaction history
// Handle royalty payments
// User Dashboard:
// Show owned NFTs
// Display listing status
// Track sales and purchases
// Which of these features would you like to implement next? I recommend starting with the NFT Listing feature since we already have the base functionality in the nftService.listNFTForSale method.
