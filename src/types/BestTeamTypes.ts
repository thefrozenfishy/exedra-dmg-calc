import { Enemy } from "./EnemyTypes";
import { Character } from "./KiokuTypes";
import { Aliment, KiokuElement, KiokuRole } from '../types/enums'

export interface TeamSlot {
    main: Character | undefined
    support?: Character | undefined
    buffMultReduction?: number
    debuffMultReduction?: number
}

export interface FindBestTeamOptions {
    enemies: Enemy[];
    include4StarAttackers: boolean;
    include4StarSupports: boolean;
    include4StarOthers: boolean;
    extraAttackers: string[];
    obligatoryKioku: string[];
    ignoredKioku: string[];
    weakElements: KiokuElement[]
    onlyConsiderOnElements: boolean
    activeAliments: Aliment[]
    deBufferCount: number
    otherCount: number
    minHealer: number
    minDefender: number
    minBreaker: number
    optimalSubCrys: boolean
    enabledCharacters: Character[]
    buffMultReduction: number
    offElementBuffMultReduction: number
    debuffMultReduction: number
    offElementDebuffMultReduction: number
    attackerHealth: number
    optimizeAverageDamage: boolean
    disabledOtherRoles: KiokuRole[]
    arenaEffectsMap: Record<string, number>
    // When true (default), each roster gets a cheap one-shot damage estimate first, and only rosters
    // within pruningMargin% of the best estimate for that attacker get the full portrait/crys/support/
    // support-of-support search. Set to false to fall back to the exhaustive search (slower, but every
    // roster gets the full treatment — useful for spot-checking pruning against the old behavior).
    enablePruning?: boolean
    // 0-100. How far behind the best pass-1 estimate (for the same attacker) a roster is still allowed
    // to be and still get the full search. Lower = faster but more willing to skip a roster that could
    // have closed the gap once fully optimized. 100 effectively disables pruning even if enablePruning
    // is true. Defaults to 15.
    pruningMargin?: number
    onProgress?: (currChars: string[], completedRuns: number, expectedTotalRuns: number, preprocessing?: boolean) => void,
    onError?: (error: any) => void
}

export type Tied<T> = T | T[]

export interface FinalTeam {
    optimized_dmg: number[]
    crit_rate: number[]
    attacker: Character
    portrait: Tied<string>
    atk_supp: Tied<Character>
    attacker_crys1: number[]
    attacker_crys2: number[]
    attacker_crys3: number[]
    supp1: Character
    supp1supp: Tied<Character> | undefined
    supp1portrait: Tied<string> | undefined
    supp2: Character
    supp2supp: Tied<Character> | undefined
    supp2portrait: Tied<string> | undefined
    supp3: Character
    supp3supp: Tied<Character> | undefined
    supp3portrait: Tied<string> | undefined
    supp4: Character
    supp4supp: Tied<Character> | undefined
    supp4portrait: Tied<string> | undefined
    alt_dmg: number[]
}
