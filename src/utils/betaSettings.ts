import { useBeta } from "../store/betaStore"
import { KiokuRole } from "../types/KiokuTypes";

export function useBetaNumber(
    key: keyof typeof BETA_DEFAULTS
): number {
    return Number(useBetaValue<number>(key))
}

export function useBetaValue<T>(
    key: keyof typeof BETA_DEFAULTS
): T {
    return useBeta<T>(key, BETA_DEFAULTS[key]).value

}

export function isBeta(): boolean {
    return localStorage.getItem("beta") === "true"
}

export function toggleBeta() {
    const current = isBeta();
    localStorage.setItem("beta", current ? "false" : "true");
    window.location.reload()
}

export type BetaSettingValue =
    | number
    | string
    | boolean
    | Record<string, any>
    | any[]

export type BetaSetting = {
    key: string
    label: string
    defaultValue: BetaSettingValue
}

export const BETA_SECTIONS = [
    {
        title: "Normalization",
        settings: [
            {
                key: "defaultNormalizeMin",
                label: "Default Normalize Min",
                defaultValue: 0.05,
            },
            {
                key: "defaultNormalizeMax",
                label: "Default Normalize Max",
                defaultValue: 1,
            },
            {
                key: "defaultNormalizationExponent",
                label: "Default Normalization Exponent",
                defaultValue: 0.5,
            },
            {
                key: "whaleNormalizeMin",
                label: "Whale Normalize Min",
                defaultValue: 0.2,
            },
            {
                key: "whaleNormalizeMax",
                label: "Whale Normalize Max",
                defaultValue: 0.95,
            },
            {
                key: "whaleNormalizationExponent",
                label: "Whale Normalization Exponent",
                defaultValue: 0.5,
            },
        ],
    },

    {
        title: "Diminishing Returns",
        settings: [
            {
                key: "diminishingReturnsDecay",
                label: "Diminishing Returns Decay",
                defaultValue: 0.8,
            },
        ],
    },

    {
        title: "Role Scaling",
        settings: [
            { key: "defaultScaling", label: "Default Scaling", defaultValue: 1 },

            {
                key: "roleScalings",
                label: "Role Scalings",
                defaultValue: {
                    [KiokuRole.Attacker]: 1.2,
                    [KiokuRole.Breaker]: 1,
                    [KiokuRole.Buffer]: 1.4,
                    [KiokuRole.Debuffer]: 1.3,
                    [KiokuRole.Defender]: 0.7,
                    [KiokuRole.Healer]: 0.9,
                },
            },
        ],
    },

    {
        title: "Whale Power",
        settings: [
            {
                key: "whaleBase",
                label: "Whale Base",
                defaultValue: 100,
            },
            {
                key: "whaleAscension1",
                label: "Whale Ascension 1",
                defaultValue: 20,
            },
            {
                key: "whaleAscension2",
                label: "Whale Ascension 2",
                defaultValue: 40,
            },
            {
                key: "whaleAscension3",
                label: "Whale Ascension 3",
                defaultValue: 60,
            },
            {
                key: "whaleAscension4",
                label: "Whale Ascension 4",
                defaultValue: 80,
            },
            {
                key: "whaleAscension5",
                label: "Whale Ascension 5",
                defaultValue: 100,
            },
            {
                key: "whaleMonthMs",
                label: "Whale Month Length (ms)",
                defaultValue: 1000 * 60 * 60 * 24 * 30,
            },
            {
                key: "whalePermanentDurationMonths",
                label: "Permanent Duration (months)",
                defaultValue: 12,
            },
            {
                key: "whaleReleaseDurationMonths",
                label: "Release Decay Duration (months)",
                defaultValue: 24,
            },
            {
                key: "whaleDecayFloor",
                label: "Whale Decay Floor",
                defaultValue: 0.5,
            },
            {
                key: "whaleCollabMultiplier",
                label: "Collab Whale Multiplier",
                defaultValue: 2,
            },
        ],
    },
    {
        title: "Kioku Scalings",
        settings: [
            {
                key: "kiokuScalings",
                label: "Kioku Scalings",
                defaultValue: {
                    // Attackers
                    "Falsified Phenomena": 1.4,
                    "Nothing to Despair, Ever": 1.2,
                    "Marigold Dadaism": 0.7,
                    "Kiss-shot": 0.7,

                    // Buffers
                    "Hollow Woman": 1.6,
                    "Luce della Speranza": 1.2,
                    "Pluvia☆Neujahr": 1.2,

                    // Breakers
                    "Pluvia☆Magica": 1.4,
                    "Sacred Gift": 1.15,
                    "Final Fatebloom": 1.15,
                    "Unlimited Rulebook": 1.1,
                    "Strada Futuro": 0.85,
                    "Tenebrous Arcana": 0.85,
                    "Neo Genesis": 0.7,

                    // Debuffers
                    "Yuletide Gift": 1.4,
                    "Bebe-O'-Lantern": 1.4,
                    "Ultra Great Big Hammer": 0.7,

                    // Defenders
                    "Folter Gefängnis": 0.7,
                    "Baldamente Fortissimo": 1.4,

                    // Healers
                    "Judgement Earth": 1.2,
                    "Glitterjoy Snow Globe": 1.1,
                },
            }
        ]
    },
    {
        title: "Kioku Ascension Scalings",
        settings: [
            {
                key: "kiokuAscensionScalings",
                label: "Kioku Ascension Scalings",
                defaultValue: {
                    "Tiro Finale": { "2": 50 },
                    "Dark Art Dominion": { "4": 50 },
                    "Falsified Phenomena": { "4": 50 }
                },
            }
        ]
    },
    {
        title: "Character Power",
        settings: [
            { key: "basePower", label: "Base Power", defaultValue: 100 },
            { key: "ascensionPowerPerLevel", label: "Ascension Power Per Level", defaultValue: 20 },
        ],
    },

    {
        title: "Role Ascension Matrix",
        settings: [
            {
                key: "roleAscensionBonuses",
                label: "Role Ascension Bonuses",
                defaultValue: {
                    [KiokuRole.Attacker]: {
                        "1": 0,
                        "2": 10,
                        "3": 35,
                        "4": 0,
                        "5": 55,
                    },

                    [KiokuRole.Breaker]: {
                        "1": 0,
                        "2": 10,
                        "3": 35,
                        "4": 20,
                        "5": 35,
                    },

                    [KiokuRole.Buffer]: {
                        "1": 10,
                        "2": 15,
                        "3": 5,
                        "4": 60,
                        "5": 10,
                    },

                    [KiokuRole.Debuffer]: {
                        "1": 10,
                        "2": 10,
                        "3": 10,
                        "4": 55,
                        "5": 15,
                    },

                    [KiokuRole.Defender]: {
                        "1": 0,
                        "2": 35,
                        "3": 0,
                        "4": 55,
                        "5": 10,
                    },

                    [KiokuRole.Healer]: {
                        "1": 20,
                        "2": 10,
                        "3": 5,
                        "4": 50,
                        "5": 15,
                    },
                },
            },
        ],
    }
] as const

export const BETA_DEFAULTS = Object.fromEntries(
    BETA_SECTIONS.flatMap(section =>
        section.settings.map(setting => [
            setting.key,
            setting.defaultValue
        ])
    )
) as Record<string, any>