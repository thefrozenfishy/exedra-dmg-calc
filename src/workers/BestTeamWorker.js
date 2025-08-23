import { findBestTeam } from '../models/BestTeamCalculator'

self.onmessage = async (e) => {
    const { options } = e.data
    const reportProgress = currChars => {
        self.postMessage({ type: 'progress', currChars })
    }
    const results = await findBestTeam({
        ...options,
        onProgress: reportProgress // optional callback in your findBestTeam
    })
    self.postMessage({ type: 'done', results })
}
