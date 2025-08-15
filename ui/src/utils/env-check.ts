// Environment variable checker for debugging
export function checkEnvironmentVariables() {
  const requiredVars = [
    'VITE_ETH_RPC_URL',
    'VITE_ETH_CHAIN_ID',
    'VITE_ORBITAL_CONTRACT',
    'VITE_SUI_RPC_URL',
    'VITE_ORBITAL_PACKAGE_ID'
  ];

  const optionalVars = [
    'VITE_FS_API_KEY',
    'VITE_FS_PROJECT_ID',
    'VITE_FS_AUTH_DOMAIN'
  ];

  console.log('🔍 Environment Variables Check:');
  
  // Check required variables
  console.log('\n📋 Required Variables:');
  requiredVars.forEach(varName => {
    const value = import.meta.env[varName];
    if (value) {
      console.log(`  ✅ ${varName}: ${value.substring(0, 20)}...`);
    } else {
      console.log(`  ❌ ${varName}: NOT SET`);
    }
  });

  // Check optional variables
  console.log('\n🌐 Optional Variables:');
  optionalVars.forEach(varName => {
    const value = import.meta.env[varName];
    if (value) {
      console.log(`  ✅ ${varName}: ${value.substring(0, 20)}...`);
    } else {
      console.log(`  ⚠️  ${varName}: NOT SET (optional)`);
    }
  });

  // Check if Firebase should be initialized
  const hasFirebaseConfig = import.meta.env.VITE_FS_PROJECT_ID && 
                           import.meta.env.VITE_FS_API_KEY && 
                           import.meta.env.VITE_FS_AUTH_DOMAIN;

  console.log(`\n🔥 Firebase Configuration: ${hasFirebaseConfig ? '✅ Ready' : '⚠️  Not Configured'}`);
  
  if (!hasFirebaseConfig) {
    console.log('   ℹ️  Firebase is optional and will not be initialized');
  }

  return {
    hasRequiredVars: requiredVars.every(varName => import.meta.env[varName]),
    hasFirebaseConfig
  };
}

export default checkEnvironmentVariables;
