import BeeQueue, { Job } from "bee-queue";
import { Redis } from "ioredis";
import { processor_skelecton, quee_element } from "../protocols";

export default class processor implements processor_skelecton<quee_element> {
  constructor(private readonly Queue: BeeQueue) {}
  async enqueue(element: quee_element): Promise<Job<quee_element>> {
    const job = this.Queue.createJob(element);
    const queued = await job.timeout(3000).retries(2).save();
    return queued;
  }
  async process(redis: Redis, commandsPipe: Array<quee_element>): Promise<void> {
    return new Promise(() => {
      this.Queue.process(async () => {
        await redis.pipeline([
          [commandsPipe[0].command, commandsPipe[0].arguments as string],
          [commandsPipe[1].command, commandsPipe[1].arguments as string],
          [commandsPipe[2].command, commandsPipe[2].arguments as string],
          [commandsPipe[3].command, commandsPipe[3].arguments as string],
          [commandsPipe[4].command, commandsPipe[4].arguments as string],
          [commandsPipe[5].command, commandsPipe[5].arguments as string],
        ]).exec()
      });
    })
    
  }
}