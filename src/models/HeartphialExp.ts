import { Character, KiokuConstants } from "../types/KiokuTypes"
import { KiokuElement, KiokuRole } from '../types/enums'
import { cumulativeHeartphialExp, maxHeartphialExp } from "../utils/helpers"

export type HeartphialSegmentMode = "none" | "element" | "role"

export interface HeartphialRow {
    heartphial: string
    styles: Character[]
    segment?: KiokuElement | KiokuRole
    currentLevel: number
    currentExp: number
    maxExp: number
    remainingExp: number
    isMaxed: boolean
}

function expForLevel(level: number): number {
    const clamped = Math.max(0, Math.min(KiokuConstants.maxHeartphialLvl, level))
    return cumulativeHeartphialExp[clamped - 1] ?? 0
}

function buildRow(heartphial: string, styles: Character[], segment?: KiokuElement | KiokuRole): HeartphialRow {
    const currentLevel = styles[0]?.heartphialLvl ?? 0
    const currentExp = expForLevel(currentLevel)

    return {
        heartphial,
        styles,
        segment,
        currentLevel,
        currentExp,
        maxExp: maxHeartphialExp,
        remainingExp: Math.max(0, maxHeartphialExp - currentExp),
        isMaxed: currentLevel >= KiokuConstants.maxHeartphialLvl,
    }
}

export interface HeartphialRowOptions {
    segmentBy?: HeartphialSegmentMode
    includeUnowned?: boolean
    include3Star?: boolean
    include4Star?: boolean
}

export function getHeartphialRows(
    characters: Character[],
    options: HeartphialRowOptions = {}
): HeartphialRow[] {
    const {
        segmentBy = "none",
        includeUnowned = true,
        include3Star = false,
        include4Star = false,
    } = options

    const relevant = characters.filter(c => {
        if (c.rarity === 4) return include4Star
        if (c.rarity === 3) return include3Star
        return true
    }).filter(c => includeUnowned ? true : c.enabled)

    const byHeartphial = new Map<string, Character[]>()
    for (const ch of relevant) {
        const group = byHeartphial.get(ch.heartphial)
        if (group) group.push(ch)
        else byHeartphial.set(ch.heartphial, [ch])
    }

    const rows: HeartphialRow[] = []

    for (const [heartphial, styles] of byHeartphial) {
        if (segmentBy === "none") {
            rows.push(buildRow(heartphial, styles))
            continue
        }

        const segmentKey = segmentBy === "element" ? "element" : "role"
        const segments = new Map<string, Character[]>()

        for (const style of styles) {
            const key = style[segmentKey] as string
            const group = segments.get(key)
            if (group) group.push(style)
            else segments.set(key, [style])
        }

        for (const [, segmentStyles] of segments) {
            rows.push(buildRow(heartphial, segmentStyles, segmentStyles[0][segmentKey]))
        }
    }

    return rows
}

export function sortHeartphialRows(rows: HeartphialRow[]): HeartphialRow[] {
    return [...rows].sort((a, b) => b.remainingExp - a.remainingExp)
}

export function playsUntilMaxed(row: HeartphialRow, expPerPlay: number | undefined | null): number | null {
    if (!expPerPlay || expPerPlay <= 0) return null
    if (row.isMaxed) return 0
    return Math.ceil(row.remainingExp / expPerPlay)
}
