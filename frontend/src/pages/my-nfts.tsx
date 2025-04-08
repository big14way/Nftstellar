import WalletRequired from '@/components/WalletRequired';
import MyNFTsList from '@/components/MyNFTsList';
import Layout from '@/components/Layout';

const MyNFTsPage = () => {
  return (
    <Layout title="My NFTs | Stellar NFT Marketplace">
      <WalletRequired>
        <MyNFTsList />
      </WalletRequired>
    </Layout>
  );
};

export default MyNFTsPage; 