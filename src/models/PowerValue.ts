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

    if (ch.obtain !== "Permanent") {
        power *= 2
    }

    switch (ch.role) {
        case KiokuRole.Attacker:
            return power * 1.15
        case KiokuRole.Breaker:
            return power * 1
        case KiokuRole.Buffer:
            return power * 1.25
        case KiokuRole.Debuffer:
            return power * 1.2
        case KiokuRole.Healer:
            return power * 0.9
        default: // Defender
            return power * 0.95
    }
}

function getMaxCharacterPower(ch: Character): number {
    const maxed: Character = {
        ...ch,
        enabled: true,
        ascension: KiokuConstants.maxAscension,
    }

    return getCharacterPower(maxed)
}
function getCharacterWhalePower(ch: Character): number {
    if (!ch.enabled) return 0
    let power = 100

    power += ch.ascension * 40

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

    if (ch.obtain !== "Permanent") {
        power *= 3
    } else if (
        !ch.permaDate ||
        new Date(ch.permaDate) > new Date()
    ) {
        power *= 5
    }

    switch (ch.role) {
        case KiokuRole.Attacker:
            return power * 1
        case KiokuRole.Breaker:
            return power * 1.2
        case KiokuRole.Buffer:
            return power * 0.8
        case KiokuRole.Debuffer:
            return power * 0.85
        case KiokuRole.Healer:
            return power * 1.25
        default: // Defender
            return power * 1.2
    }
}

function getMaxCharacterWhalePower(ch: Character): number {
    const maxed: Character = {
        ...ch,
        enabled: true,
        ascension: KiokuConstants.maxAscension,
    }

    return getCharacterWhalePower(maxed)
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
        totalWhaleCurrent += getCharacterWhalePower(ch)
        totalWhaleMax += getMaxCharacterWhalePower(ch)
        const current = getCharacterPower(ch)
        const max = getMaxCharacterPower(ch)

        totalCurrent += current
        totalMax += max

        switch (ch.role) {
            case KiokuRole.Attacker:
                roleCurrent.attacker += current
                roleMax.attacker += max
                break

            case KiokuRole.Buffer:
                roleCurrent.buffer += current
                roleMax.buffer += max
                break

            case KiokuRole.Debuffer:
                roleCurrent.debuffer += current
                roleMax.debuffer += max
                break

            case KiokuRole.Breaker:
                roleCurrent.breaker += current
                roleMax.breaker += max
                break

            case KiokuRole.Defender:
                roleCurrent.defender += current
                roleMax.defender += max
                break

            case KiokuRole.Healer:
                roleCurrent.healer += current
                roleMax.healer += max
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