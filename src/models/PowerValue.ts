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

function getCharacterPower(ch: Character): number {
    if (!ch.enabled) return 0
    let power = 100

    power += ch.ascension * 40

    switch (ch.role) {
        case KiokuRole.Attacker:
        case KiokuRole.Breaker:
            if (ch.ascension >= 3) power += 40
            if (ch.ascension >= 4) power += 10
            if (ch.ascension >= 5) power += 40
            break;
        case KiokuRole.Buffer:
        case KiokuRole.Debuffer:
        case KiokuRole.Defender:
        case KiokuRole.Healer:
        default:
    }

    if ([KiokuRole.Attacker, KiokuRole.Breaker].includes(ch.role)) {
        if (ch.ascension >= 3) {
            power += 40
        }
        if (ch.ascension == 5) {
            power += 40
        }
    } else {
        if (ch.ascension >= 4) {
            power += 40
            if (ch.role === KiokuRole.Buffer) power += 40
        }
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
            case KiokuRole.Breaker:
                roleScaling = 1
            case KiokuRole.Buffer:
                roleScaling = 1.25
            case KiokuRole.Debuffer:
                roleScaling = 1.2
            case KiokuRole.Healer:
                roleScaling = 0.9
            case KiokuRole.Defender:
            default: // Defender
                roleScaling = 0.95
        }

        const whaleScaling = 1 / roleScaling
        const currentScaled = current / max

        totalCurrent += currentScaled * roleScaling * pwrLimScaling
        totalMax += roleScaling * pwrLimScaling
        totalWhaleCurrent += currentScaled * whaleScaling * whaleLimScaling
        totalWhaleMax += whaleScaling * whaleLimScaling

        switch (ch.role) {
            case KiokuRole.Attacker:
                roleCurrent.attacker += currentScaled
                roleMax.attacker += 1
                break

            case KiokuRole.Buffer:
                roleCurrent.buffer += currentScaled
                roleMax.buffer += 1
                break

            case KiokuRole.Debuffer:
                roleCurrent.debuffer += currentScaled
                roleMax.debuffer += 1
                break

            case KiokuRole.Breaker:
                roleCurrent.breaker += currentScaled
                roleMax.breaker += 1
                break

            case KiokuRole.Defender:
                roleCurrent.defender += currentScaled
                roleMax.defender += 1
                break

            case KiokuRole.Healer:
                roleCurrent.healer += currentScaled
                roleMax.healer += 1
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