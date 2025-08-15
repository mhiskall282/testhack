<template>
  <div class="sui-wallet-connect">
    <div v-if="!isConnected" class="connect-section">
      <h3>Connect Sui Wallet</h3>
      <div class="wallet-options">
        <button 
          v-for="adapter in availableAdapters" 
          :key="adapter.name"
          @click="connectWallet(adapter)"
          class="wallet-button"
          :disabled="connecting"
        >
          <img v-if="adapter.icon" :src="adapter.icon" :alt="adapter.name" class="wallet-icon" />
          <span>{{ adapter.name }}</span>
        </button>
      </div>
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>
    
    <div v-else class="connected-section">
      <h3>Connected to Sui</h3>
      <div class="wallet-info">
        <p><strong>Address:</strong> {{ shortAddress(connectedAddress) }}</p>
        <p><strong>Chain:</strong> {{ connectedChain }}</p>
        <p><strong>Balance:</strong> {{ suiBalance }} SUI</p>
      </div>
      <button @click="disconnectWallet" class="disconnect-button">
        Disconnect
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
// @ts-ignore
import { useStore } from 'vuex';
import { key } from '../store';

const store = useStore(key);

// Reactive state
const isConnected = ref(false);
const connecting = ref(false);
const connectedAddress = ref('');
const connectedChain = ref('');
const suiBalance = ref('0');
const availableAdapters = ref<any[]>([]);
const error = ref('');

// Sui wallet instance
let suiWallet: any = null;

// Methods
const connectWallet = async (adapter: any) => {
  try {
    connecting.value = true;
    error.value = '';
    
    console.log('Connecting to Sui wallet:', adapter.name);
    
    // Try to connect using the existing SuiInBrowser instance
    if (suiWallet && typeof suiWallet.connect === 'function') {
      await suiWallet.connect(adapter);
      
      // Update state
      isConnected.value = true;
      connectedAddress.value = suiWallet.connectedAddress || '';
      connectedChain.value = suiWallet.connectedChain || 'testnet';
      
      // Update store
      store.commit('setSuiAddress', connectedAddress.value);
      store.commit('setSuiAdapter', adapter);
      
      console.log('Successfully connected to Sui wallet');
    } else {
      throw new Error('Sui wallet not initialized');
    }
    
  } catch (err: any) {
    console.error('Failed to connect to Sui wallet:', err);
    error.value = err.message || 'Failed to connect wallet';
  } finally {
    connecting.value = false;
  }
};

const disconnectWallet = async () => {
  try {
    if (suiWallet && typeof suiWallet.disconnect === 'function') {
      await suiWallet.disconnect();
    }
    
    // Reset state
    isConnected.value = false;
    connectedAddress.value = '';
    connectedChain.value = '';
    suiBalance.value = '0';
    
    // Update store
    store.commit('setSuiAddress', null);
    store.commit('setSuiAdapter', null);
    
    console.log('Disconnected from Sui wallet');
    
  } catch (err) {
    console.error('Error disconnecting:', err);
  }
};

const shortAddress = (address: string) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const initializeWallet = async () => {
  try {
    // Wait for the global SuiInBrowser to be available
    // This should be initialized by the existing app logic
    const checkWallet = () => {
      // @ts-ignore
      if (window.SuiInBrowser) {
        // @ts-ignore
        suiWallet = window.SuiInBrowser;
        
        // Get available adapters
        if (suiWallet.adapters) {
          availableAdapters.value = Object.values(suiWallet.adapters);
        }
        
        // Check if already connected
        if (suiWallet.isConnected) {
          isConnected.value = true;
          connectedAddress.value = suiWallet.connectedAddress || '';
          connectedChain.value = suiWallet.connectedChain || 'testnet';
          
          // Update store
          store.commit('setSuiAddress', connectedAddress.value);
        }
        
        console.log('Sui wallet initialized with adapters:', availableAdapters.value);
      } else {
        // Retry after a short delay
        setTimeout(checkWallet, 100);
      }
    };
    
    checkWallet();
    
  } catch (err) {
    console.error('Failed to initialize Sui wallet:', err);
    error.value = 'Failed to initialize wallet';
  }
};

// Lifecycle
onMounted(() => {
  initializeWallet();
});

onUnmounted(() => {
  // Cleanup if needed
});
</script>

<style scoped>
.sui-wallet-connect {
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #f9f9f9;
  margin: 20px 0;
}

.connect-section h3,
.connected-section h3 {
  margin: 0 0 20px 0;
  color: #333;
}

.wallet-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.wallet-button {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.wallet-button:hover {
  background: #f0f0f0;
  border-color: #999;
}

.wallet-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.wallet-icon {
  width: 24px;
  height: 24px;
  border-radius: 4px;
}

.error-message {
  color: #d32f2f;
  background: #ffebee;
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
}

.connected-section .wallet-info {
  background: white;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 20px;
}

.connected-section .wallet-info p {
  margin: 5px 0;
  font-size: 14px;
}

.disconnect-button {
  background: #f44336;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.disconnect-button:hover {
  background: #d32f2f;
}
</style>
