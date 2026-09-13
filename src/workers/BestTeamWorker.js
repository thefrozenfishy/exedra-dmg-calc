import { findBestTeam } from '../models/BestTeamCalculator'

self.onmessage = async (e) => {
    const { options } = e.data

    const onProgress = (currChars, completedRuns, expectedTotalRuns, preprocessing) => {
        self.postMessage({ type: 'progress', currChars, completedRuns, expectedTotalRuns, preprocessing })
    }
    const onError = (error) => {
        self.postMessage({ type: 'error', error })
    }
    const results = await findBestTeam({ ...options, onProgress, onError })
    self.postMessage({ type: 'done', results })
}
