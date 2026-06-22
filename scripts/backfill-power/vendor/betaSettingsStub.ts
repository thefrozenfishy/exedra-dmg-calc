// Plain defaults, no Pinia, no per-user overrides — this is what
// prepare.ps1 rewrites PowerValue.ts's betaSettings import to point at.
//
// Copied from src/utils/betaSettings.ts's BETA_DEFAULTS at the time this
// script was written. If you tune the formula later and want to re-run
// the backfill, update the values below to match before running.

import { KiokuRole } from "./KiokuTypes"

export const BETA_DEFAULTS: Record<string, any> = {
    defaultNormalizeMin: 0.05,
    defaultNormalizeMax: 1,
    defaultNormalizationExponent: 0.5,
    whaleNormalizeMin: 0,
    whaleNormalizeMax: 1,
    whaleSkewNormA: 20,
    whaleSkewNormLoc: 0.1,
    whaleSkewNormScale: 0.3,

    diminishingReturnsDecay: 0.8,

    defaultScaling: 1,
    roleScalings: {
        [KiokuRole.Attacker]: 1.2,
        [KiokuRole.Breaker]: 1,
        [KiokuRole.Buffer]: 1.4,
        [KiokuRole.Debuffer]: 1.3,
        [KiokuRole.Defender]: 0.7,
        [KiokuRole.Healer]: 0.9,
    },

    whaleBase: 100,
    whaleAscension1: 110,
    whaleAscension2: 130,
    whaleAscension3: 160,
    whaleAscension4: 200,
    whaleAscension5: 250,
    whalePermanentMultiplier: 2,
    whalePermanentDecayFloor: 0.5,
    whalePermanentDurationMonths: 12,
    whaleLimitedMultiplier: 2,
    whaleLimitedDecayFloor: 1,
    whaleLimitedDurationMonths: 48,
    whaleCollabMultiplier: 2,
    whaleMetaMultiplier: 1,

    kiokuScalings: {
        "Falsified Phenomena": 1.4,
        "Nothing to Despair, Ever": 1.2,
        "Marigold Dadaism": 0.7,
        "Kiss-shot": 0.7,

        "Hollow Woman": 1.6,
        "Luce della Speranza": 1.2,
        "Pluvia☆Neujahr": 1.2,

        "Pluvia☆Magica": 1.4,
        "Sacred Gift": 1.15,
        "Final Fatebloom": 1.15,
        "Unlimited Rulebook": 1.1,
        "Strada Futuro": 0.85,
        "Tenebrous Arcana": 0.85,
        "Neo Genesis": 0.7,

        "Yuletide Gift": 1.4,
        "Bebe-O'-Lantern": 1.4,
        "Ultra Great Big Hammer": 0.7,

        "Folter Gefängnis": 0.7,
        "Baldamente Fortissimo": 1.4,

        "Judgement Earth": 1.2,
        "Glitterjoy Snow Globe": 1.1,
    },

    kiokuAscensionScalings: {
        "Tiro Finale": { "2": 50 },
        "Dark Art Dominion": { "4": 50 },
        "Falsified Phenomena": { "4": 50 },
    },

    basePower: 100,
    ascensionPowerPerLevel: 20,

    roleAscensionBonuses: {
        [KiokuRole.Attacker]: { "1": 0, "2": 10, "3": 35, "4": 0, "5": 55 },
        [KiokuRole.Breaker]: { "1": 0, "2": 10, "3": 35, "4": 20, "5": 35 },
        [KiokuRole.Buffer]: { "1": 10, "2": 15, "3": 5, "4": 60, "5": 10 },
        [KiokuRole.Debuffer]: { "1": 10, "2": 10, "3": 10, "4": 55, "5": 15 },
        [KiokuRole.Defender]: { "1": 0, "2": 35, "3": 0, "4": 55, "5": 10 },
        [KiokuRole.Healer]: { "1": 20, "2": 10, "3": 5, "4": 50, "5": 15 },
    },
}

export function useBetaNumber(key: keyof typeof BETA_DEFAULTS): number {
    return Number(BETA_DEFAULTS[key])
}

export function useBetaValue<T>(key: keyof typeof BETA_DEFAULTS): T {
    return BETA_DEFAULTS[key] as T
}
