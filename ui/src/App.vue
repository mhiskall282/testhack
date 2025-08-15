<script setup lang="ts">
import { RouterView } from 'vue-router';
import AppHeader from './components/AppHeader.vue';
import AppFooter from './components/AppFooter.vue';
import SnackbarPop from './components/SnackbarPop.vue';
import { checkEnvironmentVariables } from './utils/env-check';

// Check environment variables on app start
checkEnvironmentVariables();

// Firebase configuration - only initialize if all required values are present
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FS_API_KEY,
  authDomain: import.meta.env.VITE_FS_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FS_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FS_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FS_MSG_SENDER_ID,
  appId: import.meta.env.VITE_FS_APP_ID,
  measurementId: import.meta.env.VITE_FS_MEASUREMENT_ID,
};

// Check if Firebase should be initialized
const shouldInitializeFirebase = firebaseConfig.projectId && 
                               firebaseConfig.apiKey && 
                               firebaseConfig.authDomain;

if (shouldInitializeFirebase) {
  try {
    // Import Firebase only if we have configuration
    import("firebase/app").then(({ initializeApp }) => {
      const app = initializeApp(firebaseConfig);
      
      // Initialize analytics if measurementId is available
      if (firebaseConfig.measurementId) {
        import("firebase/analytics").then(({ getAnalytics }) => {
          try {
            getAnalytics(app);
            console.log("✅ Firebase Analytics initialized successfully");
          } catch (error) {
            console.warn("⚠️ Firebase Analytics failed to initialize:", error);
          }
        });
      }
      
      console.log("✅ Firebase initialized successfully");
    });
  } catch (error) {
    console.warn("⚠️ Firebase failed to initialize:", error);
  }
} else {
  console.log("ℹ️ Firebase not initialized - missing configuration values");
}
</script>

<template>
  <main>
    <AppHeader />
    <RouterView class="view"></RouterView>
    <SnackbarPop />
    <AppFooter v-if="$route.name == 'home'" />
  </main>
</template>

<style scoped>
.view {
  min-height: 55vh;
}
</style>
