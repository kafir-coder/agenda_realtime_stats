import BeeQueue, { Job } from "bee-queue";
import processor_skelecton from "../protocols/processor";
import { quee_element } from "../protocols/queue_element";

class processor implements processor_skelecton<quee_element> {
  constructor(private readonly Queue: BeeQueue) {}
  async enqueue(element: quee_element): Promise<Job<quee_element>> {
    const job = this.Queue.createJob(element);
    const queued = await job.timeout(3000).retries(2).save();
    return queued;
  }
  async process(): Promise<Job<quee_element>> {
    return new Promise(resolve => {
      this.Queue.process(async function (job: Job<quee_element>) {
        console.log(`Processing job ${job.id}`);
        resolve(job)
      });
    })
    
  }
}