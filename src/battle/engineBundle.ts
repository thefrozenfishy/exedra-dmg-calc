// The 1:1 game port (src/engine) as one ES module, built by `node scripts/engine/bundle.mjs` (npm predev/prebuild).
// The port's one-file-per-class layout is one big import cycle, so the app always uses the bundle, never the sources.
// The bundle carries no types: the app side treats engine objects as `any` and keeps its own small interfaces.
// @ts-ignore - generated JS module without declarations
import * as bundle from "../engine/dist/engine.js"

export const E: any = bundle
