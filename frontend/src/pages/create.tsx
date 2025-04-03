import React, { useState, useCallback } from 'react';
import Layout from '@/components/Layout';
import styles from '@/styles/Create.module.css';
import { useDropzone } from 'react-dropzone';
import { FaUpload, FaImage } from 'react-icons/fa';
import { useAppContext } from '@/providers/AppContext';
import Image from 'next/image';
import WalletRequired from '@/components/WalletRequired';
import CreateNFTForm from '@/components/CreateNFTForm';
import CreateNFT from '../components/CreateNFT';

const CreateNFTPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <CreateNFT />
    </div>
  );
};

export default CreateNFTPage; 