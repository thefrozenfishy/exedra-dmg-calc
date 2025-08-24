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

