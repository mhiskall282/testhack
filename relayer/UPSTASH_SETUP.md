# 🚀 **Upstash Redis Setup Guide**

## **Why Upstash Redis?**
- ✅ **More reliable** than Redis Cloud for cloud deployments
- ✅ **Better connectivity** from Railway and other cloud platforms
- ✅ **Free tier available** for testing
- ✅ **Simpler setup** and better documentation

## **Step 1: Get Upstash Redis Credentials**

1. **Go to [upstash.com](https://upstash.com)**
2. **Sign up/Login** with your GitHub account
3. **Create a new Redis database**
4. **Choose the region** closest to your Railway deployment
5. **Copy the credentials**:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

## **Step 2: Update Railway Environment Variables**

In your Railway dashboard, add these environment variables:

```bash
# Remove old Redis Cloud variables
REDIS_CLOUD_URL=
REDIS_CLOUD_PASSWORD=

# Add new Upstash variables
UPSTASH_REDIS_URL=your_upstash_redis_url
UPSTASH_REDIS_TOKEN=your_upstash_redis_token
```

## **Step 3: Update .env File (if testing locally)**

```bash
# Remove old Redis Cloud variables
# REDIS_CLOUD_URL=
# REDIS_CLOUD_PASSWORD=

# Add new Upstash variables
UPSTASH_REDIS_URL=your_upstash_redis_url
UPSTASH_REDIS_TOKEN=your_upstash_redis_token
```

## **Step 4: Test Connection**

The relayer will automatically detect and use Upstash Redis when these variables are set.

## **Expected Output**

```
🧪 Testing Redis connection...
✅ Redis connection successful!
✅ Cloud Relayer started successfully!
```

## **Troubleshooting**

If you still have issues:
1. **Check region** - make sure it's close to your Railway deployment
2. **Verify credentials** - double-check the URL and token
3. **Check firewall** - ensure Railway can reach Upstash
4. **Restart deployment** - after updating environment variables
