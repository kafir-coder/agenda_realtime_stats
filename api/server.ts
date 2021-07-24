import { VercelRequest, VercelResponse } from '@vercel/node';
import BeeQueue from 'bee-queue';
import processor from './core/processor'
import dotenv from 'dotenv';
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST as string,
  port: process.env.REDIS_PORT as unknown as number,
  password: process.env.REDIS_PASSWORD as string
});
export default async function (req: VercelRequest, res: VercelResponse) {
  dotenv.config();
  const configurations = {
    redis: redis,
    isWorker: true,
    getEvents: true,
    sendEvents: true,
    storeJobs: true,
    ensureScripts: true,
    activateDelayedJobs: false,
    removeOnSuccess: false,
    removeOnFailure: false,
    redisScanCount: 100,
  }
  //@ts-ignore
  const Queue: BeeQueue = new BeeQueue(process.env.QUEUE_NAME as string, configurations);
  const dispatcher = new processor(Queue);
  await dispatcher.enqueue(req.body)
  await dispatcher.process(redis, req.body).then(result => {
    return res.status(200).send(`OK`);
  });
}