import { KiokuConstants, KiokuRole, type Character } from "../types/KiokuTypes"

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
    "Folter Gefängnis": 0.5,
    "Baldamente Fortissimo": 2,

    // Healers
    "Glitterjoy Snow Globe": 1.15,
    "Judgement Earth": 1.25,

    // Buffers
    "Hollow Woman": 2,
    "Pluvia☆Neujahr": 1.7,
    "Luce della Speranza": 1.50,
    "Tiro Finale": 1.30,

    // Breakers
    "Pluvia☆Magica": 1.25,

    // Debuffers
    "Ultra Great Big Hammer": 0.70,

    // Attackers
    "Falsified Phenomena": 2.00,
    "Nothing to Despair, Ever": 1.30,
    "Marigold Dadaism": 0.50,
}

function getCharacterPower(ch: Character): number {
    if (!ch.enabled) return 0
    let power = 100

    power += ch.ascension * 40

    if (ch.ascension >= 2) power += 20
    switch (ch.role) {
        case KiokuRole.Breaker:
            if (ch.ascension >= 4) power += 10
        case KiokuRole.Attacker:
            if (ch.ascension >= 3) power += 40
            if (ch.ascension >= 5) power += 40
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

export function getPowerScores(
    chars: Character[]
): PowerScores {
    const fiveStars = chars.filter(ch => ch.rarity === 5 && ch.name !== "Lux☆Magica")

    const roleCurrent = {
        attacker: 0,
        buffer: 0,
        debuffer: 0,
        breaker: 0,
        defender: 0,
        healer: 0,
    }

    const roleMax = {
        attacker: 0,
        buffer: 0,
        debuffer: 0,
        breaker: 0,
        defender: 0,
        healer: 0,
    }

    let totalCurrent = 0
    let totalMax = 0
    let totalWhaleCurrent = 0
    let totalWhaleMax = 0

    for (const ch of fiveStars) {
        let current = getCharacterPower(ch)
        let max = getMaxCharacterPower(ch)

        const pwrLimScaling = ch.obtain !== "Permanent" ? 2 : 1
        let whaleLimScaling = 1
        if (ch.obtain !== "Permanent") {
            whaleLimScaling = 3
        } else if (!ch.permaDate || new Date(ch.permaDate) > new Date()) {
            whaleLimScaling *= 5
        }

        let roleScaling
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
                roleScaling = 0.9
                break
            case KiokuRole.Defender:
            default:
                roleScaling = 0.9
                break
        }


        const kiokuScaling = UNIQUE_KIOKU_SCALING[ch.name] ?? 1
        const currentScaled = (current / max) * kiokuScaling
        const maxScaled = kiokuScaling

        const pwrScalings = roleScaling * pwrLimScaling
        const whaleScaling = 1 / roleScaling

        totalCurrent += currentScaled * pwrScalings
        totalMax += maxScaled * pwrScalings
        totalWhaleCurrent += currentScaled * whaleScaling * whaleLimScaling
        totalWhaleMax += maxScaled * whaleScaling * whaleLimScaling

        roleCurrent.attacker += currentScaled
        roleMax.attacker += kiokuScaling


        switch (ch.role) {
            case KiokuRole.Attacker:
                roleCurrent.attacker += currentScaled
                roleMax.attacker += kiokuScaling
                break

            case KiokuRole.Buffer:
                roleCurrent.buffer += currentScaled
                roleMax.buffer += kiokuScaling
                break

            case KiokuRole.Debuffer:
                roleCurrent.debuffer += currentScaled
                roleMax.debuffer += kiokuScaling
                break

            case KiokuRole.Breaker:
                roleCurrent.breaker += currentScaled
                roleMax.breaker += kiokuScaling
                break

            case KiokuRole.Defender:
                roleCurrent.defender += currentScaled
                roleMax.defender += kiokuScaling
                break

            case KiokuRole.Healer:
                roleCurrent.healer += currentScaled
                roleMax.healer += kiokuScaling
                break
        }
    }

    return {
        total: normalize(
            totalCurrent,
            totalMax
        ),

        attacker: normalize(
            roleCurrent.attacker,
            roleMax.attacker
        ),

        buffer: normalize(
            roleCurrent.buffer,
            roleMax.buffer
        ),

        debuffer: normalize(
            roleCurrent.debuffer,
            roleMax.debuffer
        ),

        breaker: normalize(
            roleCurrent.breaker,
            roleMax.breaker
        ),

        defender: normalize(
            roleCurrent.defender,
            roleMax.defender
        ),

        healer: normalize(
            roleCurrent.healer,
            roleMax.healer
        ),

        whale: normalize(
            totalWhaleCurrent,
            totalWhaleMax,
        )
    }
}