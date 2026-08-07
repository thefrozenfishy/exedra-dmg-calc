import { kiokuData, portraits } from './helpers';
import { downloadCanvas } from './image';

type Embedding = Float32Array;
const worker = new Worker(new URL('../workers/imageCosineValueWorker.ts', import.meta.url), { type: 'module' })
export let candidates: Candidate<string>[] = [];

export interface Candidate<T> {
  value: T;
  embedding: Embedding;
}

export async function loadPrecomputedCandidates() {
  const response = await fetch('./candidates.json');
  const data: Record<string, number[]> = await response.json();

  candidates = Object.entries(data).map(([key, arrayData]) => ({
    value: key,
    embedding: new Float32Array(arrayData),
  }));
}

export function warmUpEmbeddingModel() {
  const c = document.createElement('canvas');
  c.width = c.height = 8;
  return computeEmbeddingsBatch([c]).catch(() => { });
}

export function computeEmbeddingsBatch(images: (HTMLCanvasElement | HTMLImageElement)[]): Promise<Float32Array[]> {
  return new Promise((resolve, reject) => {
    const id = crypto.randomUUID();
    const imageUrls = images.map(img =>
      img instanceof HTMLImageElement ? img.src : img.toDataURL()
    );

    const onMessage = (event: MessageEvent) => {
      if (event.data.id === id) {
        worker.removeEventListener('message', onMessage);
        if (event.data.error) reject(new Error(event.data.error));
        else resolve(event.data.embeddings as Float32Array[]);
      }
    };

    worker.addEventListener('message', onMessage);
    worker.postMessage({ id, imageUrls });
  });
}

function cosineSimilarity(a: Embedding, b: Embedding): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function findBestMatch<T>(
  image: HTMLCanvasElement,
  candidates: Candidate<T>[]
): Promise<{ value: T; score: number }> {

  const query = await computeEmbedding(image);
  let bestScore = -Infinity;
  let best: T | undefined;

  for (const candidate of candidates) {
    const score = cosineSimilarity(query, candidate.embedding);

    if (score > bestScore) {
      bestScore = score;
      best = candidate.value;
    }
  }

  if (!best) throw new Error("No candidates.");

  return {
    value: best,
    score: bestScore,
  };
}

export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function cropRegion(
  srcImg: HTMLImageElement,
  sx: number,
  sy: number,
  sw: number,
  sh: number,
  isCircle: boolean = false
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, sw);
  canvas.height = Math.max(1, sh);
  const ctx = canvas.getContext('2d');

  if (ctx && sw > 0 && sh > 0) {
    if (isCircle) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(
        canvas.width / 2,
        canvas.height / 2,
        Math.min(canvas.width, canvas.height) / 2,
        0,
        Math.PI * 2
      );
      ctx.clip();
    }

    ctx.drawImage(srcImg, sx, sy, sw, sh, 0, 0, sw, sh);

    if (isCircle) {
      ctx.restore();
    }
  }

  if (false) downloadCanvas(`${isCircle}_${sx}_${sy}_${sw}_${sh}.png`, canvas);
  return canvas;
}

export const LOW_CONFIDENCE_THRESHOLD = 0.90;

export interface ExtractedSlotResult {
  index: number;
  characterName?: string;
  portraitName?: string;
  supportName?: string;
  characterDistance?: number;
  supportDistance?: number;
  portraitDistance?: number;
}

type Role = 'main' | 'portrait' | 'support';
interface CropJob { slot: number; role: Role; canvas: HTMLCanvasElement }

export async function extractTeamFromScreenshot(
  img: HTMLImageElement,
  onProgress?: (done: number, total: number) => void
): Promise<ExtractedSlotResult[]> {
  const REF_WIDTH = 1920, REF_HEIGHT = 1080;
  const scaleX = img.naturalWidth / REF_WIDTH;
  const scaleY = img.naturalHeight / REF_HEIGHT;
  const BASE = 340, SPACE = 356;

  const jobs: CropJob[] = [];

  for (let i = 0; i < 5; i++) {
    const xCenter = BASE + i * SPACE;
    const yOffset = i === 0 ? 4 : 0;

    const mainCrop = { sx: Math.round((xCenter - 240) * scaleX), sy: Math.round(200 * scaleY), sw: Math.round(290 * scaleX), sh: Math.round(260 * scaleY) };
    const portraitCrop = { sx: Math.round((xCenter - 170) * scaleX), sy: Math.round((675 - yOffset) * scaleY), sw: Math.round(150 * scaleX), sh: Math.round(90 * scaleY) };
    const supportCrop = { sx: Math.round((xCenter - 133) * scaleX), sy: Math.round((818 - yOffset) * scaleY), sw: Math.round(80 * scaleX), sh: Math.round(80 * scaleY) };

    jobs.push({ slot: i, role: 'main', canvas: cropRegion(img, mainCrop.sx, mainCrop.sy, mainCrop.sw, mainCrop.sh) });
    jobs.push({ slot: i, role: 'portrait', canvas: cropRegion(img, portraitCrop.sx, portraitCrop.sy, portraitCrop.sw, portraitCrop.sh) });
    jobs.push({ slot: i, role: 'support', canvas: cropRegion(img, supportCrop.sx, supportCrop.sy, supportCrop.sw, supportCrop.sh, true) });
  }

  onProgress?.(0, jobs.length);
  const embeddings = await computeEmbeddingsBatch(jobs.map(j => j.canvas));
  onProgress?.(jobs.length, jobs.length);

  const bySlot: Record<number, Partial<Record<Role, { value: string; score: number }>>> = {};

  jobs.forEach((job, idx) => {
    const query = embeddings[idx];
    let bestScore = -Infinity, best: string | undefined;
    for (const candidate of candidates) {
      const score = cosineSimilarity(query, candidate.embedding);
      if (score > bestScore) { bestScore = score; best = candidate.value; }
    }
    if (job.role === "main")       best = best?.slice(0, 8);
    (bySlot[job.slot] ??= {})[job.role] = { value: best!, score: bestScore };
  });

  return Array.from({ length: 5 }, (_, i) => ({
    index: i,
    portraitName: Object.values(portraits).find(p => p.resourceName === bySlot[i]?.portrait?.value)?.name,
    portraitDistance: bySlot[i]?.portrait?.score,
    characterName: Object.entries(kiokuData).find(([, k]) => Number(bySlot[i]?.main?.value) === k.id)?.[0],
    characterDistance: bySlot[i]?.main?.score,
    supportName: Object.entries(kiokuData).find(([, k]) => Number(bySlot[i]?.support?.value) === k.id)?.[0],
    supportDistance: bySlot[i]?.support?.score,
  }));
}