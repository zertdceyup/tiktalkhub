import db from '../database/init.js';
import logger from '../utils/logger.js';

let isRunning = false;
let intervalHandle = null;

async function processJob(job) {
  try {
    // Parse payload
    const payload = job.payload ? JSON.parse(job.payload) : {};

    // Placeholder: handle different job types
    if (job.type === 'pipeline_run') {
      // Mark as running
      db.prepare('UPDATE jobs SET status = ?, updated_at = ? WHERE id = ?').run('running', new Date().toISOString(), job.id);
      // Simulate work; in real impl, call a pipeline executor that reads pipeline schema and runs steps
      await new Promise((r) => setTimeout(r, 500));
      const result = { ok: true, note: 'Pipeline executed (stub)', payload };
      db.prepare('UPDATE jobs SET status = ?, result = ?, updated_at = ? WHERE id = ?').run('completed', JSON.stringify(result), new Date().toISOString(), job.id);
      logger.info(`Job ${job.id} completed`);
      return;
    }

    // Unknown job type
    db.prepare('UPDATE jobs SET status = ?, result = ?, updated_at = ? WHERE id = ?').run('failed', JSON.stringify({ error: 'Unknown job type' }), new Date().toISOString(), job.id);
  } catch (e) {
    const retries = (job.retries || 0) + 1;
    const status = retries >= (job.max_retries || 3) ? 'failed' : 'pending';
    db.prepare('UPDATE jobs SET status = ?, retries = ?, result = ?, updated_at = ? WHERE id = ?').run(status, retries, JSON.stringify({ error: e.message || String(e) }), new Date().toISOString(), job.id);
    logger.error(`Job ${job.id} error:`, e);
  }
}

async function tick() {
  if (isRunning) return;
  isRunning = true;
  try {
    const jobs = db.prepare(`SELECT * FROM jobs WHERE status IN ('pending') ORDER BY created_at ASC LIMIT 3`).all();
    for (const job of jobs) {
      await processJob(job);
    }
  } catch (e) {
    logger.error('Queue tick error:', e);
  } finally {
    isRunning = false;
  }
}

export function startQueue() {
  if (intervalHandle) return;
  intervalHandle = setInterval(tick, 1000);
  logger.info('Background queue started');
}

export function stopQueue() {
  if (intervalHandle) clearInterval(intervalHandle);
  intervalHandle = null;
}

export default { startQueue, stopQueue };