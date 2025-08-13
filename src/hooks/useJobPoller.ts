import { useEffect, useRef, useState } from 'react';
import api from '@/lib/api';

export function useJobPoller(jobId?: number, intervalMs: number = 1000) {
  const [status, setStatus] = useState<'pending'|'running'|'completed'|'failed'|'idle'>(jobId ? 'pending' : 'idle');
  const [result, setResult] = useState<any>(null);
  const timer = useRef<any>(null);

  useEffect(() => {
    if (!jobId) { setStatus('idle'); setResult(null); return; }
    let mounted = true;
    const tick = async () => {
      try {
        const res = await api.getJob(jobId);
        const job = res.data?.job;
        if (!mounted) return;
        setStatus(job.status);
        if (job.status === 'completed' || job.status === 'failed') {
          setResult(job.result);
          clearInterval(timer.current);
          timer.current = null;
        }
      } catch (e) {}
    };
    tick();
    timer.current = setInterval(tick, intervalMs);
    return () => { mounted = false; if (timer.current) clearInterval(timer.current); };
  }, [jobId, intervalMs]);

  return { status, result };
}