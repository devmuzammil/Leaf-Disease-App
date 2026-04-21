/**
 * Simple async task queue for background prediction processing.
 *
 * Design decisions:
 * 1. In-memory queue for simplicity (scales to moderate load)
 * 2. Can be replaced with Bull/Redis for distributed processing
 * 3. Provides immediate response to client while processing in background
 * 4. Includes task status tracking via UUID
 *
 * PRODUCTION UPGRADE PATH:
 * Replace this with Bull queue + Redis for true distributed processing:
 * - npm install bull redis
 * - Multiple worker processes can process tasks
 * - Persistent storage of task status
 */

import { logger } from '../utils/logger';

export interface BackgroundTask {
  id: string;
  type: 'prediction';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: unknown;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
  retryCount: number;
}

interface TaskHandler {
  (task: BackgroundTask): Promise<unknown>;
}

/**
 * Simple in-memory task queue with background processing
 */
export class TaskQueue {
  private queue: Map<string, BackgroundTask> = new Map();
  private handlers: Map<string, TaskHandler> = new Map();
  private maxRetries: number = 3;
  private processingConcurrency: number = 2;
  private activeProcessing: number = 0;

  /**
   * Register a handler for a task type
   */
  registerHandler(taskType: string, handler: TaskHandler): void {
    this.handlers.set(taskType, handler);
    logger.info('Task handler registered', { taskType });
  }

  /**
   * Add a task to the queue
   */
  enqueue(taskType: string, id: string): BackgroundTask {
    const task: BackgroundTask = {
      id,
      type: taskType as any,
      status: 'pending',
      createdAt: new Date(),
      retryCount: 0,
    };

    this.queue.set(id, task);
    logger.info('Task enqueued', { id, taskType });

    // Start processing if we have capacity
    setImmediate(() => this.process());

    return task;
  }

  /**
   * Get task status
   */
  getStatus(taskId: string): BackgroundTask | null {
    return this.queue.get(taskId) || null;
  }

  /**
   * Process tasks from the queue
   */
  private async process(): Promise<void> {
    // Respect concurrency limit
    if (this.activeProcessing >= this.processingConcurrency) {
      return;
    }

    // Find a pending task
    const task = Array.from(this.queue.values()).find((t) => t.status === 'pending');

    if (!task) {
      return;
    }

    this.activeProcessing += 1;
    task.status = 'processing';

    try {
      const handler = this.handlers.get(task.type);
      if (!handler) {
        throw new Error(`No handler registered for task type: ${task.type}`);
      }

      logger.info('Processing task', { id: task.id, type: task.type });

      const result = await handler(task);

      task.status = 'completed';
      task.result = result;
      task.completedAt = new Date();

      logger.info('Task completed', { id: task.id, type: task.type });
    } catch (error) {
      logger.error(
        `Task failed (attempt ${task.retryCount + 1}/${this.maxRetries + 1})`,
        error instanceof Error ? error : new Error(String(error)),
        { id: task.id, type: task.type },
      );

      if (task.retryCount < this.maxRetries) {
        task.retryCount += 1;
        task.status = 'pending';
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.min(1000 * Math.pow(2, task.retryCount - 1), 30000);
        setTimeout(() => this.process(), delay);
      } else {
        task.status = 'failed';
        task.error = error instanceof Error ? error.message : String(error);
        task.completedAt = new Date();
      }
    } finally {
      this.activeProcessing -= 1;

      // Try to process more tasks
      setImmediate(() => this.process());
    }
  }

  /**
   * Clear old completed tasks (cleanup every 1 hour)
   */
  private startCleanup(): void {
    setInterval(() => {
      const oneHourAgo = new Date(Date.now() - 3600000);
      let cleaned = 0;

      for (const [id, task] of this.queue.entries()) {
        if (
          task.status === 'completed' &&
          task.completedAt &&
          task.completedAt < oneHourAgo
        ) {
          this.queue.delete(id);
          cleaned += 1;
        }
      }

      if (cleaned > 0) {
        logger.info('Task cleanup completed', { tasksRemoved: cleaned });
      }
    }, 3600000); // 1 hour
  }

  constructor() {
    this.startCleanup();
  }
}

export const taskQueue = new TaskQueue();

export default taskQueue;
