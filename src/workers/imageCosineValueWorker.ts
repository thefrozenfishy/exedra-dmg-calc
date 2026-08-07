import { pipeline, env } from "@huggingface/transformers";

env.allowLocalModels = false;
let extractorPromise: Promise<any> | null = null;
const device = (typeof navigator !== 'undefined' && 'gpu' in navigator)
    ? 'webgpu'
    : 'wasm';

const INTERNAL_BATCH_SIZE = 5;

type EmbeddingUpdate =
    | { kind: 'progress'; done: number; total: number }
    | { kind: 'result'; embeddings: Float32Array[] };

async function* runExtraction(extractor: any, imageUrls: string[]): AsyncGenerator<EmbeddingUpdate> {
    const embeddings: Float32Array[] = [];

    for (let i = 0; i < imageUrls.length; i += INTERNAL_BATCH_SIZE) {
        const chunk = imageUrls.slice(i, i + INTERNAL_BATCH_SIZE);
        const result = await extractor(chunk, {
            pooling: "mean",
            normalize: true,
        });

        const [n, dim] = result.dims;
        for (let j = 0; j < n; j++) {
            embeddings.push(result.data.slice(j * dim, (j + 1) * dim));
        }

        yield { kind: 'progress', done: embeddings.length, total: imageUrls.length };
    }

    yield { kind: 'result', embeddings };
}

self.onmessage = async (event) => {
    const { id, imageUrls } = event.data;

    try {
        if (!extractorPromise) {
            extractorPromise = pipeline(
                "image-feature-extraction",
                "Xenova/clip-vit-base-patch32",
                { device, dtype: "q8" }
            );
        }

        const extractor = await extractorPromise;

        for await (const update of runExtraction(extractor, imageUrls)) {
            if (update.kind === 'progress') {
                self.postMessage({ id, progress: { done: update.done, total: update.total } });
            } else {
                self.postMessage({ id, embeddings: update.embeddings });
            }
        }

    } catch (error) {
        console.error("Worker Error:", error);
        self.postMessage({
            id,
            error: error instanceof Error ? error.message : "Unknown worker error"
        });
    }
};
