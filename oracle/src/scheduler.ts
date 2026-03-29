import * as cron from "node-cron";
import { config } from "./config";

export type JobHandler = () => Promise<void>;

interface ScheduledJob {
  name: string;
  schedule: string;
  handler: JobHandler;
  lastRun: number;
  nextRun: number;
  isRunning: boolean;
  runCount: number;
  errorCount: number;
}

/**
 * Oracle Job Scheduler
 * Manages periodic oracle update tasks
 */
export class OracleScheduler {
  private jobs: Map<string, ScheduledJob> = new Map();
  private cronTasks: Map<string, cron.ScheduledTask> = new Map();

  /**
   * Register a new scheduled job
   */
  registerJob(name: string, schedule: string, handler: JobHandler): void {
    this.jobs.set(name, {
      name,
      schedule,
      handler,
      lastRun: 0,
      nextRun: 0,
      isRunning: false,
      runCount: 0,
      errorCount: 0,
    });

    console.log(`[Scheduler] Registered job: ${name} (${schedule})`);
  }

  /**
   * Start all registered jobs
   */
  start(): void {
    console.log(`[Scheduler] Starting ${this.jobs.size} jobs...`);

    for (const [name, job] of this.jobs) {
      if (!cron.validate(job.schedule)) {
        console.error(`[Scheduler] Invalid cron for ${name}: ${job.schedule}`);
        continue;
      }

      const task = cron.schedule(job.schedule, async () => {
        await this.executeJob(name);
      });

      this.cronTasks.set(name, task);
      console.log(`[Scheduler] Started: ${name}`);
    }
  }

  /**
   * Execute a specific job
   */
  async executeJob(name: string): Promise<void> {
    const job = this.jobs.get(name);
    if (!job) {
      console.error(`[Scheduler] Job not found: ${name}`);
      return;
    }

    if (job.isRunning) {
      console.warn(`[Scheduler] Job ${name} is already running, skipping`);
      return;
    }

    // Check min interval
    const now = Date.now();
    if (now - job.lastRun < config.minUpdateInterval * 1000) {
      console.warn(`[Scheduler] Job ${name} called too soon, skipping`);
      return;
    }

    job.isRunning = true;
    const startTime = Date.now();
    console.log(`[Scheduler] Executing: ${name}`);

    try {
      await job.handler();
      job.runCount++;
      job.lastRun = Date.now();
      const duration = Date.now() - startTime;
      console.log(`[Scheduler] Completed: ${name} (${duration}ms)`);
    } catch (error) {
      job.errorCount++;
      console.error(`[Scheduler] Failed: ${name}`, error);
    } finally {
      job.isRunning = false;
    }
  }

  /**
   * Run a job immediately (bypass schedule)
   */
  async runNow(name: string): Promise<void> {
    await this.executeJob(name);
  }

  /**
   * Stop all jobs
   */
  stop(): void {
    for (const [name, task] of this.cronTasks) {
      task.stop();
      console.log(`[Scheduler] Stopped: ${name}`);
    }
    this.cronTasks.clear();
  }

  /**
   * Get status of all jobs
   */
  getStatus(): Array<{
    name: string;
    schedule: string;
    isRunning: boolean;
    runCount: number;
    errorCount: number;
    lastRun: string;
  }> {
    return Array.from(this.jobs.values()).map((job) => ({
      name: job.name,
      schedule: job.schedule,
      isRunning: job.isRunning,
      runCount: job.runCount,
      errorCount: job.errorCount,
      lastRun: job.lastRun > 0 ? new Date(job.lastRun).toISOString() : "never",
    }));
  }
}

export const scheduler = new OracleScheduler();