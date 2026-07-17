import { KiokuConstants, type Character } from "../types/KiokuTypes"
import { KiokuElement, KiokuRole } from '../types/enums'
import { useBetaNumber, useBetaValue } from "../utils/betaSettings"
import { skewnormCdf } from "../utils/mathFuncs"

export function countCharsObtained(chars: Character[]): { lim: number,limAs: number, perm: number, permAs: number } {
    const relevant = chars.filter(c => c.rarity === 5 && c.enabled && c.name !== "Lux☆Magica")
    const lims = relevant.filter(c => c.obtain === "Exclusive")
    const perms = relevant.filter(c => c.obtain !== "Exclusive")
    const limAs = lims.reduce((sum, ch) => sum + ch.ascension + 1, 0)
    const permAs = perms.reduce((sum, ch) => sum + ch.ascension + 1, 0)
    return {
        lim: lims.length,
        limAs,
        perm: perms.length,
        permAs,
    }
}

export type PowerScores = {
    total: number

    [KiokuRole.Attacker]: number
    [KiokuRole.Buffer]: number
    [KiokuRole.Debuffer]: number
    [KiokuRole.Breaker]: number
    [KiokuRole.Defender]: number
    [KiokuRole.Healer]: number
    whale: number
}

const COLLAB = new Set([
    "Unlimited Rulebook",
    "Screw Zone",
    "Kiss-shot",
])

function getWhaleMultiplier(ch: Character): number {
    const now = Date.now()
    const monthMs = 1000 * 60 * 60 * 24 * 30

    const permMonths = useBetaNumber("whalePermanentDurationMonths")
    const permMult = useBetaNumber("whalePermanentMultiplier")
    const permFloor = useBetaNumber("whalePermanentDecayFloor")

    const limitedMonths = useBetaNumber("whaleLimitedDurationMonths")
    const limitedMult = useBetaNumber("whaleLimitedMultiplier")
    const limitedFloor = useBetaNumber("whaleLimitedDecayFloor")

    const collabMult = useBetaNumber("whaleCollabMultiplier")

    if (COLLAB.has(ch.name)) {
        return collabMult
    }

    const permanentDate = ch.permaDate ? new Date(ch.permaDate) : null
    const releaseDate = new Date(ch.releaseDate)

    if (permanentDate) {
        if (permanentDate.getTime() > now) {
            return permMult
        }

        const monthsSincePermanent =
            (now - permanentDate.getTime()) / monthMs

        if (monthsSincePermanent >= permMonths) {
            return permFloor
        }

        const progress = monthsSincePermanent / permMonths
        return permMult - progress * (permMult - permFloor)
    }

    const monthsSince = (now - releaseDate.getTime()) / monthMs

    if (monthsSince >= limitedMonths) {
        return limitedFloor
    }

    const progress = monthsSince / limitedMonths
    return limitedMult - progress * (limitedMult - limitedFloor)
}

function getCharacterPower(ch: Character): number {
    if (!ch.enabled) return 0

    let power = useBetaNumber("basePower")
    power += ch.ascension * useBetaNumber("ascensionPowerPerLevel")

    const matrix =
        useBetaValue<Record<KiokuRole, Record<string, number>>>(
            "roleAscensionBonuses"
        )

    const roleBonuses: Record<string, number> = matrix[ch.role] ?? {}

    // apply ALL ascension bonuses up to current level
    for (let i = 1; i <= ch.ascension; i++) {
        power += roleBonuses[i.toString()] ? Number(roleBonuses[i.toString()]) : 0
    }

    const uniqueKiokuAscensionBonuses =
        useBetaValue<Record<string, Record<string, number>>>(
            "kiokuAscensionScalings"
        )

    const kiokuBonuses: Record<string, number> = uniqueKiokuAscensionBonuses[ch.name] ?? {}

    for (const [ascensionLevel, bonus] of Object.entries(kiokuBonuses)) {
        if (ch.ascension >= Number(ascensionLevel)) {
            power += Number(bonus)
        }

    }
    return power
}

function getCharacterWhalePower(ch: Character): number {
    if (!ch.enabled) return 0

    let whale = useBetaNumber("whaleBase")

    if (ch.ascension >= 1) whale += useBetaNumber("whaleAscension1")
    if (ch.ascension >= 2) whale += useBetaNumber("whaleAscension2")
    if (ch.ascension >= 3) whale += useBetaNumber("whaleAscension3")
    if (ch.ascension >= 4) whale += useBetaNumber("whaleAscension4")
    if (ch.ascension >= 5) whale += useBetaNumber("whaleAscension5")

    return whale
}

function getMaxPower(ch: Character, getPower: (character: Character) => number): number {
    const maxed: Character = {
        ...ch,
        enabled: true,
        ascension: KiokuConstants.maxAscension,
    }

    return getPower(maxed)
}

// Default is March 27, 2025 in milliseconds
function getModelF2PWhalePower(startDateMs: number = 1742947200000): number {
    const monthMs = 1000 * 60 * 60 * 24 * 30
    const months = (Math.floor(Date.now()) - startDateMs) / monthMs
    return 247 * months + 4600 * (1 - Math.exp(-months / 4)) + 300
}

function remap(v: number, min: number, max: number, normExp: number): number {
    const normalized = Math.pow((v - min) / (max - min), normExp)
    if (Number.isNaN(normalized)) return 0
    return Math.round(Math.max(0, Math.min(1, normalized)) * 100)
}

function normalize(current: number, max: number, minNorm: number, maxNorm: number, normExp: number): number {
    if (max <= 0) return 0
    return remap(current / max, minNorm, maxNorm, normExp)
}

function normalizeWhale(current: number, max: number, minNorm: number, maxNorm: number): number {
    const a = useBetaNumber("whaleSkewNormA")
    const loc = useBetaNumber("whaleSkewNormLoc")
    const scale = useBetaNumber("whaleSkewNormScale")

    if (max <= 0) return 0

    // remap
    // tho min and max are probably not needed anymore
    const v = (current / max - minNorm) / (maxNorm - minNorm)
    const normalized = skewnormCdf(v, a, loc, scale)
    if (Number.isNaN(normalized)) return 0
    return Math.round(Math.max(0, Math.min(1, normalized)) * 100)
}

function applyGroupedDiminishingReturns(
    items: WeightedEntry[],
    getValue: (item: WeightedEntry) => number = (x) => x.value,
    getGroup: (item: WeightedEntry) => string = (x) => `${x.role}_${x.element}`,
    decay = useBetaNumber("diminishingReturnsDecay")
): number {
    const groups = new Map<string, number[]>()

    for (const item of items) {
        const group = getGroup(item)
        const value = getValue(item)

        if (!groups.has(group)) {
            groups.set(group, [])
        }

        groups.get(group)!.push(value)
    }

    let total = 0

    for (const values of groups.values()) {
        values.sort((a, b) => b - a)

        values.forEach((value, index) => {
            total += value * Math.pow(decay, index)
        })
    }

    return total
}

type WeightedEntry = {
    value: number
    role: KiokuRole
    element: KiokuElement
}

export function getPowerScores(chars: Character[]): PowerScores {
    const fiveStars = chars.filter(
        (ch) => ch.rarity === 5 && ch.name !== "Lux☆Magica"
    )

    const roleCurrent = {
        [KiokuRole.Attacker]: [] as WeightedEntry[],
        [KiokuRole.Buffer]: [] as WeightedEntry[],
        [KiokuRole.Debuffer]: [] as WeightedEntry[],
        [KiokuRole.Breaker]: [] as WeightedEntry[],
        [KiokuRole.Defender]: [] as WeightedEntry[],
        [KiokuRole.Healer]: [] as WeightedEntry[],
    }

    const roleMax = {
        [KiokuRole.Attacker]: [] as WeightedEntry[],
        [KiokuRole.Buffer]: [] as WeightedEntry[],
        [KiokuRole.Debuffer]: [] as WeightedEntry[],
        [KiokuRole.Breaker]: [] as WeightedEntry[],
        [KiokuRole.Defender]: [] as WeightedEntry[],
        [KiokuRole.Healer]: [] as WeightedEntry[],
    }

    const totalCurrent: WeightedEntry[] = []
    const totalMax: WeightedEntry[] = []
    const totalWhaleCurrent: WeightedEntry[] = []
    const totalWhaleMax: WeightedEntry[] = []

    for (const ch of fiveStars) {
        const pwrRatio = getCharacterPower(ch) / getMaxPower(ch, getCharacterPower)

        const roleScaling =
            useBetaValue<Record<string, number>>("roleScalings")[ch.role] ?
                Number(useBetaValue<Record<string, number>>("roleScalings")[ch.role]) : useBetaNumber("defaultScaling")

        const kiokuScaling =
            useBetaValue<Record<string, number>>("kiokuScalings")[ch.name] ?
                Number(useBetaValue<Record<string, number>>("kiokuScalings")[ch.name]) : 1


        const scaledMax = roleScaling * kiokuScaling
        const scaledCurrent = pwrRatio * scaledMax

        const whaleMetaMultiplier = 1 + (1 / (roleScaling * kiokuScaling) - 1) * useBetaNumber("whaleMetaMultiplier")
        const whaleScaledMax = getMaxPower(ch, getCharacterWhalePower) * getWhaleMultiplier(ch) * whaleMetaMultiplier
        const whaleScaledCurrent = getCharacterWhalePower(ch) * getWhaleMultiplier(ch) * whaleMetaMultiplier

        const data = { role: ch.role, element: ch.element }

        totalCurrent.push({ ...data, value: scaledCurrent })
        totalMax.push({ ...data, value: scaledMax })
        totalWhaleCurrent.push({ ...data, value: whaleScaledCurrent })
        totalWhaleMax.push({ ...data, value: whaleScaledMax })

        roleCurrent[ch.role]?.push({ ...data, value: scaledCurrent })
        roleMax[ch.role]?.push({ ...data, value: scaledMax })
    }

    const modelF2PWhalePower = getModelF2PWhalePower()
    const whaleValue = totalWhaleCurrent.reduce((sum, entry) => sum + entry.value, 0)
    const maxWhaleValue = totalWhaleMax.reduce((sum, entry) => sum + entry.value, 0)
    const diffWithF2P = Math.max(0, whaleValue - modelF2PWhalePower)
    const maxDiffWithF2P = Math.max(0, maxWhaleValue - modelF2PWhalePower)

    return {
        total: normalize(
            applyGroupedDiminishingReturns(totalCurrent),
            applyGroupedDiminishingReturns(totalMax),
            useBetaNumber("defaultNormalizeMin"),
            useBetaNumber("defaultNormalizeMax"),
            useBetaNumber("defaultNormalizationExponent"),
        ),
        whale: normalizeWhale(
            diffWithF2P,
            maxDiffWithF2P,
            useBetaNumber("whaleNormalizeMin"),
            useBetaNumber("whaleNormalizeMax"),
        ),
        [KiokuRole.Attacker]: normalize(
            applyGroupedDiminishingReturns(roleCurrent[KiokuRole.Attacker]),
            applyGroupedDiminishingReturns(roleMax[KiokuRole.Attacker]),
            useBetaNumber("defaultNormalizeMin"),
            useBetaNumber("defaultNormalizeMax"),
            useBetaNumber("defaultNormalizationExponent"),
        ),
        [KiokuRole.Buffer]: normalize(
            applyGroupedDiminishingReturns(roleCurrent[KiokuRole.Buffer]),
            applyGroupedDiminishingReturns(roleMax[KiokuRole.Buffer]),
            useBetaNumber("defaultNormalizeMin"),
            useBetaNumber("defaultNormalizeMax"),
            useBetaNumber("defaultNormalizationExponent"),
        ),
        [KiokuRole.Debuffer]: normalize(
            applyGroupedDiminishingReturns(roleCurrent[KiokuRole.Debuffer]),
            applyGroupedDiminishingReturns(roleMax[KiokuRole.Debuffer]),
            useBetaNumber("defaultNormalizeMin"),
            useBetaNumber("defaultNormalizeMax"),
            useBetaNumber("defaultNormalizationExponent"),
        ),
        [KiokuRole.Breaker]: normalize(
            applyGroupedDiminishingReturns(roleCurrent[KiokuRole.Breaker]),
            applyGroupedDiminishingReturns(roleMax[KiokuRole.Breaker]),
            useBetaNumber("defaultNormalizeMin"),
            useBetaNumber("defaultNormalizeMax"),
            useBetaNumber("defaultNormalizationExponent"),
        ),
        [KiokuRole.Defender]: normalize(
            applyGroupedDiminishingReturns(roleCurrent[KiokuRole.Defender]),
            applyGroupedDiminishingReturns(roleMax[KiokuRole.Defender]),
            useBetaNumber("defaultNormalizeMin"),
            useBetaNumber("defaultNormalizeMax"),
            useBetaNumber("defaultNormalizationExponent"),
        ),
        [KiokuRole.Healer]: normalize(
            applyGroupedDiminishingReturns(roleCurrent[KiokuRole.Healer]),
            applyGroupedDiminishingReturns(roleMax[KiokuRole.Healer]),
            useBetaNumber("defaultNormalizeMin"),
            useBetaNumber("defaultNormalizeMax"),
            useBetaNumber("defaultNormalizationExponent"),
        ),
    }
}