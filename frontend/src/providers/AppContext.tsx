import React, { createContext, useContext, useReducer, ReactNode, useEffect, useState } from 'react';
import { isWalletConnected, getPublicKey } from '../sdk/walletConnect';

// Define the state type
interface AppState {
  isConnected: boolean;
  isConnecting: boolean;
  walletKey: string | null;
}

// Define action types
type AppAction =
  | { type: 'SET_WALLET_CONNECTION'; payload: { isConnected: boolean; walletKey: string | null } }
  | { type: 'SET_IS_CONNECTING'; payload: boolean };

// Create context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const initialState: AppState = {
  isConnected: false,
  isConnecting: false,
  walletKey: null,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

// Reducer function
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_WALLET_CONNECTION':
      console.log('SET_WALLET_CONNECTION payload:', action.payload);
      return {
        ...state,
        isConnected: action.payload.isConnected,
        walletKey: action.payload.walletKey,
        isConnecting: false,
      };
    case 'SET_IS_CONNECTING':
      return {
        ...state,
        isConnecting: action.payload,
      };
    default:
      return state;
  }
};

// Provider component
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [isClient, setIsClient] = useState(false);
  
  // Set client-side flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check if wallet is already connected on mount
  useEffect(() => {
    if (!isClient) return;
    
    const checkWalletOnLoad = async () => {
      try {
        console.log('Checking wallet connection on app load...');
        const connected = await isWalletConnected();
        console.log('Initial wallet connection status:', connected);
        
        if (connected) {
          console.log('Wallet is connected, getting public key...');
          const key = await getPublicKey();
          
          if (key) {
            console.log('Got public key:', key);
            dispatch({
              type: 'SET_WALLET_CONNECTION',
              payload: { isConnected: true, walletKey: key },
            });
          } else {
            console.warn('Could not get public key even though wallet is connected');
          }
        }
      } catch (error) {
        console.error('Error checking wallet on load:', error);
      }
    };

    // Check when window gains focus (in case wallet state changed)
    const handleFocus = () => {
      console.log('Window focus event - checking wallet connection');
      checkWalletOnLoad();
    };

    checkWalletOnLoad();
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [isClient]);
  
  // Effect to persist connection state in localStorage
  useEffect(() => {
    if (!isClient) return;
    
    if (state.isConnected && state.walletKey) {
      localStorage.setItem('walletConnected', 'true');
    } else {
      localStorage.removeItem('walletConnected');
    }
  }, [state.isConnected, state.walletKey, isClient]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
};

// Custom hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    // Return a default context if we're not within a provider
    // This can happen during server-side rendering
    return {
      state: initialState,
      dispatch: () => null,
    };
  }
  return context;
};

export default AppContext; 