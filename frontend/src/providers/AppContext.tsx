import React, { createContext, useContext, useReducer, ReactNode, useEffect, useState } from 'react';
import { isWalletConnected, getPublicKey, disconnectWallet } from '../sdk/walletConnect';

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
      
      // If we're changing from connected to disconnected, handle disconnect logic
      if (state.isConnected && !action.payload.isConnected) {
        console.log('Disconnecting wallet from reducer');
        // Clear localStorage immediately for consistent experience
        localStorage.removeItem('walletConnected');
        
        // Set explicit disconnection flag
        localStorage.setItem('wallet_explicitly_disconnected', 'true');
        
        // Call disconnect wallet API (can't await in reducer, so just fire it)
        disconnectWallet().catch(err => {
          console.error('Error in disconnect:', err);
        });
      }
      
      // If we're changing from disconnected to connected, update localStorage
      if (!state.isConnected && action.payload.isConnected) {
        // Clear the explicit disconnection flag if it exists
        localStorage.removeItem('wallet_explicitly_disconnected');
        localStorage.setItem('walletConnected', 'true');
      }
      
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
        
        // Check if user explicitly disconnected in previous session
        const explicitlyDisconnected = localStorage.getItem('wallet_explicitly_disconnected') === 'true';
        
        // Check localStorage for connection status
        const storedConnection = localStorage.getItem('walletConnected');
        console.log('walletConnected in localStorage:', storedConnection);
        
        // If user explicitly disconnected, don't auto-connect
        if (explicitlyDisconnected) {
          console.log('User explicitly disconnected in previous session, not auto-connecting');
          localStorage.removeItem('walletConnected');
          dispatch({
            type: 'SET_WALLET_CONNECTION',
            payload: { isConnected: false, walletKey: null },
          });
          return;
        }
        
        // Only check actual wallet state if we have a stored connection
        // This prevents unwanted popups on page load
        if (storedConnection === 'true') {
          // Then check actual wallet state - pass false for userInitiated to avoid popups
          const connected = await isWalletConnected(false);
          console.log('Initial wallet connection status from API:', connected);
          
          // If localStorage says connected but wallet isn't, clear localStorage
          if (!connected) {
            console.log('Fixing localStorage - wallet is not actually connected');
            localStorage.removeItem('walletConnected');
            dispatch({
              type: 'SET_WALLET_CONNECTION',
              payload: { isConnected: false, walletKey: null },
            });
          } else {
            console.log('Wallet is connected, getting public key...');
            // Pass false for userInitiated to avoid popups if not needed
            const key = await getPublicKey(false);
            
            if (key) {
              console.log('Got public key:', key);
              dispatch({
                type: 'SET_WALLET_CONNECTION',
                payload: { isConnected: true, walletKey: key },
              });
            } else {
              console.warn('Could not get public key even though wallet is connected');
              // Clear any connection data
              localStorage.removeItem('walletConnected');
              dispatch({
                type: 'SET_WALLET_CONNECTION',
                payload: { isConnected: false, walletKey: null },
              });
            }
          }
        } else {
          // No stored connection, ensure state shows disconnected
          dispatch({
            type: 'SET_WALLET_CONNECTION',
            payload: { isConnected: false, walletKey: null },
          });
        }
      } catch (error) {
        console.error('Error checking wallet on load:', error);
        // On error, assume disconnected for safety
        localStorage.removeItem('walletConnected');
        dispatch({
          type: 'SET_WALLET_CONNECTION',
          payload: { isConnected: false, walletKey: null },
        });
      }
    };

    // Only check when window gains focus if we're already connected
    // This prevents unwanted popups
    const handleFocus = () => {
      const storedConnection = localStorage.getItem('walletConnected');
      if (storedConnection === 'true') {
        console.log('Window focus event - checking wallet connection');
        checkWalletOnLoad();
      }
    };

    checkWalletOnLoad();
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [isClient, dispatch]);
  
  // No longer need this effect as we're handling localStorage in the reducer
  // and in the checkWalletOnLoad function to ensure consistency

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