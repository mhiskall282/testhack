declare module 'vue-sui' {
  export class SuiInBrowser {
    static getSingleton(params: any): SuiInBrowser;
    static getChainsSettings(): any;
    static getPossibleWallets(): any[];
    
    adapters: any;
    isConnected: boolean;
    connectedAddress: string | null;
    connectedChain: string | null;
    _defaultChain: string;
    
    connect(adapter: any): Promise<void>;
    disconnect(): Promise<void>;
    getBalance(): Promise<string>;
    getSuiMaster(): Promise<any>;
    
    addEventListener(event: string, callback: Function): void;
    removeEventListener(event: string, callback: Function): void;
    removeAllEventListeners(): void;
  }
}
