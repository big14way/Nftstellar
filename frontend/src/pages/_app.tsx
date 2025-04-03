import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { WalletProvider } from '../contexts/WalletContext';
import Layout from '../components/Layout';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WalletProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </WalletProvider>
  );
}

export default MyApp; 