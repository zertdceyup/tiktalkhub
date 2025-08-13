let ffmpegInstance: any = null;

async function getFFmpeg() {
  if (ffmpegInstance) return ffmpegInstance;
  const mod: any = await import('@ffmpeg/ffmpeg');
  const create = mod.createFFmpeg || (mod.default && mod.default.createFFmpeg);
  const fetchFile = mod.fetchFile || (mod.default && mod.default.fetchFile);
  if (!create || !fetchFile) throw new Error('FFmpeg WASM not available');
  const ff = create({ log: false });
  await ff.load();
  ffmpegInstance = { ff, fetchFile };
  return ffmpegInstance;
}

export async function convertToGifClient(file: File, opts: { start?: number; duration?: number; fps?: number; quality?: 'low'|'medium'|'high' }) {
  const start = opts.start ?? 0;
  const duration = opts.duration ?? 3;
  const fps = opts.fps ?? 15;
  const scale = 360;
  const { ff, fetchFile } = await getFFmpeg();
  const inName = 'input.mp4';
  const palette = 'palette.png';
  const outName = 'out.gif';
  ff.FS('writeFile', inName, await fetchFile(file));
  await ff.run('-ss', String(start), '-t', String(duration), '-i', inName, '-vf', `fps=${fps},scale=-1:${scale}:flags=lanczos,palettegen`, palette);
  await ff.run('-ss', String(start), '-t', String(duration), '-i', inName, '-i', palette, '-lavfi', `fps=${fps},scale=-1:${scale}:flags=lanczos [x]; [x][1:v] paletteuse=dither=sierra2_4a`, '-loop', '0', outName);
  const data = ff.FS('readFile', outName);
  const blob = new Blob([data.buffer], { type: 'image/gif' });
  return URL.createObjectURL(blob);
}

export async function convertTrimClient(file: File, opts: { start: number; end: number }) {
  const start = opts.start ?? 0;
  const end = opts.end ?? start + 3;
  const { ff, fetchFile } = await getFFmpeg();
  const inName = 'input.mp4';
  const outName = 'clip.mp4';
  ff.FS('writeFile', inName, await fetchFile(file));
  await ff.run('-ss', String(start), '-to', String(end), '-i', inName, '-c', 'copy', outName);
  const data = ff.FS('readFile', outName);
  const blob = new Blob([data.buffer], { type: 'video/mp4' });
  return URL.createObjectURL(blob);
}

export default { convertToGifClient };