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

function getMaxCharacterPower(ch: Character): number {
    const maxed: Character = {
        ...ch,
        enabled: true,
        ascension: KiokuConstants.maxAscension,
    }

    return getCharacterPower(maxed)
}

function normalize(
    current: number,
    max: number
): number {
    if (max <= 0) return 0

    return Math.round(
        Math.sqrt((current / max)) * 100
    )
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
            console.log(`Value: ${value}, Decay: ${Math.pow(decay, index)}, Total Before: ${total}`)
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
        let current = getCharacterPower(ch)
        let max = getMaxCharacterPower(ch)
        const ratio = current / max

        let whaleScalar = 1
        if (ch.obtain !== "Permanent") {
            whaleScalar = 3
        } else if (!ch.permaDate || new Date(ch.permaDate) > new Date()) {
            whaleScalar *= 5
        }

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
        const scaledCurrent = ratio * scaledMax

        const whaleScaledMax = whaleScalar / (roleScaling * kiokuScaling)
        const whaleScaledCurrent = ratio * whaleScaledMax

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