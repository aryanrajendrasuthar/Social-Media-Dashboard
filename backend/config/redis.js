const Redis = require('ioredis');

let redisClient;

const connectRedis = () => {
  redisClient = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    // Stop retrying after 3 attempts — app works without Redis
    retryStrategy: (times) => (times > 3 ? null : Math.min(times * 200, 1000)),
    lazyConnect: true,
    enableOfflineQueue: false,
  });

  redisClient.on('connect', () => console.log('Redis connected'));
  redisClient.once('error', (err) => console.warn('Redis unavailable — caching disabled:', err.message));

  redisClient.connect().catch(() => {});
};

const getRedis = () => redisClient;

module.exports = { connectRedis, getRedis };
