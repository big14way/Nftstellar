import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import WalletConnect from './WalletConnect';

const Navigation: React.FC = () => {
  const router = useRouter();
  
  const links = [
    { href: '/', label: 'Home' },
    { href: '/test', label: 'SDK Test' },
    { href: '/mint', label: 'Mint NFT' },
    { href: '/wallet-demo', label: 'Wallet Demo' },
  ];
  
  return (
    <nav className="bg-gray-800 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          <div className="flex space-x-4">
            {links.map((link) => {
              const isActive = router.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-150 ${
                    isActive 
                      ? 'bg-gray-900 text-white' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
          
          <WalletConnect />
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 