import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { pipeline } from '@huggingface/transformers';

const IMAGE_FOLDERS = [
    ['./public/portrait_images', 0, 0, false],
    ['./public/kioku_images', 0, 0, true],
    ['./public/kioku_party_images', 0.37, 0.10, false],
];

const OUTPUT_FILE = './public/candidates.json';
const CROPPED_OUTPUT_FOLDER = './public/cropped_candidates';

function createCircleMask(width, height) {
    const radius = Math.min(width, height) / 2;
    const svg = `<svg width="${width}" height="${height}">
        <circle cx="${width / 2}" cy="${height / 2}" r="${radius}" fill="#fff" />
    </svg>`;
    return Buffer.from(svg);
}

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

    for (const [folder, bottom, top, isCircle] of IMAGE_FOLDERS) {
        let files = [];

        try {
            files = await fs.readdir(folder);
        } catch (e) {
            console.warn(`Could not read folder: ${folder}`);
            continue;
        }

        const folderName = path.basename(folder);
        const croppedFolder = path.join(
            CROPPED_OUTPUT_FOLDER,
            folderName
        );

        if (top > 0 || bottom > 0 || isCircle) {
            await fs.mkdir(croppedFolder, { recursive: true });
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
            let imageInput = filePath;

            if (top > 0 || bottom > 0 || isCircle) {
                const metadata = await sharp(filePath).metadata();

                if (!metadata.width || !metadata.height) {
                    console.warn(`Could not determine dimensions for ${filePath}`);
                    continue;
                }

                const cropTop = Math.round(metadata.height * top);
                const cropBottom = Math.round(metadata.height * bottom);
                const cropHeight = metadata.height - cropTop - cropBottom;

                if (cropHeight <= 0) {
                    console.warn(`Invalid crop for ${filePath}`);
                    continue;
                }

                const croppedPath = path.join(croppedFolder, file);

                let pipelineSharp = sharp(filePath)
                    .extract({
                        left: 0,
                        top: cropTop,
                        width: metadata.width,
                        height: cropHeight,
                    });

                if (isCircle) {
                    const circleMask = createCircleMask(metadata.width, cropHeight);
                    const extractedBuffer = await pipelineSharp.png().toBuffer();
                    pipelineSharp = sharp(extractedBuffer).composite([{
                        input: circleMask,
                        blend: 'dest-in'
                    }]);
                }

                await pipelineSharp.png().toFile(croppedPath);

                console.log(
                    `Cropped ${file} → ${croppedPath} ` +
                    `(top: ${top * 100}%, bottom: ${bottom * 100}%, circle: ${isCircle})`
                );

                imageInput = croppedPath;
            }

            const result = await extractor(imageInput, {
                pooling: "mean",
                normalize: true,
            });

            cache[key] = Array.from(result.data);
            isUpdated = true;
        }
    }

    if (isUpdated) {
        await fs.writeFile(OUTPUT_FILE, JSON.stringify(cache,));
        console.log("Successfully saved updated candidates.json!");
    } else {
        console.log("All images are already up to date. Nothing to save.");
    }
}

generate();
