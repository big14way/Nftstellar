import React from 'react';
import Link from 'next/link';
import { RiRocketLine, RiWalletLine, RiShoppingBagLine } from 'react-icons/ri';
import NFTGrid from '@/components/NFTGrid';
import { useWallet } from '@/contexts/WalletContext';

// Featured NFTs
const featuredNFTs = [
  {
    id: '5',
    title: 'Stellar Genesis #1',
    image: '/nft-placeholder.png',
    price: '500',
    creator: '0xf234...a678',
    likes: 120,
    isListed: true,
  },
  {
    id: '6',
    title: 'Space Explorer',
    image: '/nft-placeholder.png',
    price: '300',
    creator: '0xe765...b321',
    likes: 85,
    isListed: true,
  },
  {
    id: '7',
    title: 'Cosmic Collection #3',
    image: '/nft-placeholder.png',
    price: '250',
    creator: '0xd876...c234',
    likes: 67,
    isListed: true,
  }
];

const Home: React.FC = () => {
  const { isConnected } = useWallet();

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-primary-500/20 via-dark-950 to-dark-950" />
        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500 bg-clip-text text-transparent">
              Discover, Collect, and Trade Stellar NFTs
            </h1>
            <p className="text-xl text-dark-300 mb-8">
              The premier marketplace for Stellar blockchain NFTs. Buy, sell, and explore unique digital assets.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link 
                href="/browse"
                className="btn-primary px-8 py-3 text-lg"
              >
                Explore NFTs
              </Link>
              {isConnected && (
                <Link 
                  href="/create"
                  className="btn-secondary px-8 py-3 text-lg"
                >
                  Create NFT
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-dark-900/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">
            Why Choose Our Platform?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-dark-800 p-6 rounded-xl">
              <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center mb-4">
                <RiRocketLine className="w-6 h-6 text-primary-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Fast & Secure</h3>
              <p className="text-dark-300">
                Lightning-fast transactions on the Stellar blockchain with top-tier security.
              </p>
            </div>
            <div className="bg-dark-800 p-6 rounded-xl">
              <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center mb-4">
                <RiWalletLine className="w-6 h-6 text-primary-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Low Fees</h3>
              <p className="text-dark-300">
                Minimal transaction fees thanks to Stellar's efficient network.
              </p>
            </div>
            <div className="bg-dark-800 p-6 rounded-xl">
              <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center mb-4">
                <RiShoppingBagLine className="w-6 h-6 text-primary-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Easy to Use</h3>
              <p className="text-dark-300">
                User-friendly interface for seamless NFT trading experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured NFTs Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-white">Featured NFTs</h2>
            <Link 
              href="/browse"
              className="text-primary-500 hover:text-primary-400 transition-colors duration-200"
            >
              View All →
            </Link>
          </div>
          <NFTGrid nfts={featuredNFTs} loading={false} />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-dark-900/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-4xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                1000+
              </p>
              <p className="text-dark-300 mt-2">NFTs Listed</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                500+
              </p>
              <p className="text-dark-300 mt-2">Artists</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                10k+
              </p>
              <p className="text-dark-300 mt-2">Users</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                5k+
              </p>
              <p className="text-dark-300 mt-2">Trades</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 