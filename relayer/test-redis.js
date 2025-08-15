const Redis = require('ioredis');

// Redis connection details from your environment
const redisUrl = "redis://default:6Kw3dv5aG4JnIH6Xez6feU4kjXNf12xC@redis-16485.c277.us-east-1-3.ec2.redns.redis-cloud.com:16485";

console.log("🧪 Testing Redis connection...");
console.log(`🔗 URL: ${redisUrl}`);

// Parse the Redis URL
const url = new URL(redisUrl);
const redisConfig = {
    host: url.hostname,
    port: parseInt(url.port),
    password: url.password,
    maxRetriesPerRequest: 3,
    connectTimeout: 10000,
    lazyConnect: true,
    enableOfflineQueue: true,
    enableReadyCheck: false,
};

console.log("📋 Config:", {
    host: redisConfig.host,
    port: redisConfig.port,
    password: redisConfig.password ? "***" : "none"
});

const redis = new Redis(redisConfig);

redis.on('connect', () => {
    console.log("✅ Redis connected successfully!");
    
    // Test a simple command
    redis.ping().then((result) => {
        console.log(`🏓 PING response: ${result}`);
        
        // Test setting and getting a value
        return redis.set('test_key', 'test_value');
    }).then(() => {
        return redis.get('test_key');
    }).then((value) => {
        console.log(`📝 Test GET: ${value}`);
        
        // Clean up
        return redis.del('test_key');
    }).then(() => {
        console.log("🧹 Test key cleaned up");
        redis.disconnect();
        console.log("✅ Redis test completed successfully!");
        process.exit(0);
    }).catch((error) => {
        console.error("❌ Error during Redis operations:", error);
        redis.disconnect();
        process.exit(1);
    });
});

redis.on('error', (error) => {
    console.error("❌ Redis connection error:", error.message);
    redis.disconnect();
    process.exit(1);
});

redis.on('timeout', () => {
    console.error("⏰ Redis connection timeout");
    redis.disconnect();
    process.exit(1);
});

// Set a timeout for the entire test
setTimeout(() => {
    console.error("⏰ Test timeout - Redis connection taking too long");
    redis.disconnect();
    process.exit(1);
}, 15000);
