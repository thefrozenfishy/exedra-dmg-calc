import { useBeta } from "../store/betaStore"
import { KiokuRole } from "../types/enums";

export type WishlistEntry = {
    name: string
    ascension: number
    exceptions?: WishlistException
    ifHave?: WishlistException
}

export type WishlistException = {
    mode?: "and" | "or"
    conditions: WishlistEntry[]
}

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
                defaultValue: 0,
            },
            {
                key: "whaleNormalizeMax",
                label: "Whale Normalize Max",
                defaultValue: 1,
            },
            {
                key: "whaleSkewNormA",
                label: "Whale Skew Normalization Skewness (should be > 0)",
                defaultValue: 20,
            },
            {
                key: "whaleSkewNormLoc",
                label: "Whale Skew Normalization Location (how soon the curve starts increasing after giving 0)",
                defaultValue: 0.1,
            },
            {
                key: "whaleSkewNormScale",
                label: "Whale Skew Normalization Scale (how fast the curve increases, higher means faster)",
                defaultValue: 0.3,
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
                defaultValue: 110,
            },
            {
                key: "whaleAscension2",
                label: "Whale Ascension 2",
                defaultValue: 130,
            },
            {
                key: "whaleAscension3",
                label: "Whale Ascension 3",
                defaultValue: 160,
            },
            {
                key: "whaleAscension4",
                label: "Whale Ascension 4",
                defaultValue: 200,
            },
            {
                key: "whaleAscension5",
                label: "Whale Ascension 5",
                defaultValue: 250,
            },
            {
                key: "whalePermanentMultiplier",
                label: "Permanent Multiplier",
                defaultValue: 2,
            },
            {
                key: "whalePermanentDecayFloor",
                label: "Whale Decay Permanent Floor",
                defaultValue: 0.5,
            },
            {
                key: "whalePermanentDurationMonths",
                label: "Permanent Duration (months)",
                defaultValue: 12,
            },
            {
                key: "whaleLimitedMultiplier",
                label: "Limited Multiplier",
                defaultValue: 2,
            },
            {
                key: "whaleLimitedDecayFloor",
                label: "Whale Decay Limited Floor",
                defaultValue: 1,
            },
            {
                key: "whaleLimitedDurationMonths",
                label: "Limited Duration (months)",
                defaultValue: 48,
            },
            {
                key: "whaleCollabMultiplier",
                label: "Collab Whale Multiplier",
                defaultValue: 2,
            },
            {
                key: "whaleMetaMultiplier",
                label: "How strong meta multiplier is working on scale [0, 1]",
                defaultValue: 1,
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
                    "Kiss-shot": 0.5,
                    "Marigold Dadaism": 0.5,
                    "Nothing to Despair, Ever": 1.2,

                    // Buffers
                    "Buon Natale Grazioso": 1.1,
                    "Hollow Woman": 1.5,
                    "Luce della Speranza": 1.25,
                    "Pluvia☆Neujahr": 1.25,
                    "Scorchin' Summer Spike": 1.4,

                    // Breakers
                    "Crimson Confectioner": 1.1,
                    "Doppel of Invitations": 0.9,
                    "Final Fatebloom": 1.25,
                    "Groundhog Daze": 0.9,
                    "Neo Genesis": 0.5,
                    "Pluvia☆Magica": 1.5,
                    "Sacred Gift": 1.25,
                    "Strada Futuro": 0.9,
                    "Tenebrous Arcana": 0.5,
                    "Unlimited Rulebook": 1.1,

                    // Debuffers
                    "Bebe-O'-Lantern": 1.5,
                    "Splashin' Kyubey Blast": 1.5,
                    "Ultra Great Big Hammer": 0.75,
                    "Yuletide Gift": 1.5,

                    // Defenders
                    "Baldamente Fortissimo": 1.5,
                    "Folter Gefängnis": 0.75,

                    // Healers
                    "Glitterjoy Snow Globe": 1.15,
                    "Judgement Earth": 1.3,
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
                    "Falsified Phenomena": { "4": 225 }
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
                        "3": 30,
                        "4": 5,
                        "5": 55,
                    },

                    [KiokuRole.Breaker]: {
                        "1": 0,
                        "2": 10,
                        "3": 30,
                        "4": 20,
                        "5": 40,
                    },

                    [KiokuRole.Buffer]: {
                        "1": 10,
                        "2": 10,
                        "3": 10,
                        "4": 55,
                        "5": 15,
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
                        "2": 30,
                        "3": 0,
                        "4": 60,
                        "5": 10,
                    },

                    [KiokuRole.Healer]: {
                        "1": 20,
                        "2": 15,
                        "3": 5,
                        "4": 50,
                        "5": 10
                    },
                },
            },
        ],
    },
    {
        title: "Wishlist",
        settings: [
            {
                key: "wishlistPriority",
                label: "Wishlist Priority — ordered list; only the first unmet entry per kioku counts. Standard 5★ only.",
                defaultValue: [
                    // Philosophy Attackers just recommend A5 for those that's actually used, such an account boost.
                    // For debuffer and buffer A4 is enough, except if they are used as pseudo attackers or have great ult scaling (Ren)
                    // Supports A0 are super strong so recommend early to give options

                    // Gamebreaking Ascensions
                    { name: "Time Stop Strike", ascension: 0 },
                    { name: "Hollow Woman", ascension: 0 },
                    { name: "Luce della Speranza", ascension: 0 },
                    { name: "Tiro Finale", ascension: 2 },
                    { name: "Hollow Woman", ascension: 4, },
                    { name: "Time Stop Strike", ascension: 4, },
                    { name: "Pluvia☆Magica", ascension: 4, },
                    { name: "Soul Salvation", ascension: 4, },
                    { name: "Luce della Speranza", ascension: 4, },
                    { name: "Nine Phases", ascension: 4, },
                    { name: "Tiro Finale", ascension: 4, },
                    { name: "Tiro Finale", ascension: 5, }, // Extra MP% gives important breakpoints

                    // Great supports 
                    { name: "Flame Waltz", ascension: 0 },
                    { name: "Désintégration", ascension: 0 },
                    {
                        name: "L'Ombre", ascension: 0,
                        exceptions: {
                            mode: "or",
                            conditions: [
                                { name: "Scorchin' Summer Spike", ascension: 0 },
                                { name: "Buon Natale Grazioso", ascension: 0 },
                            ]
                        },
                    },

                    // Really strong Ascensions, much used characters so A4->A5 is not bad
                    {
                        name: "A Tale of Cherry Blossoms", ascension: 5,
                        exceptions: {
                            conditions: [
                                { name: "Evoluzione Presente", ascension: 5, },
                            ],
                        },
                    },
                    { name: "Absolute Rain", ascension: 5, },
                    { name: "Baldamente Fortissimo", ascension: 4, },
                    { name: "Thunderous Waltz", ascension: 4, },
                    {
                        name: "Cherry Ballad", ascension: 4,
                        ifHave: {
                            mode: "or",
                            conditions: [
                                { name: "Oracle Ray", ascension: 5, },
                                { name: "La Porte du Paradis", ascension: 3 },
                                { name: "Nothing to Despair, Ever", ascension: 3 },
                            ],
                        },
                        exceptions: {
                            conditions: [
                                { name: "Vinctio☆Magica", ascension: 0, },
                            ],
                        }
                    },
                    {
                        name: "Cherry Ballad", ascension: 4,
                        ifHave: {
                            mode: "or",
                            conditions: [
                                { name: "Concentrated Missile Fire", ascension: 5, },
                                { name: "Tiro Finale Liberation", ascension: 5, },
                                { name: "Falsified Phenomena", ascension: 3, },
                            ],
                        },
                        exceptions: {
                            mode: "or",
                            conditions: [
                                { name: "Splashin' Kyubey Blast", ascension: 0, },
                                { name: "Thoughtless", ascension: 4, },
                            ],
                        }
                    },
                    {
                        name: "Atomo Arrabbiato", ascension: 4,
                        ifHave: {
                            conditions: [
                                { name: "Floral Ironspike", ascension: 3 },
                            ],
                        },
                    },
                    {
                        name: "Assault Paranoia", ascension: 4,
                        exceptions: {
                            conditions: [
                                { name: "Final Fatebloom", ascension: 4 },
                            ],
                        },
                    },
                    { name: "Judgement Earth", ascension: 4, },
                    {
                        name: "Flame Waltz", ascension: 4,
                        exceptions: {
                            conditions: [
                                { name: "Pluvia☆Neujahr", ascension: 4, },
                            ],
                        },

                    },
                    {
                        name: "Oracle Ray", ascension: 5,
                        exceptions: {
                            conditions: [
                                { name: "La Porte du Paradis", ascension: 5, },
                            ],
                        },
                    },
                    { name: "Doppel of Silence", ascension: 4, },

                    // Good supports
                    { name: "La Lumière", ascension: 0 },
                    { name: "Tiro Finale Liberation", ascension: 0, },
                    { name: "A Tale of Cherry Blossoms", ascension: 0 },
                    { name: "Oracle Ray", ascension: 0 },
                    { name: "Ultra Great Big Hammer", ascension: 0 },
                    { name: "Cherry Blizzard", ascension: 0 },

                    // Pretty strong
                    {
                        name: "Thoughtless", ascension: 4,
                        exceptions: {
                            mode: "and",
                            conditions: [
                                { name: "Falsified Phenomena", ascension: 4, },
                                { name: "Splashin' Kyubey Blast", ascension: 4, },
                            ],
                        },
                    },
                    { name: "L'Ombre", ascension: 4, },
                    { name: "Light of Reckoning", ascension: 5, },
                    {
                        name: "La Danse Macabre", ascension: 4,
                        ifHave: {
                            mode: "or",
                            conditions: [
                                { name: "Soul Salvation", ascension: 5, },
                                { name: "Light of Reckoning", ascension: 5, },
                                { name: "Dark Art Dominion", ascension: 5, },
                            ],
                        },
                    },
                    {
                        name: "Luminous Tenet", ascension: 5,
                        exceptions: {
                            mode: "or",
                            conditions: [
                                { name: "Falsified Phenomena", ascension: 4, },
                                { name: "Bebe-O'-Lantern", ascension: 4, },
                            ],
                        },
                    },
                    { name: "Désintégration", ascension: 4, },
                    { name: "Flame Waltz", ascension: 4, },

                    // Niche uses
                    { name: "My Gigantic Heart", ascension: 4, },
                    { name: "My Creations", ascension: 4, },
                    { name: "Kugatachi", ascension: 5, },
                    { name: "Magic Cake Dish", ascension: 4, },
                    {
                        name: "Tiro Finale Liberation", ascension: 5,
                        exceptions: {
                            conditions: [
                                { name: "Falsified Phenomena", ascension: 4, },
                            ],
                        },
                    },
                    { name: "The Universe's Edge", ascension: 5, },
                    {
                        name: "Cherry Blizzard", ascension: 5,
                        exceptions: {
                            conditions: [
                                { name: "Final Fatebloom", ascension: 4, },
                            ],
                        },
                    },
                    { name: "Cherry Ballad", ascension: 4, },
                    { name: "Atomo Arrabbiato", ascension: 4, },
                    { name: "La Danse Macabre", ascension: 4, },

                    // Feli, Sana etc not on the list, never the right call to wishlist them
                ] as WishlistEntry[],
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
) as Record<string, any>
