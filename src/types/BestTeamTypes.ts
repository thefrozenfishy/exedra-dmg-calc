import { Enemy } from "./EnemyTypes";
import { Character } from "./KiokuTypes";

export interface TeamSlot {
    main: Character | undefined
    support?: Character | undefined
}

export interface FindBestTeamOptions {
    enemies: Enemy[];
    include4StarAttackers: boolean;
    include4StarSupports: boolean;
    extraAttackers: string[];
    weakElements: Element[]
    enabledCharacters: Character[]
    onProgress?: (currChars: string[], completedRuns: number, expectedTotalRuns: number) => void
}

