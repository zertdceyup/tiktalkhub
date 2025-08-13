self.onmessage = async (e: MessageEvent) => {
  const data: any = e.data || {};
  if (data.type !== 'preview') return;
  try {
    const file: File = data.file;
    const format: string = data.format || 'image/jpeg';
    const quality: number = (data.quality ?? 80) / 100;
    const width = data.width;
    const height = data.height;

    const bitmap = await createImageBitmap(file);
    const targetW = width || bitmap.width;
    const targetH = height || Math.round((bitmap.height / bitmap.width) * targetW);
    const canvas = new OffscreenCanvas(targetW, targetH);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No 2D context');
    ctx.drawImage(bitmap, 0, 0, targetW, targetH);
    const blob = await canvas.convertToBlob({ type: `image/${format === 'png' ? 'png' : format}`, quality });
    const reader = new FileReader();
    reader.onload = () => { (self as any).postMessage({ type: 'preview-result', url: reader.result }); };
    reader.onerror = () => { (self as any).postMessage({ type: 'preview-error', error: 'Failed to read blob' }); };
    reader.readAsDataURL(blob);
  } catch (err: any) {
    (self as any).postMessage({ type: 'preview-error', error: err?.message || String(err) });
  }
};