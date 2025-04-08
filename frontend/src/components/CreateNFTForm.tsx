import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useWallet } from '@/contexts/WalletContext';
import { nftService } from '@/services/nft.service';
import styles from '@/styles/CreateNFT.module.css';
import { FiUpload } from 'react-icons/fi';
import { useRouter } from 'next/router';
import { NFT_CONFIG } from '@/config/nft.config';

interface FormData {
  name: string;
  description: string;
  price: string;
  royalty: string;
  collection: string;
}

const CreateNFTForm: React.FC = () => {
  const { publicKey } = useWallet();
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    price: '',
    royalty: '2.5',
    collection: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setError('');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxSize: 5242880, // 5MB
    multiple: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    try {
      if (!imageFile) {
        throw new Error('Please upload an image for your NFT');
      }
      if (!formData.name.trim()) {
        throw new Error('Please enter a name for your NFT');
      }
      if (!formData.description.trim()) {
        throw new Error('Please enter a description for your NFT');
      }
      if (!publicKey) {
        throw new Error('Please connect your wallet to create an NFT');
      }

      return true;
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Invalid form data');
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm() || !imageFile || !publicKey) return;

    try {
      setIsCreating(true);

      // Using the same method signature as the old CreateNFT component
      const result = await nftService.createNFT({
        name: formData.name,
        description: formData.description,
        imageFile: imageFile,
        publicKey: publicKey,
        royaltyPercentage: parseFloat(formData.royalty)
      });

      setSuccess(`NFT created successfully! Transaction hash: ${result.transactionHash}`);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        royalty: '2.5',
        collection: ''
      });
      setImageFile(null);
      setImagePreview('');

      // Redirect to My NFTs page after a short delay
      setTimeout(() => {
        router.push('/my-nfts');
      }, 2000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create NFT. Please try again.');
      }
      console.error('Error creating NFT:', err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.uploadSection}>
        <div
          {...getRootProps()}
          className={`${styles.dropzone} ${isDragActive ? styles.dragActive : ''}`}
        >
          <input {...getInputProps()} />
          {imagePreview ? (
            <div className={styles.preview}>
              <img src={imagePreview} alt="NFT Preview" />
              <div className={styles.changeOverlay}>
                <FiUpload />
                <p>Change Image</p>
              </div>
            </div>
          ) : (
            <div className={styles.uploadPrompt}>
              <FiUpload className={styles.uploadIcon} />
              <p>Drag and drop your image here, or click to select</p>
              <span>Supported formats: PNG, JPG, GIF. Max size: 5MB</span>
            </div>
          )}
        </div>
      </div>

      <div className={styles.formFields}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter NFT name"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe your NFT"
            required
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="price">Price (XLM)</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="Enter price in XLM"
              min="0"
              step="0.000001"
            />
            <small>Optional - You can set this when listing</small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="royalty">Royalty (%)</label>
            <input
              type="number"
              id="royalty"
              name="royalty"
              value={formData.royalty}
              onChange={handleInputChange}
              placeholder="Enter royalty percentage"
              min="0"
              max={NFT_CONFIG.MAX_ROYALTY || 15}
              step="0.1"
              required
            />
            <small>You'll receive this % of future sales</small>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="collection">Collection (Optional)</label>
          <input
            type="text"
            id="collection"
            name="collection"
            value={formData.collection}
            onChange={handleInputChange}
            placeholder="Enter collection name"
          />
        </div>

        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isCreating || !publicKey}
        >
          {isCreating ? 'Creating NFT...' : 'Create NFT'}
        </button>
      </div>
    </form>
  );
};

export default CreateNFTForm; 