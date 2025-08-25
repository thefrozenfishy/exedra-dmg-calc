import { Enemy } from "./EnemyTypes";
import { Character, KiokuElement } from "./KiokuTypes";

export interface TeamSlot {
    main: Character | undefined
    support?: Character | undefined
}

export interface FindBestTeamOptions {
    enemies: Enemy[];
    include4StarAttackers: boolean;
    include4StarSupports: boolean;
    include4StarOthers: boolean;
    extraAttackers: string[];
    obligatoryKioku: string[];
    weakElements: KiokuElement[]
    prevResults: any[]
    deBufferCount: number
    otherCount: number
    minHealer: number
    minDefender: number
    minBreaker: number
    enabledCharacters: Character[]
    onProgress?: (currChars: string[], completedRuns: number, expectedTotalRuns: number) => void,
    onError?: (error: any) => void
}

export interface FinalTeam {
    dmg: number
    crit_rate: number
    attacker: Character
    portrait: string
    atk_supp: Character
    attacker_crys1: string
    attacker_crys2: string
    attacker_crys3: string
    supp1: Character
    supp1supp: Character | undefined
    supp2: Character
    supp2supp: Character | undefined
    supp3: Character
    supp3supp: Character | undefined
    supp4: Character
    supp4supp: Character | undefined
}