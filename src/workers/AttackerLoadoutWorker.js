import { findBestAttackerLoadout } from '../models/BestTeamCalculator'

self.onmessage = async (e) => {
    const { options } = e.data

    const onProgress = (completed, total) => {
        self.postMessage({ type: 'progress', completed, total })
    }
    const onError = (error) => {
        self.postMessage({ type: 'error', error: error?.message ?? String(error) })
    }

    try {
        const results = await findBestAttackerLoadout({ ...options, onProgress, onError })
        self.postMessage({ type: 'done', results })
    } catch (error) {
        self.postMessage({ type: 'error', error: error?.message ?? String(error) })
    }
}
