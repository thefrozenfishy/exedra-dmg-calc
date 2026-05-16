import { useBeta } from "../store/betaStore"

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
    description?: string
}

export const BETA_SECTIONS = [
    {
        title: "Normalization",
        settings: [
            {
                key: "defaultNormalizeMin",
                label: "Default Normalize Min",
                defaultValue: 0,
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
            { key: "defaultScaling", label: "Default Scaling", defaultValue: 0.9 },

            {
                key: "roleScalings",
                label: "Role Scalings",
                defaultValue: {
                    attacker: 1.15,
                    breaker: 1,
                    buffer: 1.25,
                    debuffer: 1.2,
                    defender: 0.9,
                    healer: 0.9,
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
        description: "Multiplicative scalings for Kioku characters. These are applied after all other calculations, so they can be used to make simple buffs/nerfs to specific characters without affecting the overall balance of the system.",
        settings: [
            {
                key: "kiokuScalings",
                label: "Kioku Scalings",
                defaultValue: {
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
                },
            }
        ]
    },
    {
        title: "Character Power",
        settings: [
            { key: "basePower", label: "Base Power", defaultValue: 100 },
            { key: "ascensionPowerPerLevel", label: "Ascension Power Per Level", defaultValue: 40 },
        ],
    },

    {
        title: "Role Ascension Matrix",
        settings: [
            {
                key: "roleAscensionBonuses",
                label: "Role Ascension Bonuses",
                defaultValue: {
                    attacker: {
                        1: 0,
                        2: 0,
                        3: 25,
                        4: 0,
                        5: 55,
                    },

                    breaker: {
                        1: 0,
                        2: 0,
                        3: 30,
                        4: 10,
                        5: 30,
                    },

                    buffer: {
                        1: 0,
                        2: 0,
                        3: 0,
                        4: 80,
                        5: 0,
                    },

                    debuffer: {
                        1: 0,
                        2: 0,
                        3: 0,
                        4: 60,
                        5: 0,
                    },

                    defender: {
                        1: 0,
                        2: 0,
                        3: 0,
                        4: 25,
                        5: 0,
                    },

                    healer: {
                        1: 0,
                        2: 0,
                        3: 0,
                        4: 30,
                        5: 0,
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