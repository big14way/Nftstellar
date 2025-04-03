export const NFT_CONFIG = {
  // Network configuration
  NETWORK: process.env.NEXT_PUBLIC_NETWORK || 'testnet',
  RPC_URL: process.env.NEXT_PUBLIC_RPC_URL || 'https://soroban-testnet.stellar.org',
  NETWORK_PASSPHRASE: process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015',
  
  // Contract configuration
  NFT_CONTRACT_ID: process.env.NEXT_PUBLIC_NFT_CONTRACT_ID || '',
  MARKETPLACE_CONTRACT_ID: process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ID || '',
  
  // IPFS configuration
  IPFS_GATEWAY: process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs/',
  
  // File upload constraints
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  
  // NFT parameters
  MIN_PRICE: 1, // Minimum price in XLM
  MAX_ROYALTY: 15, // Maximum royalty percentage
  
  // Metadata schema
  METADATA_SCHEMA: {
    required: ['name', 'description', 'image'],
    properties: {
      name: {
        type: 'string',
        maxLength: 100
      },
      description: {
        type: 'string',
        maxLength: 1000
      },
      image: {
        type: 'string'
      },
      attributes: {
        type: 'array'
      }
    }
  }
}; 