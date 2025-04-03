import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useWallet } from '@/contexts/WalletContext';
import WalletConnect from './WalletConnect';

interface WalletRequiredProps {
  children: React.ReactNode;
}

const WalletRequired: React.FC<WalletRequiredProps> = ({ children }) => {
  const { isConnected } = useWallet();

  if (!isConnected) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h2>
            <p className="text-dark-300 mb-8">
              Please connect your wallet to access this page and create NFTs.
            </p>
          </div>
          <WalletConnect />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default WalletRequired; 