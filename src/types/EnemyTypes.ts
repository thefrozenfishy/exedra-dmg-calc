export enum EnemyTargetTypes {
    TARGET,
    PROXIMITY,
    OTHER
}

export interface Enemy {
    name: string
    maxBreak: number
    defense: number
    defenseUp: number
    hitsToKill: number
    enabled: boolean
    isBreak: boolean
    isWeak: boolean
    isCrit: boolean
}