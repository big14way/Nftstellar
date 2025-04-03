import { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useWallet } from '../contexts/WalletContext';
import { NFTService } from '../services/nft.service';
import { useDropzone } from 'react-dropzone';
import { NFT_CONFIG } from '../config/nft.config';

const CreateNFT = () => {
  const router = useRouter();
  const { publicKey, isConnected, connect } = useWallet();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    royaltyPercentage: '2.5'
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      setImageFile(file);
      setError('');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': NFT_CONFIG.ALLOWED_FILE_TYPES
    },
    maxSize: NFT_CONFIG.MAX_FILE_SIZE,
    multiple: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    if (!imageFile) {
      setError('Please upload an image for your NFT');
      return;
    }

    if (!formData.name || !formData.description) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setIsCreating(true);

      const nftService = new NFTService();
      const result = await nftService.createNFT({
        name: formData.name,
        description: formData.description,
        imageFile,
        publicKey,
        royaltyPercentage: parseFloat(formData.royaltyPercentage)
      });

      setSuccess(`NFT created successfully! Transaction hash: ${result.transactionHash}`);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        royaltyPercentage: '2.5'
      });
      setImageFile(null);
      setImagePreview('');

      // Add delay before navigation
      setTimeout(() => {
        router.push('/my-nfts');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create NFT');
      console.error('Error creating NFT:', err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Create New NFT</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            NFT Image *
          </label>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'}`}
          >
            <input {...getInputProps()} />
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="NFT Preview"
                className="max-h-64 mx-auto rounded-lg"
              />
            ) : (
              <div className="text-gray-500">
                <p>Drag and drop an image here, or click to select</p>
                <p className="text-sm mt-2">
                  Supported formats: {NFT_CONFIG.ALLOWED_FILE_TYPES.join(', ')}
                </p>
                <p className="text-sm">
                  Max size: {NFT_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            maxLength={100}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            maxLength={1000}
            rows={4}
          />
        </div>

        {/* Royalty Percentage */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Royalty Percentage
          </label>
          <input
            type="number"
            value={formData.royaltyPercentage}
            onChange={(e) => setFormData(prev => ({ ...prev, royaltyPercentage: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="0"
            max={NFT_CONFIG.MAX_ROYALTY}
            step="0.1"
          />
          <p className="text-sm text-gray-500 mt-1">
            Maximum: {NFT_CONFIG.MAX_ROYALTY}%
          </p>
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-600">
            {success}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isCreating || !publicKey}
          className={`w-full py-3 px-4 rounded-lg text-white font-medium
            ${isCreating || !publicKey
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'}`}
        >
          {isCreating ? 'Creating NFT...' : 'Create NFT'}
        </button>

        {!publicKey && (
          <p className="text-sm text-center text-gray-500">
            Please connect your wallet to create an NFT
          </p>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={() => router.push('/marketplace')}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Back to Marketplace
          </button>
          <button
            type="button"
            onClick={() => router.push('/my-nfts')}
            className="px-4 py-2 text-blue-600 hover:text-blue-800 bg-blue-100 rounded-lg hover:bg-blue-200"
          >
            View My NFTs
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateNFT; 