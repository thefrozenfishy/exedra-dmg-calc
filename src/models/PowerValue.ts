import { KiokuConstants, KiokuElement, KiokuRole, type Character } from "../types/KiokuTypes"

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

const UNIQUE_KIOKU_SCALING: Record<string, number> = {
    // Defenders
    "Folter Gefängnis": 0.75,
    "Baldamente Fortissimo": 1.5,

    // Healers
    "Glitterjoy Snow Globe": 1.15,
    "Judgement Earth": 1.25,

    // Buffers
    "Hollow Woman": 2,
    "Pluvia☆Neujahr": 1.25,

    // Breakers
    "Pluvia☆Magica": 1.25,
    "Sacred Gift": 1.15,
    "Final Fatebloom": 1.15,
    "Unlimited Rulebook": 1.1,
    "Neo Genesis": 0.75,

    // Debuffers
    "Ultra Great Big Hammer": 0.75,
    "Bebe-O'-Lantern": 1.25,
    "Yuletide Gift": 1.25,

    // Attackers
    "Falsified Phenomena": 1.5,
    "Nothing to Despair, Ever": 1.2,
    "Marigold Dadaism": 0.75,
    "Kiss-shot": 0.75,
}

const COLLAB = new Set([
    "Unlimited Rulebook",
    "Screw Zone",
    "Kiss-shot",
])

function getWhaleMultiplier(ch: Character): number {
    // Collabs don't decay and are always limited
    if (COLLAB.has(ch.name)) {
        return 2
    }
    console.log(ch.name, ch.permaDate, ch.releaseDate)

    const permanentDate = new Date(ch.permaDate)
    const releaseDate = new Date(ch.releaseDate)
    const msPerMonth = 1000 * 60 * 60 * 24 * 30

    if (ch.permaDate) {
        if (permanentDate > new Date()) {
            return 2
        }

        const monthsSincePermanent = (new Date().getTime() - permanentDate.getTime()) / msPerMonth
        if (monthsSincePermanent >= 12) {
            return 0.5
        }

        const progress = monthsSincePermanent / 12

        return 2 - progress * 1.5
    }

    const monthsSince = (new Date().getTime() - releaseDate.getTime()) / msPerMonth
    if (monthsSince >= 24) {
        return 1
    }

    const progress = monthsSince / 24

    return 2 - progress
}

function getCharacterPower(ch: Character): number {
    if (!ch.enabled) return 0
    let power = 100

    power += ch.ascension * 40

    if (ch.ascension >= 2) power += 20
    switch (ch.role) {
        case KiokuRole.Breaker:
            if (ch.ascension >= 3) power += 30
            if (ch.ascension >= 4) power += 10
            if (ch.ascension >= 5) power += 30
            break
        case KiokuRole.Attacker:
            if (ch.ascension >= 3) power += 25
            if (ch.ascension >= 5) power += 55
            break;
        case KiokuRole.Buffer:
            if (ch.ascension >= 4) power += 80
            break
        case KiokuRole.Debuffer:
            if (ch.ascension >= 4) power += 60
            break
        case KiokuRole.Defender:
            if (ch.ascension >= 4) power += 25
            break
        case KiokuRole.Healer:
            if (ch.ascension >= 4) power += 30
            break
    }
    return power
}

function getCharacterWhalePower(ch: Character): number {
    if (!ch.enabled) return 0

    let whale = 100

    if (ch.ascension >= 1) whale += 20
    if (ch.ascension >= 2) whale += 40
    if (ch.ascension >= 3) whale += 60
    if (ch.ascension >= 4) whale += 80
    if (ch.ascension >= 5) whale += 100

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

function normalize(
    current: number,
    max: number
): number {
    if (max <= 0) return 0

    return Math.round(((current / max)) * 100)
}

function applyGroupedDiminishingReturns(
    items: WeightedEntry[],
    getValue: (item: WeightedEntry) => number = (x => x.value),
    getGroup: (item: WeightedEntry) => string = (x => `${x.role}_${x.element}`),
    decay = 0.8
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

export function getPowerScores(
    chars: Character[]
): PowerScores {
    const fiveStars = chars.filter(ch => ch.rarity === 5 && ch.name !== "Lux☆Magica")

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
        const pwrRatio = getCharacterPower(ch) / getMaxPower(ch, getCharacterPower)
        const whaleRatio = getCharacterWhalePower(ch) / getMaxPower(ch, getCharacterWhalePower)

        let roleScaling: number
        switch (ch.role) {
            case KiokuRole.Attacker:
                roleScaling = 1.15
                break
            case KiokuRole.Breaker:
                roleScaling = 1
                break
            case KiokuRole.Buffer:
                roleScaling = 1.25
                break
            case KiokuRole.Debuffer:
                roleScaling = 1.2
                break
            case KiokuRole.Healer:
            case KiokuRole.Defender:
            default:
                roleScaling = 0.9
                break
        }

        const data = { role: ch.role, element: ch.element }

        const kiokuScaling = UNIQUE_KIOKU_SCALING[ch.name] ?? 1

        const scaledMax = roleScaling * kiokuScaling
        const scaledCurrent = pwrRatio * scaledMax

        const whaleScaledMax = getWhaleMultiplier(ch) / (roleScaling * kiokuScaling)
        const whaleScaledCurrent = whaleRatio * whaleScaledMax

        totalCurrent.push({ ...data, value: scaledCurrent })
        totalMax.push({ ...data, value: scaledMax })
        totalWhaleCurrent.push({ ...data, value: whaleScaledCurrent })
        totalWhaleMax.push({ ...data, value: whaleScaledMax })

        switch (ch.role) {
            case KiokuRole.Attacker:
                roleCurrent.attacker.push({ ...data, value: scaledCurrent })
                roleMax.attacker.push({ ...data, value: scaledMax })
                break
            case KiokuRole.Buffer:
                roleCurrent.buffer.push({ ...data, value: scaledCurrent })
                roleMax.buffer.push({ ...data, value: scaledMax })
                break
            case KiokuRole.Debuffer:
                roleCurrent.debuffer.push({ ...data, value: scaledCurrent })
                roleMax.debuffer.push({ ...data, value: scaledMax })
                break
            case KiokuRole.Breaker:
                roleCurrent.breaker.push({ ...data, value: scaledCurrent })
                roleMax.breaker.push({ ...data, value: scaledMax })
                break
            case KiokuRole.Defender:
                roleCurrent.defender.push({ ...data, value: scaledCurrent })
                roleMax.defender.push({ ...data, value: scaledMax })
                break
            case KiokuRole.Healer:
                roleCurrent.healer.push({ ...data, value: scaledCurrent })
                roleMax.healer.push({ ...data, value: scaledMax })
                break
        }
    }

    return {
        total: normalize(
            applyGroupedDiminishingReturns(totalCurrent),
            applyGroupedDiminishingReturns(totalMax)
        ),
        whale: normalize(
            applyGroupedDiminishingReturns(totalWhaleCurrent),
            applyGroupedDiminishingReturns(totalWhaleMax)
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