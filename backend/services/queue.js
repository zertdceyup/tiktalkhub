import db from '../database/init.js';
import logger from '../utils/logger.js';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

let isRunning = false;
let intervalHandle = null;

function runFFmpeg(args) {
  return new Promise((resolve, reject) => {
    const ff = spawn(process.env.FFMPEG_PATH || 'ffmpeg', ['-y', ...args]);
    let stderr = '';
    ff.stderr.on('data', d => { stderr += d.toString(); });
    ff.on('close', code => code === 0 ? resolve(stderr) : reject(new Error(stderr)));
  });
}

async function processJob(job) {
  try {
    const payload = job.payload ? JSON.parse(job.payload) : {};

    if (job.type === 'pipeline_run') {
      db.prepare('UPDATE jobs SET status = ?, updated_at = ? WHERE id = ?').run('running', new Date().toISOString(), job.id);
      await new Promise((r) => setTimeout(r, 500));
      const result = { ok: true, note: 'Pipeline executed (stub)', payload };
      db.prepare('UPDATE jobs SET status = ?, result = ?, updated_at = ? WHERE id = ?').run('completed', JSON.stringify(result), new Date().toISOString(), job.id);
      logger.info(`Job ${job.id} completed`);
      return;
    }

    if (job.type === 'video_batch') {
      db.prepare('UPDATE jobs SET status = ?, updated_at = ? WHERE id = ?').run('running', new Date().toISOString(), job.id);
      const op = payload.operation;
      const files = payload.files || [];
      const outputs = [];
      for (const filePath of files) {
        try {
          const base = path.parse(filePath).name;
          let out = '';
          if (op === 'silence-strip') {
            out = path.join(path.dirname(filePath), `${base}_q_nosilence.mp4`);
            await runFFmpeg(['-i', filePath, '-af', 'silenceremove=start_periods=1:start_silence=0.5:start_threshold=-30dB:stop_periods=1:stop_silence=0.5:stop_threshold=-30dB', '-c:v', 'copy', out]);
          } else if (op === 'loudnorm') {
            out = path.join(path.dirname(filePath), `${base}_q_loudnorm.mp4`);
            await runFFmpeg(['-i', filePath, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-c:v', 'copy', out]);
          } else if (op === 'color-fix') {
            out = path.join(path.dirname(filePath), `${base}_q_colorfix.mp4`);
            await runFFmpeg(['-i', filePath, '-vf', 'eq=contrast=1.05:saturation=1.1:brightness=0', '-c:a', 'copy', out]);
          }
          outputs.push({ input: filePath, output: out });
        } catch (e) {
          outputs.push({ input: filePath, error: e.message || String(e) });
        }
      }
      const result = { ok: true, operation: op, outputs };
      db.prepare('UPDATE jobs SET status = ?, result = ?, updated_at = ? WHERE id = ?').run('completed', JSON.stringify(result), new Date().toISOString(), job.id);
      logger.info(`Video batch job ${job.id} completed`);
      return;
    }

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

export function startQueue() { if (intervalHandle) return; intervalHandle = setInterval(tick, 1000); logger.info('Background queue started'); }
export function stopQueue() { if (intervalHandle) clearInterval(intervalHandle); intervalHandle = null; }

export default { startQueue, stopQueue };