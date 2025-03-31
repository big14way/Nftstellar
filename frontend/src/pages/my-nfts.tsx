import WalletRequired from '@/components/WalletRequired';
import MyNFTsList from '@/components/MyNFTsList';

const MyNFTsPage = () => {
  return (
    <WalletRequired>
      <MyNFTsList />
    </WalletRequired>
  );
};

export default MyNFTsPage; 