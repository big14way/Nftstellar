import { useState, useEffect, ChangeEvent } from 'react';
import { useAppContext } from '../providers/AppContext';
import Layout from '../components/Layout';
import styles from '../styles/Create.module.css';

const CreateNFTPage = () => {
  const { state } = useAppContext();
  const { isConnected, walletKey } = state;
  
  const [isClientSide, setIsClientSide] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [nftForm, setNftForm] = useState({
    title: '',
    description: '',
    price: '',
    royaltyPercentage: '10',
    category: 'art'
  });
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  useEffect(() => {
    setIsClientSide(true);
  }, []);
  
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNftForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileToUpload(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const validateForm = (): boolean => {
    if (!isConnected) {
      setErrorMessage('Please connect your wallet first to create an NFT');
      return false;
    }
    
    if (!fileToUpload) {
      setErrorMessage('Please select an image for your NFT');
      return false;
    }
    
    if (!nftForm.title.trim()) {
      setErrorMessage('Please provide a title for your NFT');
      return false;
    }
    
    if (!nftForm.description.trim()) {
      setErrorMessage('Please provide a description for your NFT');
      return false;
    }
    
    if (!nftForm.price || isNaN(Number(nftForm.price)) || Number(nftForm.price) <= 0) {
      setErrorMessage('Please provide a valid price (greater than 0)');
      return false;
    }
    
    return true;
  };
  
  const handleCreateNFT = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate NFT creation process
      console.log('Creating NFT with data:', {
        ...nftForm,
        creator: walletKey,
        file: fileToUpload
      });
      
      // In a real implementation, this would:
      // 1. Upload the file to IPFS
      // 2. Create metadata and upload to IPFS
      // 3. Mint the NFT on the Stellar blockchain
      
      // Simulate a delay for the creation process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccessMessage('NFT created successfully! It will appear in the marketplace soon.');
      
      // Reset the form
      setNftForm({
        title: '',
        description: '',
        price: '',
        royaltyPercentage: '10',
        category: 'art'
      });
      setFileToUpload(null);
      setPreviewImage(null);
      
    } catch (error) {
      console.error('Error creating NFT:', error);
      setErrorMessage('Failed to create NFT. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isClientSide) {
    return null; // Avoid rendering on server to prevent hydration issues
  }
  
  return (
    <Layout>
      <div className={styles.container}>
        <h1 className={styles.title}>Create New NFT</h1>
        <p className={styles.subtitle}>Create and mint your unique digital asset on the Stellar blockchain</p>
        
        {!isConnected && (
          <div className={styles.walletWarning}>
            <p>Please connect your wallet to create an NFT</p>
          </div>
        )}
        
        <form className={styles.form} onSubmit={handleCreateNFT}>
          <div className={styles.formGrid}>
            <div className={styles.uploadSection}>
              <div 
                className={`${styles.dropzone} ${previewImage ? styles.hasPreview : ''}`}
                onClick={() => document.getElementById('fileInput')?.click()}
              >
                {previewImage ? (
                  <img src={previewImage} alt="NFT Preview" className={styles.preview} />
                ) : (
                  <div className={styles.uploadPrompt}>
                    <svg className={styles.uploadIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    <p>Click or drag to upload image</p>
                    <span className={styles.supportedFormats}>Supported formats: JPG, PNG, GIF, SVG, WEBP</span>
                  </div>
                )}
              </div>
              <input 
                type="file" 
                id="fileInput" 
                accept="image/*" 
                onChange={handleFileChange} 
                className={styles.fileInput} 
              />
              {previewImage && (
                <button 
                  type="button" 
                  className={styles.removeButton}
                  onClick={() => {
                    setPreviewImage(null);
                    setFileToUpload(null);
                    if (document.getElementById('fileInput')) {
                      (document.getElementById('fileInput') as HTMLInputElement).value = '';
                    }
                  }}
                >
                  Remove Image
                </button>
              )}
            </div>
            
            <div className={styles.detailsSection}>
              <div className={styles.formGroup}>
                <label htmlFor="title" className={styles.label}>Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={nftForm.title}
                  onChange={handleInputChange}
                  placeholder="Enter a name for your NFT"
                  className={styles.input}
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="description" className={styles.label}>Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={nftForm.description}
                  onChange={handleInputChange}
                  placeholder="Provide a detailed description of your NFT"
                  className={styles.textarea}
                  rows={4}
                  required
                />
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="price" className={styles.label}>Price (XLM) *</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={nftForm.price}
                    onChange={handleInputChange}
                    placeholder="0.0"
                    min="0"
                    step="0.1"
                    className={styles.input}
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="royaltyPercentage" className={styles.label}>Royalty %</label>
                  <input
                    type="number"
                    id="royaltyPercentage"
                    name="royaltyPercentage"
                    value={nftForm.royaltyPercentage}
                    onChange={handleInputChange}
                    placeholder="10"
                    min="0"
                    max="50"
                    className={styles.input}
                  />
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="category" className={styles.label}>Category</label>
                <select
                  id="category"
                  name="category"
                  value={nftForm.category}
                  onChange={handleInputChange}
                  className={styles.select}
                >
                  <option value="art">Art</option>
                  <option value="collectibles">Collectibles</option>
                  <option value="music">Music</option>
                  <option value="photography">Photography</option>
                  <option value="sports">Sports</option>
                  <option value="utility">Utility</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              {errorMessage && (
                <div className={styles.errorMessage}>
                  {errorMessage}
                </div>
              )}
              
              {successMessage && (
                <div className={styles.successMessage}>
                  {successMessage}
                </div>
              )}
              
              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={isSubmitting || !isConnected}
              >
                {isSubmitting ? (
                  <>
                    <span className={styles.spinnerSmall}></span>
                    Creating NFT...
                  </>
                ) : (
                  'Create NFT'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CreateNFTPage; 