export enum Element {
    Flame = "Flame",
    Aqua = "Aqua",
    Forest = "Forest",
    Light = "Light",
    Dark = "Dark",
    Void = "Void"
}
export enum Role {
    Attacker = "Attacker",
    Buffer = "Buffer",
    Debuffer = "Debuffer",
    Healer = "Healer",
    Breaker = "Breaker",
    Defender = "Defender"
}

export const elementMap: Record<string, Element> = {
    1: Element.Flame,
    2: Element.Aqua,
    3: Element.Forest,
    4: Element.Light,
    5: Element.Dark,
    6: Element.Void,
};


export interface PortraitData {
    cardMstId: number;
    passiveSkill1: number;
}

export interface PortraitLvlData {
    atk: number;
}

export interface MagicLevel {
    eff: string
    val: number
}

export type SkillDetail = Record<string, any>;

export interface Character {
    id: number
    name: string
    character_en: string
    enabled: boolean
    ascension: number
    element: Element
    role: Role
    rarity: number
    portrait: string
    kiokuLvl: number
    magicLvl: number
    heartphialLvl: number
    specialLvl: number
    crys: string[]
}

export interface KiokuData {
    id: number
    name: number
    rarity: number
    character_en: string
    element: Element
    role: Role
    atk100: number
    minAtk: number
    atka5: number
    skill_id: number
    attack_id: number
    special_id: number
    crystalis_id: number
    support_id: number
    support_target: Element | Role
    ability_id: number
    ascension_1_effect_2_id: number
    ascension_2_effect_2_id: number
    ascension_3_effect_2_id?: number
    ascension_4_effect_2_id: number
    ascension_5_effect_2_id?: number
}

const availableCrys = {
    ATK_25_PERCENT: "ATK%-25",
    CRIT_DMG: "CD-20",
    DMG_TO_WEAK_ELEMENT: "Elem-24",
    ELEMENTAL_DMG: "Dmg-20",
    FLAT_ATK: "ATK-125",
    EX: "EX"
};
const availableSubCrys = {
    CRIT_DMG: "CD-10",
    FLAT_ATK: "ATK-60"
};


export const KiokuConstants = {
    availableCrys,
    availableSubCrys,
    maxKiokuLvl: 120,
    maxMagicLvl: 130,
    maxAscension: 5,
    maxHeartphialLvl: 50,
    maxSpecialLvl: 10,
    heartphialAtkRewardLvls: { 45: 20, 39: 20, 33: 20, 27: 20, 21: 20, 15: 10, 9: 10 } as Record<string, number>,

}
export interface KiokuGeneratorArgs {
    name: string;
    dpsElement: Element;
    kiokuLvl?: number;
    magicLvl?: number;
    heartphialLvl?: number;
    portrait?: string;
    supportKey?: any[];
    isDps?: boolean;
    crys?: string[];
    ascension?: number;
    specialLvl?: number;
}