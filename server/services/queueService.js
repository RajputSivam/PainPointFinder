import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';

let scrapeQueue = null;

export const initScrapeQueue = () => {
  if (!process.env.REDIS_URL) {
    console.log('Redis not configured (REDIS_URL unset). BullMQ queue skipped.');
    return null;
  }

  try {
    const connection = new IORedis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
      lazyConnect: true,
      retryStrategy: () => null,
    });

    connection.on('error', () => {});

    scrapeQueue = new Queue('scrape-jobs', { connection });

    new Worker(
      'scrape-jobs',
      async (job) => {
        console.log(`Processing scrape job: ${job.id} for keyword: ${job.data.keyword}`);
        return { status: 'completed', keyword: job.data.keyword };
      },
      { connection }
    );

    connection.connect().catch(() => {
      console.warn('Redis unavailable. BullMQ queue disabled.');
      scrapeQueue = null;
    });

    console.log('BullMQ scrape queue initialized');
    return scrapeQueue;
  } catch (error) {
    console.warn('BullMQ queue unavailable:', error.message);
    return null;
  }
};

export const addScrapeJob = async (keyword, domain) => {
  if (!scrapeQueue) return null;
  return scrapeQueue.add('scrape', { keyword, domain }, { removeOnComplete: true });
};

export default { initScrapeQueue, addScrapeJob };
