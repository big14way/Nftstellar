import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useWallet } from '@/contexts/WalletContext';

interface WalletRequiredProps {
  children: React.ReactNode;
}

const WalletRequired: React.FC<WalletRequiredProps> = ({ children }) => {
  const { isConnected } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  if (!isConnected) {
    return null;
  }

  return <>{children}</>;
};

export default WalletRequired; 