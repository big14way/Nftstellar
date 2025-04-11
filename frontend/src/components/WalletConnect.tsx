import React, { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { RiWallet3Line } from 'react-icons/ri';
import { HiLogout } from 'react-icons/hi';

const WalletConnect: React.FC = () => {
  const { isConnected, connect, disconnect, publicKey } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await connect();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
      setTimeout(() => setError(null), 5000); // Clear error after 5 seconds
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center">
      {!isConnected ? (
        <div className="relative">
          <button
            onClick={handleConnect}
            disabled={isLoading}
            className="group relative flex items-center space-x-2 px-4 py-2 bg-dark-800 text-white rounded-xl 
                     overflow-hidden transition-all duration-300 hover:shadow-glow disabled:opacity-50 
                     disabled:cursor-not-allowed"
          >
            {/* Gradient background that shows on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-accent-400 opacity-0 
                          group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Button content */}
            <div className="relative flex items-center space-x-2">
              <RiWallet3Line className="h-5 w-5 text-primary-400 group-hover:text-white transition-colors" />
              <span className="font-medium">
                {isLoading ? 'Connecting...' : 'Connect Wallet'}
              </span>
            </div>
          </button>

          {/* Error message */}
          {error && (
            <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-red-500/10 border border-red-500/20 
                          rounded-lg text-red-500 text-sm">
              {error}
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center space-x-3">
          {/* Connected wallet display */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-400 to-accent-400 rounded-xl 
                          opacity-20 group-hover:opacity-100 transition-opacity duration-300 blur" />
            <div className="relative flex items-center space-x-2 px-3 py-1.5 bg-dark-800 rounded-xl border border-dark-700">
              <div className="h-2 w-2 bg-primary-400 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-dark-200 font-mono group-hover:text-white transition-colors">
                {publicKey?.substring(0, 4)}...{publicKey?.substring(publicKey.length - 4)}
              </span>
            </div>
          </div>

          {/* Disconnect button */}
          <button
            onClick={disconnect}
            className="relative group p-2 text-dark-400 rounded-lg transition-all duration-300"
          >
            <div className="absolute inset-0 bg-red-400/10 rounded-lg opacity-0 
                          group-hover:opacity-100 transition-opacity duration-300" />
            <HiLogout className="relative h-5 w-5 group-hover:text-red-400 transition-colors" />
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletConnect; 