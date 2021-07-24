import { Job } from "bee-queue";
import { Redis } from "ioredis";

export interface processor_skelecton<T> {
  enqueue: (qE: T) => Promise<Job<T>>;
  process: (commandsPipe: Array<T>) => Promise<void>
}