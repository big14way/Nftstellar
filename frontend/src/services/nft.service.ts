import { getPublicKey, signTransaction } from '@stellar/freighter-api';
import { ipfsService } from './ipfs.service';
import { NFT_CONFIG } from '@/config/nft.config';
import type { Server, TransactionBuilder, Operation, Asset } from 'stellar-sdk';
import * as StellarSdk from 'stellar-sdk';
import BigNumber from 'bignumber.js';

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
  id?: string;
  price?: string;
  tokenId?: string;
  owner?: string;
  isListed?: boolean;
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
    this.networkPassphrase = NFT_CONFIG.NETWORK === 'testnet'
      ? 'Test SDF Network ; September 2015'
      : 'Public Global Stellar Network ; September 2015';
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

  async listNFTForSale(tokenId: string, price: string): Promise<any> {
    try {
      console.log(`Listing NFT with tokenId: ${tokenId} for price: ${price} XLM`);
      
      await this.ensureInitialized();
      const sdk = this.stellarSdk;
      
      // Get the seller's public key directly using the imported function
      const sellerPublicKey = await getPublicKey();
      console.log(`Seller public key: ${sellerPublicKey}`);
      
      // Validate inputs
      if (!tokenId || !price) {
        throw new Error('TokenId and price are required');
      }
      
      // Hash the tokenId instead of just sanitizing to ensure consistent and valid data entry name
      // Create a hash from the tokenId to use as part of the key - this avoids data entry length issues
      let hashKey: string;
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(tokenId);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        hashKey = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 10);
        console.log(`Generated hash key for tokenId: ${hashKey}`);
      } catch (error) {
        // Fallback if crypto API is not available
        console.log('Using fallback tokenId sanitization');
        hashKey = tokenId.replace(/[^a-zA-Z0-9_]/g, '').substring(0, 10);
      }

      // Validate price is a positive number
      const priceValue = parseFloat(price);
      if (isNaN(priceValue) || priceValue <= 0) {
        throw new Error('Price must be a positive number');
      }
      
      try {
        console.log('Loading account...');
        if (!this.server) {
          throw new Error('Stellar server not initialized');
        }
        const account = await this.server.loadAccount(sellerPublicKey);
        console.log('Account loaded successfully');
        
        // Convert price from XLM to stroops (1 XLM = 10,000,000 stroops)
        const priceInStroops = (parseFloat(price) * 10000000).toFixed(0);
        console.log(`Price converted to ${priceInStroops} stroops`);
        
        // Create a data entry name with a consistent format: nft_HASHKEY_price
        const dataEntryName = `nft_${hashKey}_price`;
        console.log(`Using data entry name: ${dataEntryName} (length: ${dataEntryName.length})`);
        
        // Check data entry name length (Stellar limit is 64 bytes)
        if (dataEntryName.length > 64) {
          throw new Error('Data entry name is too long. Please use a shorter token ID.');
        }
        
        console.log('Creating transaction...');
        const transaction = new sdk.TransactionBuilder(account, {
          fee: sdk.BASE_FEE,
          networkPassphrase: this.networkPassphrase
        })
          .addOperation(sdk.Operation.manageData({
            name: dataEntryName,
            value: priceInStroops
          }))
          .setTimeout(180)
          .build();
        
        console.log('Signing transaction...');
        // Use imported signTransaction function instead of window.freighter
        const signedXDR = await signTransaction(transaction.toXDR(), {
          networkPassphrase: this.networkPassphrase
        });
        
        // Submit the signed transaction
        console.log('Submitting transaction...');
        // Convert the signed XDR back to a transaction and submit it
        const signedTransaction = this.stellarSdk.TransactionBuilder.fromXDR(signedXDR, this.networkPassphrase);
        const txResponse = await this.server.submitTransaction(signedTransaction);
        console.log('Transaction submitted successfully:', txResponse);
        
        return {
          success: true,
          transactionHash: txResponse.hash,
          tokenId: hashKey,
          price: price
        };
      } catch (error: any) {
        console.error('Error in Stellar transaction:', error);
        
        // Extract more detailed error from Horizon API if available
        let detailedError = 'Error listing NFT on Stellar network';
        
        if (error.response && error.response.data) {
          const horizonError = error.response.data;
          console.error('Horizon API error:', horizonError);
          
          if (horizonError.extras && horizonError.extras.result_codes) {
            detailedError += `: ${horizonError.extras.result_codes.transaction} - ${horizonError.extras.result_codes.operations?.join(', ') || 'Unknown operation error'}`;
          } else if (horizonError.title) {
            detailedError += `: ${horizonError.title}`;
          }
        }
        
        throw new Error(detailedError);
      }
    } catch (error: any) {
      console.error('Error in listNFTForSale:', error);
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

  /**
   * Transfer an NFT to another address
   * @param tokenId ID of the NFT to transfer
   * @param toAddress Destination address to receive the NFT
   */
  async transferNFT(tokenId: string, toAddress: string): Promise<{ success: boolean; transactionHash: string }> {
    try {
      await this.ensureInitialized();
      const sdk = this.stellarSdk;

      console.log(`Attempting to transfer NFT ${tokenId} to ${toAddress}`);

      // Validate the destination address
      if (!sdk.StrKey.isValidEd25519PublicKey(toAddress)) {
        throw new Error('Invalid destination address');
      }

      // Get the sender's public key
      const senderPublicKey = await getPublicKey();
      console.log(`Sender public key: ${senderPublicKey}`);
      
      // Load account
      const account = await this.server!.loadAccount(senderPublicKey);
      console.log(`Account loaded successfully`);

      // Check if we need to find CID in account data (for IPFS CIDs)
      const isCID = tokenId.startsWith('Qm');
      let dataKey = `nft_${tokenId}_transfer`;
      let ownerKey = `nft_${tokenId}_owner`;
      
      // If it's a CID, directly try to find that CID in the account data
      if (isCID) {
        console.log(`TokenId appears to be a CID: ${tokenId}. Looking for it in account data...`);
        let found = false;
        
        // Check if this CID exists in account data
        for (const [key, value] of Object.entries(account.data_attr || {})) {
          if (key.startsWith('nft_metadata_cid')) {
            try {
              const cidValue = Buffer.from(value as string, 'base64').toString('utf8');
              if (cidValue === tokenId) {
                found = true;
                console.log(`Found matching CID in account data: ${cidValue}`);
                break;
              }
            } catch (error) {
              console.error('Error checking CID value:', error);
            }
          }
        }
        
        if (!found) {
          console.error('CID not found in account data entries');
          console.error('Available data entries:', Object.keys(account.data_attr || {}));
          throw new Error(`Could not find NFT with CID ${tokenId} in your account`);
        }
        
        // Create a hash for the key to avoid length issues
        try {
          const encoder = new TextEncoder();
          const data = encoder.encode(tokenId);
          const hashBuffer = await crypto.subtle.digest('SHA-256', data);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const hashKey = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 10);
          console.log(`Generated hash key for CID: ${hashKey}`);
          
          dataKey = `nft_${hashKey}_transfer`;
          ownerKey = `nft_${hashKey}_owner`;
        } catch (error) {
          console.warn('Error creating hash, using tokenId directly:', error);
        }
      }

      // Create transaction
      console.log(`Using data key: ${dataKey}`);
      console.log(`Using owner key: ${ownerKey}`);
      const transaction = new sdk.TransactionBuilder(account, {
        fee: sdk.BASE_FEE,
        networkPassphrase: this.networkPassphrase
      })
        .addOperation(sdk.Operation.payment({
          destination: toAddress,
          asset: sdk.Asset.native(),
          amount: '0.0001' // Small amount for data entries
        }))
        .addOperation(sdk.Operation.manageData({
          name: dataKey,
          value: toAddress
        }))
        .addOperation(sdk.Operation.manageData({
          name: ownerKey,
          value: toAddress
        }))
        .setTimeout(60)
        .build();

      // Sign transaction
      console.log('Signing transaction...');
      const signedXDR = await signTransaction(transaction.toXDR(), {
        networkPassphrase: this.networkPassphrase
      });

      // Submit transaction
      console.log('Submitting transaction...');
      // Convert the signed XDR back to a transaction and submit it
      const signedTransaction = this.stellarSdk.TransactionBuilder.fromXDR(signedXDR, this.networkPassphrase);
      const submittedTx = await this.server!.submitTransaction(signedTransaction);
      console.log('Transaction submitted successfully:', submittedTx.hash);

      console.log(`NFT ${tokenId} transferred to ${toAddress} successfully`);

      return {
        success: true,
        transactionHash: submittedTx.hash
      };
    } catch (error) {
      console.error('Error transferring NFT:', error);
      throw error;
    }
  }

  /**
   * Remove an NFT listing from the marketplace
   * @param tokenId ID of the NFT to delist
   */
  async cancelNFTListing(tokenId: string): Promise<{ success: boolean; transactionHash: string }> {
    try {
      await this.ensureInitialized();
      const sdk = this.stellarSdk;

      console.log(`Attempting to delist NFT with tokenId: ${tokenId}`);

      // Get the owner's public key
      const publicKey = await getPublicKey();
      
      console.log(`Loading account for ${publicKey}`);
      const account = await this.server!.loadAccount(publicKey);
      console.log('Account loaded successfully');
      
      // Log all data entries to help debug
      console.log('Available data entries:', Object.keys(account.data_attr || {}));

      // Generate the same hash key as used in listNFTForSale
      let hashKey: string;
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(tokenId);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        hashKey = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 10);
        console.log(`Generated hash key for tokenId: ${hashKey}`);
      } catch (error) {
        // Fallback if crypto API is not available
        console.log('Using fallback tokenId sanitization');
        hashKey = tokenId.replace(/[^a-zA-Z0-9_]/g, '').substring(0, 10);
      }

      // Use the same key format as in listNFTForSale
      let dataEntryName = `nft_${hashKey}_price`;
      console.log(`Using data entry name for delisting: ${dataEntryName}`);
      
      // Check if the data entry exists before trying to remove it
      const dataEntryExists = account.data_attr && account.data_attr[dataEntryName];
      if (!dataEntryExists) {
        console.warn(`Data entry ${dataEntryName} not found. Available entries:`, Object.keys(account.data_attr || {}));
        // Check if there's a simpler key format that might have been used
        const simpleKey = `nft_${tokenId}_price`;
        if (account.data_attr && account.data_attr[simpleKey]) {
          console.log(`Found data entry with simple key format: ${simpleKey}`);
          // Use the simple key format instead
          dataEntryName = simpleKey;
        } else {
          // Return success even if the entry doesn't exist (already delisted)
          console.log('NFT is not listed or already delisted');
          return {
            success: true,
            transactionHash: 'not_required_already_delisted'
          };
        }
      }

      console.log(`Creating transaction to remove data entry: ${dataEntryName}`);
      // Create transaction to remove the listing
      const transaction = new sdk.TransactionBuilder(account, {
        fee: sdk.BASE_FEE,
        networkPassphrase: this.networkPassphrase
      })
        .addOperation(sdk.Operation.manageData({
          name: dataEntryName,
          value: null // Setting to null removes the data entry
        }))
        .setTimeout(180) // Longer timeout to ensure it goes through
        .build();

      // Sign transaction
      console.log('Signing transaction...');
      const signedXDR = await signTransaction(transaction.toXDR(), {
        networkPassphrase: this.networkPassphrase
      });

      // Submit transaction
      console.log('Submitting transaction...');
      const signedTransaction = this.stellarSdk.TransactionBuilder.fromXDR(signedXDR, this.networkPassphrase);
      const submittedTx = await this.server!.submitTransaction(signedTransaction);

      console.log(`NFT listing cancelled successfully. Transaction hash: ${submittedTx.hash}`);

      return {
        success: true,
        transactionHash: submittedTx.hash
      };
    } catch (error: any) {
      console.error('Error cancelling NFT listing:', error);
      
      // Extract more detailed error information
      let errorMessage = 'Failed to delist NFT';
      if (error.response && error.response.data) {
        const horizonError = error.response.data;
        console.error('Horizon API error:', horizonError);
        
        if (horizonError.extras && horizonError.extras.result_codes) {
          errorMessage += `: ${horizonError.extras.result_codes.transaction} - ${horizonError.extras.result_codes.operations?.join(', ') || 'Unknown operation error'}`;
        } else if (horizonError.title) {
          errorMessage += `: ${horizonError.title}`;
        }
      }
      
      throw new Error(errorMessage);
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

      // Get all price entries to check if any NFTs are listed
      const priceEntries = Object.entries(account.data_attr || {})
        .filter(([key]) => key.includes('_price') && key.startsWith('nft_'))
        .reduce((acc, [key, value]) => {
          try {
            // Extract the token ID part from the key (nft_TOKENID_price)
            const parts = key.split('_');
            if (parts.length >= 3) {
              const tokenId = parts[1];
              // Convert stroops to XLM (1 XLM = 10,000,000 stroops)
              const priceInStroops = Buffer.from(value as string, 'base64').toString('utf8');
              const priceInXLM = (parseInt(priceInStroops) / 10000000).toString();
              acc[tokenId] = priceInXLM;
            }
            return acc;
          } catch (error) {
            console.error(`Error processing price entry ${key}:`, error);
            return acc;
          }
        }, {} as Record<string, string>);

      console.log('Price entries found:', priceEntries);

      // Fetch metadata for each NFT
      for (const cid of dataEntries) {
        try {
          console.log('Processing CID for owned NFT:', cid);
          const metadata = await this.getNFTMetadata(cid);
          
          // Generate a tokenId from the transaction hash or use a fallback
          if (!metadata.tokenId) {
            metadata.tokenId = metadata.transactionHash || metadata.id || cid;
          }

          // Check if this NFT is listed by looking for a price entry
          // First try direct matching
          let hashKey = '';
          try {
            // Create a hash for the tokenId to match how we store price entries
            const encoder = new TextEncoder();
            const data = encoder.encode(metadata.tokenId);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            hashKey = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 10);
          } catch (error) {
            // Fallback
            hashKey = metadata.tokenId.replace(/[^a-zA-Z0-9_]/g, '').substring(0, 10);
          }

          // Check if there's a price for this tokenId hash
          if (priceEntries[hashKey]) {
            metadata.price = priceEntries[hashKey];
            console.log(`NFT with CID ${cid} is listed for ${metadata.price} XLM`);
          }
          
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
                
                // Generate a tokenId from the transaction hash
                if (!metadata.tokenId) {
                  metadata.tokenId = tx.hash;
                }
                
                nfts.push({
                  ...metadata,
                  transactionHash: tx.hash,
                  created_at: tx.created_at,
                  tokenId: metadata.tokenId || tx.hash // Ensure tokenId is set
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

  /**
   * Gets a list of NFTs that are available in the marketplace
   */
  async getMarketplaceNFTs(limit: number = 20): Promise<NFTMetadata[]> {
    try {
      await this.ensureInitialized();
      
      console.log('Fetching marketplace NFTs...');
      const nfts: NFTMetadata[] = [];
      
      // Get recent transactions for the network
      const transactions = await this.server!.transactions()
        .limit(100)
        .order('desc')
        .call();
        
      const processedCIDs = new Set();
      let processedCount = 0;
      
      console.log(`Found ${transactions.records.length} recent transactions`);
      
      // First, collect NFTs from accounts that have listing data
      try {
        // Query a few test accounts that might have NFTs (for demo purposes)
        // In production, you would use an indexer or a more targeted approach
        const recentAccounts = await this.server!.operations()
          .limit(50)
          .order('desc')
          .call();
        
        // Extract unique account IDs from operations
        const accountIds = new Set<string>();
        for (const op of recentAccounts.records) {
          if (op.source_account) {
            accountIds.add(op.source_account);
          }
        }
        
        console.log(`Checking ${accountIds.size} accounts for NFT listings...`);
        
        // Check each account for NFT listings
        for (const accountId of Array.from(accountIds)) {
          try {
            const account = await this.server!.loadAccount(accountId);
            
            // Find price entries and NFT metadata entries
            const priceEntries: Record<string, string> = {};
            const metadataCIDs: string[] = [];
            
            // Process data entries
            for (const [key, value] of Object.entries(account.data_attr || {})) {
              if (key.includes('_price') && key.startsWith('nft_')) {
                try {
                  // Key format: nft_TOKENID_price or nft_HASH_price
                  const parts = key.split('_');
                  if (parts.length >= 3) {
                    const tokenId = parts[1]; // This is either the token ID or its hash
                    const priceInStroops = Buffer.from(value as string, 'base64').toString('utf8');
                    const priceInXLM = (parseInt(priceInStroops) / 10000000).toString();
                    priceEntries[tokenId] = priceInXLM;
                    console.log(`Found price entry for token ${tokenId}: ${priceInXLM} XLM`);
                  }
                } catch (error) {
                  console.warn('Error parsing price entry:', error);
                }
              } else if (key.startsWith('nft_metadata_cid')) {
                try {
                  const cid = Buffer.from(value as string, 'base64').toString('utf8');
                  if (!processedCIDs.has(cid)) {
                    metadataCIDs.push(cid);
                    processedCIDs.add(cid);
                  }
                } catch (error) {
                  console.warn('Error decoding CID:', error);
                }
              }
            }
            
            // Process each NFT metadata and check if it's listed
            for (const cid of metadataCIDs) {
              if (processedCount >= limit) break;
              
              try {
                const metadata = await this.getNFTMetadata(cid);
                
                // Generate hash key for the NFT ID
                let hashKey: string;
                try {
                  const tokenId = metadata.tokenId || metadata.id || cid;
                  const encoder = new TextEncoder();
                  const data = encoder.encode(tokenId);
                  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
                  const hashArray = Array.from(new Uint8Array(hashBuffer));
                  hashKey = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 10);
                } catch (error) {
                  const tokenId = metadata.tokenId || metadata.id || cid;
                  hashKey = tokenId.replace(/[^a-zA-Z0-9_]/g, '').substring(0, 10);
                }
                
                // Check if this NFT is listed
                if (priceEntries[hashKey]) {
                  console.log(`Found listed NFT with price: ${priceEntries[hashKey]} XLM`);
                  
                  nfts.push({
                    ...metadata,
                    price: priceEntries[hashKey],
                    tokenId: metadata.tokenId || cid,
                    id: metadata.id || cid,
                    owner: accountId,
                    isListed: true
                  });
                  
                  processedCount++;
                }
              } catch (error) {
                console.warn(`Error processing NFT metadata for CID ${cid}:`, error);
              }
            }
          } catch (error) {
            console.warn(`Error checking account ${accountId}:`, error);
          }
        }
      } catch (error) {
        console.warn('Error querying accounts for listings:', error);
      }
      
      // If we didn't find enough listed NFTs, fall back to recent NFTs
      if (nfts.length < limit) {
        for (const tx of transactions.records) {
          if (processedCount >= limit) break;
          
          try {
            const operations = await tx.operations();
            
            for (const op of operations.records) {
              if (processedCount >= limit) break;
              
              // Look for NFT metadata creation operations
              if (op.type === 'manage_data' && op.name === 'nft_metadata_cid') {
                try {
                  const value = op.value as unknown as Buffer;
                  const cid = value.toString('utf8');
                  
                  // Skip if we've already processed this CID
                  if (processedCIDs.has(cid)) continue;
                  processedCIDs.add(cid);
                  
                  console.log(`Processing NFT with CID ${cid}`);
                  
                  // Get the metadata
                  const metadata = await this.getNFTMetadata(cid);
                  
                  // Try to determine if this NFT is for sale by fetching the source account
                  let isListed = false;
                  let price = '';
                  let owner = op.source_account || '';
                  
                  try {
                    // Load the account to see if it has any price data for this NFT
                    const account = await this.server!.loadAccount(owner);
                    
                    // Generate token hash for looking up price
                    let hashKey = '';
                    try {
                      const tokenId = metadata.tokenId || metadata.id || cid;
                      const encoder = new TextEncoder();
                      const data = encoder.encode(tokenId);
                      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
                      const hashArray = Array.from(new Uint8Array(hashBuffer));
                      hashKey = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 10);
                    } catch (error) {
                      const tokenId = metadata.tokenId || metadata.id || cid;
                      hashKey = tokenId.replace(/[^a-zA-Z0-9_]/g, '').substring(0, 10);
                    }
                    
                    // Look for price data
                    const priceKey = `nft_${hashKey}_price`;
                    if (account.data_attr && account.data_attr[priceKey]) {
                      const priceInStroops = Buffer.from(account.data_attr[priceKey] as string, 'base64').toString('utf8');
                      price = (parseInt(priceInStroops) / 10000000).toString();
                      isListed = true;
                      console.log(`Found listed NFT with price: ${price} XLM`);
                    }
                  } catch (accountError) {
                    console.warn('Error checking if NFT is listed:', accountError);
                  }
                  
                  // For NFTs we found, include them whether listed or not
                  // but mark them appropriately so the UI can filter them
                  nfts.push({
                    ...metadata,
                    id: metadata.id || tx.hash,
                    transactionHash: tx.hash,
                    created_at: tx.created_at,
                    price: isListed ? price : '100', // Use actual price if listed, otherwise placeholder
                    tokenId: metadata.tokenId || tx.hash,
                    owner: owner,
                    isListed: isListed
                  });
                  
                  processedCount++;
                } catch (error) {
                  console.error('Error processing NFT:', error);
                }
              }
            }
          } catch (error) {
            console.error('Error processing transaction:', error);
          }
        }
      }
      
      console.log(`Found ${nfts.length} marketplace NFTs`);
      
      // Return NFTs sorted by creation date
      return nfts.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
        const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
    } catch (error) {
      console.error('Error fetching marketplace NFTs:', error);
      return [];  // Return empty array instead of throwing to prevent errors on the frontend
    }
  }

  async getNFTsReceivedByUser(address: string): Promise<NFTMetadata[]> {
    try {
      await this.ensureInitialized();
      
      // Get account operations that include NFT transfers to this address
      const operations = await this.server!.operations()
        .forAccount(address)
        .limit(200)
        .order('desc')
        .call();

      const receivedNFTs: NFTMetadata[] = [];
      const processedIds = new Set();

      // Process operations to find NFT transfers to this user
      for (const op of operations.records) {
        try {
          if (op.type === 'manage_data' && 
              (op.name.includes('_transfer') || op.name.includes('_owner'))) {
            
            // Convert op.value to string before comparison
            const opValue = typeof op.value === 'string' 
              ? op.value 
              : op.value instanceof Buffer 
                ? op.value.toString('utf8') 
                : String(op.value);
                
            if (opValue === address) {
              // Extract the token ID from the operation name
              const nameParts = op.name.split('_');
              if (nameParts.length >= 2) {
                const tokenId = nameParts[1]; // The part after 'nft_'
                
                // Skip if we've already processed this ID
                if (processedIds.has(tokenId)) continue;
                processedIds.add(tokenId);
                
                // Get the source account (sender)
                const source = op.source_account || '';
                if (source === address) continue; // Skip if sent by self
                
                // Find the metadata CID in the user's account
                const account = await this.server!.loadAccount(address);
                let metadataCID = '';
                
                for (const [key, value] of Object.entries(account.data_attr || {})) {
                  if (key.startsWith('nft_metadata_cid')) {
                    try {
                      const cid = Buffer.from(value as string, 'base64').toString('utf8');
                      try {
                        const metadata = await this.getNFTMetadata(cid);
                        if (metadata.tokenId === tokenId || 
                            metadata.id === tokenId ||
                            metadata.transactionHash === tokenId) {
                          metadataCID = cid;
                          break;
                        }
                      } catch (metadataError) {
                        console.warn(`Could not fetch metadata for ${cid}:`, metadataError);
                      }
                    } catch (error) {
                      console.error('Error checking metadata CID:', error);
                    }
                  }
                }
                
                // If we found the metadata, add it to received NFTs
                if (metadataCID) {
                  try {
                    const metadata = await this.getNFTMetadata(metadataCID);
                    metadata.tokenId = tokenId;
                    receivedNFTs.push({
                      ...metadata,
                      transactionHash: op.transaction_hash,
                      // Add received timestamp
                      created_at: op.created_at
                    });
                  } catch (error) {
                    console.error(`Error fetching metadata for received NFT ${tokenId}:`, error);
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error('Error processing operation:', error);
        }
      }

      return receivedNFTs;
    } catch (error) {
      console.error('Error fetching received NFTs:', error);
      return [];
    }
  }

  async getTransactionHistory(address: string): Promise<any[]> {
    try {
      await this.ensureInitialized();
      
      // Get all transactions for this account
      const transactions = await this.server!.transactions()
        .forAccount(address)
        .limit(100)
        .order('desc')
        .call();
      
      const history: any[] = [];
      
      // Process each transaction
      for (const tx of transactions.records) {
        try {
          const operations = await tx.operations();
          let transactionType = 'unknown';
          let details: any = {};
          
          // Analyze operations to determine transaction type
          for (const op of operations.records) {
            // NFT Mint
            if (op.type === 'manage_data' && op.name === 'nft_metadata_cid') {
              transactionType = 'mint';
              details.cid = op.value;
              
              // Try to get metadata
              try {
                const value = op.value as unknown as Buffer;
                const cid = value.toString('utf8');
                const metadata = await this.getNFTMetadata(cid);
                details.metadata = metadata;
              } catch (error) {
                console.warn('Could not fetch metadata for minted NFT:', error);
              }
            }
            // NFT Transfer (sender)
            else if (op.type === 'manage_data' && 
                op.name.includes('_transfer') && 
                op.source_account === address) {
              transactionType = 'transfer_sent';
              details.recipient = op.value;
              details.tokenId = op.name.split('_')[1];
            }
            // NFT Transfer (recipient)
            else if (op.type === 'manage_data' && op.name.includes('_transfer')) {
              // Convert op.value to string before comparison
              const opValue = typeof op.value === 'string' 
                ? op.value 
                : op.value instanceof Buffer 
                  ? op.value.toString('utf8') 
                  : String(op.value);
                  
              if (opValue === address) {
                transactionType = 'transfer_received';
                details.sender = op.source_account;
                details.tokenId = op.name.split('_')[1];
              }
            }
            // NFT Listed
            else if (op.type === 'manage_data' && 
                op.name.includes('_price') && 
                op.value !== null) {
              transactionType = 'list';
              details.tokenId = op.name.split('_')[1];
              try {
                const priceValue = op.value as unknown as Buffer;
                const priceInStroops = priceValue.toString('utf8');
                details.price = (parseInt(priceInStroops) / 10000000).toString();
              } catch (error) {
                console.warn('Could not parse price:', error);
              }
            }
            // NFT Delisted
            else if (op.type === 'manage_data' && 
                op.name.includes('_price') && 
                op.value === null) {
              transactionType = 'delist';
              details.tokenId = op.name.split('_')[1];
            }
          }
          
          history.push({
            id: tx.id,
            hash: tx.hash,
            type: transactionType,
            details,
            timestamp: tx.created_at,
            ledger: tx.ledger,
            fee_paid: tx.fee_charged,
          });
        } catch (error) {
          console.error('Error processing transaction history item:', error);
        }
      }
      
      return history;
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return [];
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
