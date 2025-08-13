import { useEffect, useRef, useState } from 'react';
import api from '@/lib/api';

export function useAutosaveProject(name: string, data: any, debounceMs: number = 1200) {
  const [projectId, setProjectId] = useState<number | null>(null);
  const timer = useRef<any>(null);

  useEffect(() => {
    if (!name) return;
    if (!projectId) {
      (async () => {
        try { const res = await api.createProject(name, data); setProjectId(res.data?.id || null); } catch {}
      })();
    } else {
      clearTimeout(timer.current);
      timer.current = setTimeout(async () => { try { await api.updateProject(projectId, data); } catch {} }, debounceMs);
    }
    return () => { clearTimeout(timer.current); };
  }, [name, JSON.stringify(data), projectId, debounceMs]);

  return { projectId };
}