import axios from 'axios';
import { NFT_CONFIG } from '@/config/nft.config';

interface MetadataProperty {
  type: string;
  maxLength?: number;
  pattern?: string;
}

interface MetadataSchema {
  required: string[];
  properties: Record<string, MetadataProperty>;
}

class IPFSService {
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly jwt: string;
  private readonly gateway: string = 'https://gateway.pinata.cloud/ipfs/';
  private readonly apiUrl: string = 'https://api.pinata.cloud';

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY || '';
    this.apiSecret = process.env.NEXT_PUBLIC_PINATA_API_SECRET || '';
    this.jwt = process.env.NEXT_PUBLIC_PINATA_JWT || '';

    if (!this.jwt && (!this.apiKey || !this.apiSecret)) {
      throw new Error('Pinata credentials not found. Please set PINATA_JWT or both PINATA_API_KEY and PINATA_API_SECRET in your environment variables.');
    }
  }

  private getHeaders(contentType?: string) {
    const headers: Record<string, string> = {};
    
    if (this.jwt) {
      headers['Authorization'] = `Bearer ${this.jwt}`;
    } else if (this.apiKey && this.apiSecret) {
      headers['pinata_api_key'] = this.apiKey;
      headers['pinata_secret_api_key'] = this.apiSecret;
    } else {
      throw new Error('No valid Pinata credentials found');
    }

    if (contentType) {
      headers['Content-Type'] = contentType;
    }

    return headers;
  }

  /**
   * Upload a file to IPFS
   * @param file The file to upload
   * @returns The IPFS CID of the uploaded file
   */
  async uploadFile(file: File): Promise<string> {
    try {
      console.log('Starting file upload to IPFS...');
      console.log('File details:', {
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024 / 1024).toFixed(2)}MB`
      });

      // Validate file size
      if (file.size > NFT_CONFIG.MAX_FILE_SIZE) {
        throw new Error(`File size exceeds ${NFT_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB limit`);
      }

      // Validate file type
      if (!NFT_CONFIG.ALLOWED_FILE_TYPES.includes(file.type)) {
        throw new Error(`Invalid file type. Supported types: ${NFT_CONFIG.ALLOWED_FILE_TYPES.join(', ')}`);
      }

      // Create form data
      const formData = new FormData();
      formData.append('file', file);

      // Add pinata metadata
      const metadata = JSON.stringify({
        name: file.name,
        keyvalues: {
          type: 'nft-image'
        }
      });
      formData.append('pinataMetadata', metadata);

      const options = {
        headers: this.getHeaders('multipart/form-data'),
        maxBodyLength: Infinity
      };

      // Log headers safely by casting to Record<string, string>
      const headers = options.headers as Record<string, string>;
      console.log('Request headers:', {
        ...headers,
        Authorization: headers['Authorization'] ? 'Bearer [REDACTED]' : undefined,
        pinata_api_key: headers['pinata_api_key'] ? '[REDACTED]' : undefined,
        pinata_secret_api_key: headers['pinata_secret_api_key'] ? '[REDACTED]' : undefined
      });

      // Upload to Pinata
      console.log('Sending request to Pinata...');
      const response = await axios.post(
        `${this.apiUrl}/pinning/pinFileToIPFS`,
        formData,
        options
      );

      console.log('Pinata response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });

      if (!response.data || !response.data.IpfsHash) {
        console.error('Invalid Pinata response:', response.data);
        throw new Error('Invalid response from Pinata');
      }

      const ipfsUrl = `ipfs://${response.data.IpfsHash}`;
      console.log('File successfully uploaded to IPFS:', ipfsUrl);
      return ipfsUrl;
    } catch (error: any) {
      console.error('Detailed upload error:', {
        message: error.message,
        response: {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        },
        request: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers ? {
            ...error.config.headers,
            Authorization: error.config.headers.Authorization ? 'Bearer [REDACTED]' : undefined,
            pinata_api_key: error.config.headers.pinata_api_key ? '[REDACTED]' : undefined,
            pinata_secret_api_key: error.config.headers.pinata_secret_api_key ? '[REDACTED]' : undefined
          } : null
        }
      });

      if (error.response?.status === 400) {
        throw new Error(`Failed to upload to IPFS: Invalid request. Details: ${JSON.stringify(error.response.data)}`);
      } else if (error.response?.status === 401) {
        throw new Error('Failed to upload to IPFS: Invalid Pinata credentials. Please check your API key and secret.');
      } else {
        throw new Error(`Failed to upload to IPFS: ${error.message}`);
      }
    }
  }

  /**
   * Upload NFT metadata to IPFS
   * @param metadata The NFT metadata object
   * @returns The IPFS CID of the metadata
   */
  async uploadMetadata(metadata: any): Promise<string> {
    try {
      // Validate metadata
      this.validateMetadata(metadata);

      // Upload JSON to Pinata
      const response = await axios.post(
        `${this.apiUrl}/pinning/pinJSONToIPFS`,
        {
          pinataContent: metadata,
          pinataMetadata: {
            name: 'nft-metadata.json',
            keyvalues: {
              type: 'nft-metadata'
            }
          }
        },
        {
          headers: this.getHeaders('application/json')
        }
      );

      if (response.status !== 200) {
        throw new Error('Failed to upload metadata to Pinata');
      }

      // Return the IPFS URL
      return `${this.gateway}${response.data.IpfsHash}`;
    } catch (error) {
      console.error('Error uploading metadata to IPFS:', error);
      throw error;
    }
  }

  /**
   * Validate metadata against the schema
   * @param metadata The metadata object to validate
   */
  private validateMetadata(metadata: any): void {
    const { required, properties } = NFT_CONFIG.METADATA_SCHEMA as MetadataSchema;

    // Check required fields
    for (const field of required) {
      if (!metadata[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate property types and constraints
    for (const [key, value] of Object.entries(metadata)) {
      const schema = properties[key];
      if (!schema) continue;

      if (schema.type === 'string' && typeof value !== 'string') {
        throw new Error(`${key} must be a string`);
      }
      if (schema.maxLength && typeof value === 'string' && value.length > schema.maxLength) {
        throw new Error(`${key} exceeds maximum length of ${schema.maxLength}`);
      }
      if (schema.pattern && typeof value === 'string' && !new RegExp(schema.pattern).test(value)) {
        throw new Error(`${key} does not match required pattern: ${schema.pattern}`);
      }
    }
  }

  /**
   * Get the HTTP URL for an IPFS resource
   * @param ipfsUrl The IPFS URL (ipfs://...)
   * @returns The HTTP gateway URL
   */
  getHttpUrl(ipfsUrl: string): string {
    // Convert ipfs:// URL to HTTP URL if needed
    if (ipfsUrl.startsWith('ipfs://')) {
      const cid = ipfsUrl.replace('ipfs://', '');
      return `${this.gateway}${cid}`;
    }
    return ipfsUrl;
  }
}

// Export a singleton instance
export const ipfsService = new IPFSService(); 