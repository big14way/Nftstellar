import TestNFTCreation from '../components/TestNFTCreation';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">NFT Marketplace Tests</h1>
        <TestNFTCreation />
      </div>
    </div>
  );
} 