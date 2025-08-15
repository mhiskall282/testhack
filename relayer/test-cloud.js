// Simple test to verify cloud relayer configuration
require('dotenv').config();

console.log('🧪 Testing Cloud Relayer Configuration...\n');

// Check environment variables
const requiredVars = [
  'ETH_PRIVATE_KEY',
  'SUI_PRIVATE_KEY'
];

const optionalVars = [
  'REDIS_CLOUD_URL',
  'UPSTASH_REDIS_URL',
  'SPY_HOST'
];

console.log('🔑 Required Variables:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`  ✅ ${varName}: ${value.substring(0, 10)}...`);
  } else {
    console.log(`  ❌ ${varName}: NOT SET`);
  }
});

console.log('\n🌐 Optional Variables:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`  ✅ ${varName}: ${value}`);
  } else {
    console.log(`  ⚠️  ${varName}: NOT SET (will use defaults)`);
  }
});

console.log('\n📋 Configuration Summary:');
console.log(`  Redis: ${process.env.REDIS_CLOUD_URL || process.env.UPSTASH_REDIS_URL || 'localhost:6379'}`);
console.log(`  Wormhole: ${process.env.SPY_HOST || 'https://wormhole-v2-testnet-api.certus.one'}`);

console.log('\n🎯 Next Steps:');
if (!process.env.ETH_PRIVATE_KEY || !process.env.SUI_PRIVATE_KEY) {
  console.log('  1. Set ETH_PRIVATE_KEY and SUI_PRIVATE_KEY in .env');
}
if (!process.env.REDIS_CLOUD_URL && !process.env.UPSTASH_REDIS_URL) {
  console.log('  2. Get Redis Cloud credentials and add to .env');
}
console.log('  3. Run: start-cloud.bat');

console.log('\n✅ Test complete!');
