import { Job } from "bee-queue";

export default interface processor_skelecton<T> {
  enqueue: (qE: T) => Promise<Job<T>>;
  process: () => Promise<Job<T>>
}