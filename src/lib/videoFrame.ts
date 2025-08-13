export async function extractFrameDataURL(file: File, timeSec: number, targetWidth?: number): Promise<string> {
  const url = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.src = url;
  video.crossOrigin = 'anonymous';
  video.muted = true;
  await new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => resolve();
    video.onerror = () => reject(new Error('Failed to load video'));
  });
  const clamped = Math.min(Math.max(0.1, timeSec), Math.max(0.1, video.duration - 0.1));
  video.currentTime = clamped;
  await new Promise<void>((resolve) => { video.onseeked = () => resolve(); });
  const scale = targetWidth ? targetWidth / video.videoWidth : 1;
  const width = Math.round(video.videoWidth * scale) || video.videoWidth || 1280;
  const height = Math.round(video.videoHeight * scale) || video.videoHeight || 720;
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('No 2D context');
  ctx.drawImage(video, 0, 0, width, height);
  const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
  URL.revokeObjectURL(url);
  return dataUrl;
}

export function drawOverlayText(baseDataUrl: string, text: string, opts: { position?: 'top'|'bottom'; color?: string; bg?: string; fontFamily?: string; fontSize?: number; padding?: number; }): string {
  const img = new Image();
  return new Promise<string>((resolve, reject) => {
    img.onload = () => {
      const canvas = document.createElement('canvas'); canvas.width = img.width; canvas.height = img.height;
      const ctx = canvas.getContext('2d'); if (!ctx) { reject(new Error('No 2D context')); return; }
      ctx.drawImage(img, 0, 0);
      const padding = opts.padding ?? 16;
      ctx.font = `${opts.fontSize ?? 48}px ${opts.fontFamily ?? 'Inter, Arial'}`;
      ctx.textBaseline = 'middle';
      const lines = text.split('\n');
      const metrics = lines.map(line => ({ text: line, width: ctx.measureText(line).width }));
      const boxWidth = Math.min(canvas.width - padding*2, Math.max(...metrics.map(m => m.width)) + padding*2);
      const lineHeight = (opts.fontSize ?? 48) + 8;
      const boxHeight = lineHeight * lines.length + padding*2;
      const x = (canvas.width - boxWidth) / 2;
      const y = opts.position === 'top' ? padding : canvas.height - boxHeight - padding;
      ctx.fillStyle = opts.bg ?? 'rgba(0,0,0,0.6)';
      ctx.fillRect(x, y, boxWidth, boxHeight);
      ctx.fillStyle = opts.color ?? '#ffffff';
      lines.forEach((l, i) => {
        const tw = metrics[i].width;
        ctx.fillText(l, x + (boxWidth - tw)/2, y + padding + lineHeight*i + lineHeight/2);
      });
      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };
    img.onerror = () => reject(new Error('Failed to load base image'));
    img.src = baseDataUrl;
  }) as unknown as string;
}