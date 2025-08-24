export enum EnemyTargetTypes {
    TARGET ="TARGET",
    PROXIMITY ="PROXIMITY",
    OTHER ="OTHER"
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