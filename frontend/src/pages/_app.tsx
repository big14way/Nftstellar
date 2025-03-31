import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Layout from '../components/Layout';
import { AppProvider } from '../providers/AppContext';
import { useEffect } from 'react';

function MyApp({ Component, pageProps }: AppProps) {
  // Log startup to help with debugging
  useEffect(() => {
    console.log('🚀 App initialized');
    
    // Log browser information
    if (typeof window !== 'undefined') {
      console.log('Browser environment:', {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        windowDimensions: `${window.innerWidth}x${window.innerHeight}`
      });
    }
    
    // Add global error handler to catch unhandled errors
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Still call the original console.error to maintain normal behavior
      originalConsoleError(...args);
      
      // Add custom error handling - you could send to an error tracking service here
      if (args[0] && typeof args[0] === 'string' && args[0].includes('freighter')) {
        console.log('🛑 Freighter-related error detected. User may need to refresh their browser or reinstall the extension.');
      }
    };
    
    return () => {
      // Restore original console.error on cleanup
      console.error = originalConsoleError;
    };
  }, []);
  
  return (
    <AppProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AppProvider>
  );
}

// Add getInitialProps to fix the error
MyApp.getInitialProps = async (appContext) => {
  // calls page's `getInitialProps` and fills `appProps.pageProps`
  const appProps = await appContext.Component.getInitialProps?.(appContext.ctx) || {};

  return { pageProps: appProps };
};

export default MyApp; 