import BeeQueue, { Job } from "bee-queue";
import { Redis } from "ioredis";
import { processor_skelecton, quee_element } from "../protocols";
//@ts-ignore
import bqScripts from 'bee-queue/lib/lua';
export default class processor implements processor_skelecton<quee_element> {
  constructor(
    private readonly Queue: BeeQueue,
    private readonly redis: Redis
  ) {}
  async enqueue(element: quee_element): Promise<Job<quee_element>> {
    const job = this.Queue.createJob(element);

    const queued = await job.timeout(3000).retries(2).save();
    //@ts-ignore
    job.save(async (err, job: quee_element) => {
      if (err) {
        console.error(`failed creating job`);
        // Known error when redis has not all lua scripts loaded properly
        if (err.command === 'EVALSHA') {
          await bqScripts.buildCache(this.redis);
          console.info('Successfully reloaded Lua scripts into cache!');
          // create job again
          await this.Queue.createJob(job).save();
        }
      }
    }).catch(err => {
      console.log(err)
    }) as unknown as Job<quee_element>
    
    return queued;
  }
  async process(commandsPipe: Array<quee_element>): Promise<void> {
    return new Promise(() => {
      this.Queue.process(async () => {
        await this.redis.pipeline([
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