import { pipeline, env } from "@huggingface/transformers";

env.allowLocalModels = false;
let extractorPromise: Promise<any> | null = null;
const device = (typeof navigator !== 'undefined' && 'gpu' in navigator)
    ? 'webgpu'
    : 'wasm';

self.onmessage = async (event) => {
    const { id, imageUrl } = event.data;

    try {
        if (!extractorPromise) {
            extractorPromise = pipeline(
                "image-feature-extraction",
                "Xenova/clip-vit-base-patch32",
                { device, dtype: "q8" }
            );
        }

        const extractor = await extractorPromise;
        const result = await extractor(imageUrl, {
            pooling: "mean",
            normalize: true,
        });

        self.postMessage({
            id,
            embedding: result.data
        });

    } catch (error) {
        console.error("Worker Error:", error);

        self.postMessage({
            id,
            error: error instanceof Error ? error.message : "Unknown worker error"
        });
    }
};
