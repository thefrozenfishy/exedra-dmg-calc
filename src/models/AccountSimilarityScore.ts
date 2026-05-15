import { KiokuConstants, type Character } from "../types/KiokuTypes"

const VALUE_OF_UNOWNED_DIFF = 5
const COSINE_SIMILARITY_VALUE = 0.2

function remap(v: number, min: number, max: number) {
    // Remap v from 0-1 to min-max, with clamping
    const normalized = (v - min) / (max - min)
    console.log("Raw similarity:", v, "Normalized:", normalized)
    return Math.round(Math.max(0, Math.min(1, normalized)) * 100)
}

export function getAccountSimilarityScore(
    myChars: Character[],
    otherChars: Character[]
): number {
    const myFiveStars = myChars.filter(ch => ch.rarity === 5 && ch.name !== "Lux☆Magica")
    const myMap = new Map(myFiveStars.map(ch => [ch.id, ch]))
    const otherFiveStars = otherChars.filter(ch => ch.rarity === 5 && ch.name !== "Lux☆Magica")
    const otherMap = new Map(otherFiveStars.map(ch => [ch.id, ch]))

    let dot = 0
    let magA = 0
    let magB = 0

    let distanceTotal = 0
    let distanceMax = 0

    for (const id of myMap.keys()) {
        const mine = myMap.get(id)
        const theirs = otherMap.get(id)
        if (!mine?.enabled && !theirs?.enabled) continue

        const a = mine?.enabled ? mine.ascension + VALUE_OF_UNOWNED_DIFF : 0

        const b = theirs?.enabled ? theirs.ascension + VALUE_OF_UNOWNED_DIFF : 0

        dot += a * b
        magA += a * a
        magB += b * b

        distanceTotal += Math.abs(a - b)
        distanceMax += KiokuConstants.maxAscension + VALUE_OF_UNOWNED_DIFF
    }

    if (magA === 0 || magB === 0) {
        return 0
    }

    const cosineSimilarity = dot / (Math.sqrt(magA) * Math.sqrt(magB))
    const distanceSimilarity = 1 - (distanceTotal / distanceMax)
    const rawSimilarity = cosineSimilarity * COSINE_SIMILARITY_VALUE + distanceSimilarity * (1 - COSINE_SIMILARITY_VALUE)

    return remap(rawSimilarity, 0.7, 0.9)
}