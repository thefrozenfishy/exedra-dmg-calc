import fs from 'fs/promises';
import path from 'path';
import { pipeline } from '@huggingface/transformers';

// Update these to match your actual folder paths
const IMAGE_FOLDERS = [
    ['./public/portrait_images', 0, 1],
    ['./public/kioku_images', 0, 1],
    ['./public/kioku_party_images', 0, 1],
];
const OUTPUT_FILE = './public/candidates.json';

async function generate() {
    let cache = {};
    try {
        const fileData = await fs.readFile(OUTPUT_FILE, 'utf-8');
        cache = JSON.parse(fileData);
        console.log(`Loaded ${Object.keys(cache).length} existing embeddings.`);
    } catch (error) {
        console.log("No existing candidates.json found. Starting fresh.");
    }

    let isUpdated = false;
    let extractor = null;

    for (const [folder, bottom, top] of IMAGE_FOLDERS) {
        let files = [];
        try {
            files = await fs.readdir(folder);
        } catch (e) {
            console.warn(`Could not read folder: ${folder}`);
            continue;
        }

        for (const file of files) {
            if (!file.match(/\.(png|jpe?g)$/i)) continue;

            const key = path.parse(file).name.replace('_thumbnail', '');

            if (cache[key]) continue;

            if (!extractor) {
                extractor = await pipeline(
                    "image-feature-extraction",
                    "Xenova/clip-vit-base-patch32",
                    { dtype: "q8" }
                );
            }

            const filePath = path.join(folder, file);
            const result = await extractor(filePath, {
                pooling: "mean",
                normalize: true,
            });

            cache[key] = Array.from(result.data);
            isUpdated = true;
        }
    }

    if (isUpdated) {
        await fs.writeFile(OUTPUT_FILE, JSON.stringify(cache));
        console.log("Successfully saved updated candidates.json!");
    } else {
        console.log("All images are already up to date. Nothing to save.");
    }
}

generate();
