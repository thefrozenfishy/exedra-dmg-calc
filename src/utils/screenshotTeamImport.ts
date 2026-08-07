import { LuxMagica } from '../types/enums';
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

export function computeEmbedding(image: HTMLCanvasElement | HTMLImageElement): Promise<Float32Array> {
  return new Promise((resolve, reject) => {
    const id = crypto.randomUUID();

    const imageUrl = image instanceof HTMLImageElement ? image.src : image.toDataURL();

    const onMessage = (event: MessageEvent) => {
      if (event.data.id === id) {
        worker.removeEventListener('message', onMessage);

        if (event.data.error) {
          reject(new Error(event.data.error));
        } else {
          resolve(event.data.embedding as Float32Array);
        }
      }
    };

    worker.addEventListener('message', onMessage);
    worker.postMessage({ id, imageUrl });
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

  downloadCanvas(`${isCircle}_${sx}_${sy}_${sw}_${sh}.png`, canvas);
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

export async function extractTeamFromScreenshot(
  img: HTMLImageElement,
  onProgress?: (done: number, total: number) => void
): Promise<ExtractedSlotResult[]> {
  const REF_WIDTH = 1920;
  const REF_HEIGHT = 1080;

  const scaleX = img.naturalWidth / REF_WIDTH;
  const scaleY = img.naturalHeight / REF_HEIGHT;
  const BASE = 340;
  const SPACE = 356;
  const totalOps = 5 * 3;
  let currentDone = 0;

  const updateProgress = () => {
    currentDone++;
    if (onProgress) onProgress(Math.min(currentDone, totalOps), totalOps);
  };

  const results: ExtractedSlotResult[] = [];

  for (let i = 0; i < 5; i++) {
    const xCenter = BASE + i * SPACE;
    const yOffset = i === 0 ? 4 : 0; // The leftmost is too fucking high AAAAAAAAAAAAAAAAAAA

    const mainCrop = {
      sx: Math.round((xCenter - 240) * scaleX),
      sy: Math.round(200 * scaleY),
      sw: Math.round(290 * scaleX),
      sh: Math.round(260 * scaleY),
    };

    const portraitCrop = {
      sx: Math.round((xCenter - 170) * scaleX),
      sy: Math.round((675 - yOffset) * scaleY),
      sw: Math.round(150 * scaleX),
      sh: Math.round(90 * scaleY),
    };

    const supportCrop = {
      sx: Math.round((xCenter - 133) * scaleX),
      sy: Math.round((818 - yOffset) * scaleY),
      sw: Math.round(80 * scaleX),
      sh: Math.round(80 * scaleY),
    };

    const mainCanvas = cropRegion(img, mainCrop.sx, mainCrop.sy, mainCrop.sw, mainCrop.sh);
    // const portraitCanvas = cropRegion(img, portraitCrop.sx, portraitCrop.sy, portraitCrop.sw, portraitCrop.sh);
    // const supportCanvas = cropRegion(img, supportCrop.sx, supportCrop.sy, supportCrop.sw, supportCrop.sh, true);

    const mainBest = await findBestMatch(mainCanvas, candidates);
    const portraitBest = { value: "art_00_01_0001", score: 1 } // await findBestMatch(portraitCanvas, candidates);
    const supportBest = { value: "10980101", score: 1 } //await findBestMatch(supportCanvas, candidates);
    console.log(mainBest)

    updateProgress();

    results.push({
      index: i,
      portraitName: Object.values(portraits).find(p => p.resourceName === portraitBest.value)?.name,
      portraitDistance: portraitBest.score,
      characterName: LuxMagica,
      characterDistance: 1,
      supportName: Object.entries(kiokuData).find(([n, k]) => Number(supportBest.value) == k.id)?.[0],
      supportDistance: supportBest.score,
    });
  }

  return results;
}
