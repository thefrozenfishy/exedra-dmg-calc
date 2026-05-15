import { KiokuConstants, KiokuElement, KiokuRole, type Character } from "../types/KiokuTypes"
import { useBetaNumber, useBetaValue } from "../utils/betaSettings"

export type PowerScores = {
    total: number

    attacker: number
    buffer: number
    debuffer: number
    breaker: number
    defender: number
    healer: number
    whale: number
}

const COLLAB = new Set([
    "Unlimited Rulebook",
    "Screw Zone",
    "Kiss-shot",
])

function getWhaleMultiplier(ch: Character): number {
    const now = Date.now()

    const monthMs = useBetaNumber("whaleMonthMs")
    const permMonths = useBetaNumber("whalePermanentDurationMonths")
    const releaseMonths = useBetaNumber("whaleReleaseDurationMonths")
    const floor = useBetaNumber("whaleDecayFloor")
    const collabMult = useBetaNumber("whaleCollabMultiplier")

    if (COLLAB.has(ch.name)) {
        return collabMult
    }

    const permanentDate = ch.permaDate ? new Date(ch.permaDate) : null
    const releaseDate = new Date(ch.releaseDate)

    if (permanentDate) {
        if (permanentDate.getTime() > now) {
            return collabMult
        }

        const monthsSincePermanent =
            (now - permanentDate.getTime()) / monthMs

        if (monthsSincePermanent >= permMonths) {
            return floor
        }

        const progress = monthsSincePermanent / permMonths
        return collabMult - progress * (collabMult - floor)
    }

    const monthsSince = (now - releaseDate.getTime()) / monthMs

    if (monthsSince >= releaseMonths) {
        return 1
    }

    const progress = monthsSince / releaseMonths
    return collabMult - progress * (collabMult - 1)
}

function getCharacterPower(ch: Character): number {
    if (!ch.enabled) return 0

    let power = useBetaNumber("basePower")
    power += ch.ascension * useBetaNumber("ascensionPowerPerLevel")

    const matrix =
        useBetaValue<Record<string, Record<number, number>>>(
            "roleAscensionBonuses"
        )

    const roleBonuses = matrix[ch.role] ?? {}

    // apply ALL ascension bonuses up to current level
    for (let i = 1; i <= ch.ascension; i++) {
        power += roleBonuses[i] ?? 0
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

function remap(v: number, min: number, max: number, normExp: number): number {
    const normalized = Math.pow((v - min) / (max - min), normExp)
    if (Number.isNaN(normalized)) return 0
    return Math.round(Math.max(0, Math.min(1, normalized)) * 100)
}

function normalize(
    current: number,
    max: number,
    minNorm: number = useBetaNumber("defaultNormalizeMin"),
    maxNorm: number = useBetaNumber("defaultNormalizeMax"),
    normExp: number = useBetaNumber("defaultNormalizationExponent")
): number {
    if (max <= 0) return 0
    return remap(current / max, minNorm, maxNorm, normExp)
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
        attacker: [] as WeightedEntry[],
        buffer: [] as WeightedEntry[],
        debuffer: [] as WeightedEntry[],
        breaker: [] as WeightedEntry[],
        defender: [] as WeightedEntry[],
        healer: [] as WeightedEntry[],
    }

    const roleMax = {
        attacker: [] as WeightedEntry[],
        buffer: [] as WeightedEntry[],
        debuffer: [] as WeightedEntry[],
        breaker: [] as WeightedEntry[],
        defender: [] as WeightedEntry[],
        healer: [] as WeightedEntry[],
    }

    const totalCurrent: WeightedEntry[] = []
    const totalMax: WeightedEntry[] = []
    const totalWhaleCurrent: WeightedEntry[] = []
    const totalWhaleMax: WeightedEntry[] = []

    for (const ch of fiveStars) {
        const pwrRatio =
            getCharacterPower(ch) /
            getMaxPower(ch, getCharacterPower)

        const whaleRatio =
            getCharacterWhalePower(ch) /
            getMaxPower(ch, getCharacterWhalePower)

        const roleScaling =
            useBetaValue<Record<string, number>>("roleScalings")[ch.role] ??
            useBetaNumber("defaultScaling")

        const kiokuScaling =
            useBetaValue<Record<string, number>>("kiokuScalings")[ch.name] ??
            1

        const scaledMax = roleScaling * kiokuScaling
        const scaledCurrent = pwrRatio * scaledMax

        const whaleScaledMax =
            getWhaleMultiplier(ch) / (roleScaling * kiokuScaling)

        const whaleScaledCurrent = whaleRatio * whaleScaledMax

        const data = { role: ch.role, element: ch.element }

        totalCurrent.push({ ...data, value: scaledCurrent })
        totalMax.push({ ...data, value: scaledMax })
        totalWhaleCurrent.push({ ...data, value: whaleScaledCurrent })
        totalWhaleMax.push({ ...data, value: whaleScaledMax })

        roleCurrent[ch.role as keyof typeof roleCurrent]?.push({
            ...data,
            value: scaledCurrent,
        })

        roleMax[ch.role as keyof typeof roleMax]?.push({
            ...data,
            value: scaledMax,
        })
    }

    return {
        total: normalize(
            applyGroupedDiminishingReturns(totalCurrent),
            applyGroupedDiminishingReturns(totalMax)
        ),
        whale: normalize(
            applyGroupedDiminishingReturns(totalWhaleCurrent),
            applyGroupedDiminishingReturns(totalWhaleMax),
            useBetaNumber("whaleNormalizeMin"),
            useBetaNumber("whaleNormalizeMax"),
            useBetaNumber("whaleNormalizationExponent")
        ),
        attacker: normalize(
            applyGroupedDiminishingReturns(roleCurrent.attacker),
            applyGroupedDiminishingReturns(roleMax.attacker)
        ),
        buffer: normalize(
            applyGroupedDiminishingReturns(roleCurrent.buffer),
            applyGroupedDiminishingReturns(roleMax.buffer)
        ),
        debuffer: normalize(
            applyGroupedDiminishingReturns(roleCurrent.debuffer),
            applyGroupedDiminishingReturns(roleMax.debuffer)
        ),
        breaker: normalize(
            applyGroupedDiminishingReturns(roleCurrent.breaker),
            applyGroupedDiminishingReturns(roleMax.breaker)
        ),
        defender: normalize(
            applyGroupedDiminishingReturns(roleCurrent.defender),
            applyGroupedDiminishingReturns(roleMax.defender)
        ),
        healer: normalize(
            applyGroupedDiminishingReturns(roleCurrent.healer),
            applyGroupedDiminishingReturns(roleMax.healer)
        ),
    }
}
