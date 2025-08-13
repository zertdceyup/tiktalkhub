import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

let ffmpegInstance: any = null;

async function getFFmpeg() {
  if (ffmpegInstance) return ffmpegInstance;
  const ff = createFFmpeg({ log: false });
  await ff.load();
  ffmpegInstance = ff;
  return ffmpegInstance;
}

export async function convertToGifClient(file: File, opts: { start?: number; duration?: number; fps?: number; quality?: 'low'|'medium'|'high' }) {
  const start = opts.start ?? 0;
  const duration = opts.duration ?? 3;
  const fps = opts.fps ?? 15;
  const scale = 360; // height target
  const ff = await getFFmpeg();
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

export default { convertToGifClient };