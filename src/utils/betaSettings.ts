import { useBeta } from "../store/betaStore"

export function useBetaNumber(
    key: keyof typeof BETA_DEFAULTS
): number {
    return Number(
        useBeta(key, BETA_DEFAULTS[key]).value
    )
}

export type BetaSetting = {
    key: string
    label: string
    defaultValue: number
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
                defaultValue: 2,
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
                defaultValue: 2,
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
            {
                key: "attackerScaling",
                label: "Attacker Scaling",
                defaultValue: 1.15,
            },
            {
                key: "breakerScaling",
                label: "Breaker Scaling",
                defaultValue: 1,
            },
            {
                key: "bufferScaling",
                label: "Buffer Scaling",
                defaultValue: 1.25,
            },
            {
                key: "debufferScaling",
                label: "Debuffer Scaling",
                defaultValue: 1.2,
            },
            {
                key: "defaultScaling",
                label: "Default Scaling",
                defaultValue: 0.9,
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
        ],
    },
] as const

export const BETA_DEFAULTS = Object.fromEntries(
    BETA_SECTIONS.flatMap(section =>
        section.settings.map(setting => [
            setting.key,
            setting.defaultValue
        ])
    )
) as Record<string, number>