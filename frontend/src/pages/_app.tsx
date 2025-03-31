import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { AppProvider } from '../providers/AppContext';
import { WalletProvider } from '@/contexts/WalletContext';
import Layout from '@/components/Layout';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WalletProvider>
      <Layout>
        <AppProvider>
          <Component {...pageProps} />
        </AppProvider>
      </Layout>
    </WalletProvider>
  );
}

export default MyApp; 