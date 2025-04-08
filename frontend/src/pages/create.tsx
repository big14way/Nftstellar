import React from 'react';
import styles from '@/styles/Create.module.css';
import WalletRequired from '@/components/WalletRequired';
import CreateNFTForm from '@/components/CreateNFTForm';
import Layout from '@/components/Layout';

const CreateNFTPage = () => {
  return (
    <Layout title="Create NFT | Stellar NFT Marketplace">
      <WalletRequired>
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Create NFT</h1>
          </div>
          
          <div className="bg-dark-800 rounded-xl p-6 md:p-8 shadow-lg">
            <CreateNFTForm />
          </div>
        </div>
      </WalletRequired>
    </Layout>
  );
};

export default CreateNFTPage; 