// The one place that starts workers/maxDamageWorker.ts (the PvE page's Max Damage panel and the Best SA Team
// calculator's pool both use it): every `new Worker(new URL(...))` site makes vite build that worker bundle, and the
// engine workers are big enough that a second build of the same one runs the production build out of memory.
export const newMaxDamageWorker = (): Worker => new Worker(new URL("./maxDamageWorker.ts", import.meta.url), { type: "module" })
