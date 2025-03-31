interface Window {
  freighter?: {
    isConnected: () => Promise<boolean>;
    getPublicKey: () => Promise<string>;
    signTransaction: (xdr: string, network?: string) => Promise<string>;
  };
}

export {}; 