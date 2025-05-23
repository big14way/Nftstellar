import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { RiRocketLine, RiWalletLine, RiShoppingBagLine } from 'react-icons/ri';
import NFTGrid from '@/components/NFTGrid';
import { useWallet } from '@/contexts/WalletContext';
import { nftService } from '@/services/nft.service';
import Layout from '@/components/Layout';
import { NFT } from '@/types/nft';

const Home: React.FC = () => {
  const { isConnected, publicKey } = useWallet();
  const [featuredNFTs, setFeaturedNFTs] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedNFTs = async () => {
      try {
        setLoading(true);
        
        // Attempt to fetch most recent NFTs or fallback to mock data if not available
        let nfts: NFT[] = [];
        
        try {
          // This is a general fetch that would get the most recent NFTs from the marketplace
          // Limit to 6 featured NFTs
          const marketplaceNFTs = await nftService.getMarketplaceNFTs();
          
          if (marketplaceNFTs && marketplaceNFTs.length > 0) {
            nfts = marketplaceNFTs.slice(0, 6).map(nft => ({
              id: nft.id || '',
              tokenId: nft.tokenId || nft.id || '',
              name: nft.name || 'Untitled NFT',
              description: nft.description || '',
              image: nft.image || '/nft-placeholder.png',
              owner: nft.owner || '',
              creator: nft.attributes?.find(attr => attr.trait_type === 'creator')?.value?.toString() || '',
              metadata: {
                ...nft,
                attributes: nft.attributes || []
              }
            }));
          }
        } catch (error) {
          console.error("Error fetching NFTs, using fallback data:", error);
          // Fallback to mock data if the service call fails
          nfts = [
            {
              id: '5',
              tokenId: '5',
              name: 'Stellar Genesis #1',
              description: 'The first NFT on our platform',
              image: '/nft-placeholder.png',
              owner: '0xf234...a678',
              creator: '0xf234...a678',
              metadata: {
                name: 'Stellar Genesis #1',
                description: 'The first NFT on our platform',
                image: '/nft-placeholder.png',
                attributes: []
              }
            },
            {
              id: '6',
              tokenId: '6',
              name: 'Space Explorer',
              description: 'A journey through space',
              image: '/nft-placeholder.png',
              owner: '0xe765...b321',
              creator: '0xe765...b321',
              metadata: {
                name: 'Space Explorer',
                description: 'A journey through space',
                image: '/nft-placeholder.png',
                attributes: []
              }
            },
            {
              id: '7',
              tokenId: '7',
              name: 'Cosmic Collection #3',
              description: 'Part of the cosmic collection',
              image: '/nft-placeholder.png',
              owner: '0xd876...c234',
              creator: '0xd876...c234',
              metadata: {
                name: 'Cosmic Collection #3',
                description: 'Part of the cosmic collection',
                image: '/nft-placeholder.png',
                attributes: []
              }
            }
          ];
        }
        
        setFeaturedNFTs(nfts);
      } catch (error) {
        console.error('Error in fetchFeaturedNFTs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedNFTs();
  }, []);

  return (
    <Layout title="Stellar NFT Marketplace - Discover, Collect, and Trade NFTs">
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
          <NFTGrid nfts={featuredNFTs} loading={loading} />
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
    </Layout>
  );
};

export default Home; 