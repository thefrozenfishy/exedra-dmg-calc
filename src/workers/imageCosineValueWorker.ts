import { pipeline, env } from "@huggingface/transformers";

env.allowLocalModels = false;
let extractorPromise: Promise<any> | null = null;
const device = (typeof navigator !== 'undefined' && 'gpu' in navigator)
    ? 'webgpu'
    : 'wasm';

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
        const result = await extractor(imageUrls, {
            pooling: "mean",
            normalize: true,
        });

        const [n, dim] = result.dims;
        const embeddings: Float32Array[] = [];
        for (let i = 0; i < n; i++) {
            embeddings.push(result.data.slice(i * dim, (i + 1) * dim));
        }

        self.postMessage({ id, embeddings });

    } catch (error) {
        console.error("Worker Error:", error);
        self.postMessage({
            id,
            error: error instanceof Error ? error.message : "Unknown worker error"
        });
    }
};
