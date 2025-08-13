import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

let onnxAvailable = false;
let onnxRunner = null;

export async function initEmbeddings() {
  try {
    const modelDir = process.env.EMBEDDING_MODEL_DIR || '';
    const onnxModel = modelDir ? path.join(modelDir, 'model.onnx') : '';
    if (onnxModel && fs.existsSync(onnxModel)) {
      // Lazy approach: shell out to a tiny python runner if provided; otherwise mark onnx unavailable
      onnxAvailable = false;
    }
  } catch {
    onnxAvailable = false;
  }
}

function hashWord(word) {
  let h = 2166136261;
  for (let i = 0; i < word.length; i++) {
    h ^= word.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return Math.abs(h % 512);
}

function simpleEmbed(text) {
  const vec = new Array(512).fill(0);
  const tokens = String(text).toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  if (!tokens.length) return vec;
  for (const t of tokens) vec[hashWord(t)] += 1;
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  return vec.map(v => v / norm);
}

export async function embedTexts(texts = []) {
  if (!Array.isArray(texts)) texts = [String(texts || '')];
  // If ONNX runtime is available, call it here (not implemented in this scaffold)
  return texts.map(simpleEmbed);
}

export function cosineSim(a, b) {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  const denom = Math.sqrt(na || 1) * Math.sqrt(nb || 1) || 1;
  return dot / denom;
}

export default { initEmbeddings, embedTexts, cosineSim };