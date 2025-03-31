import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useWallet } from '@/contexts/WalletContext';
import styles from '@/styles/CreateNFT.module.css';
import { FiUpload } from 'react-icons/fi';

interface FormData {
  name: string;
  description: string;
  price: string;
  royalty: string;
  collection: string;
}

const CreateNFTForm: React.FC = () => {
  const { publicKey } = useWallet();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    price: '',
    royalty: '',
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
    if (!imageFile) {
      setError('Please upload an image for your NFT');
      return false;
    }
    if (!formData.name.trim()) {
      setError('Please enter a name for your NFT');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Please enter a description for your NFT');
      return false;
    }
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      setError('Please enter a valid price');
      return false;
    }
    if (!formData.royalty || isNaN(Number(formData.royalty)) || Number(formData.royalty) < 0 || Number(formData.royalty) > 15) {
      setError('Please enter a valid royalty percentage (0-15%)');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    try {
      setIsCreating(true);

      // TODO: Implement actual NFT creation logic here
      // 1. Upload image to IPFS
      // 2. Create metadata and upload to IPFS
      // 3. Mint NFT on Stellar blockchain
      
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      setSuccess('NFT created successfully!');
      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        royalty: '',
        collection: ''
      });
      setImageFile(null);
      setImagePreview('');
    } catch (err) {
      setError('Failed to create NFT. Please try again.');
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
              required
            />
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
              max="15"
              step="0.1"
              required
            />
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