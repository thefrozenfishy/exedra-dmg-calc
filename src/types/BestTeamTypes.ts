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
    onProgress?: (currChars: string[], completedRuns: number, expectedTotalRuns: number) => void,
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