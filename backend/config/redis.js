const Redis = require('ioredis');

let redisClient;

const connectRedis = () => {
  redisClient = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    retryStrategy: (times) => Math.min(times * 50, 2000),
    lazyConnect: true,
  });

  redisClient.on('connect', () => console.log('Redis connected'));
  redisClient.on('error', (err) => console.error('Redis error:', err.message));

  redisClient.connect().catch((err) => console.error('Redis connect error:', err.message));
};

const getRedis = () => redisClient;

module.exports = { connectRedis, getRedis };
