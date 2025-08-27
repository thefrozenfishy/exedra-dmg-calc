export enum EnemyTargetTypes {
    L_OTHER,
    L_PROXIMITY,
    TARGET,
    R_PROXIMITY,
    R_OTHER,
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