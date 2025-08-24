export enum KiokuElement {
    Flame = "Flame",
    Aqua = "Aqua",
    Forest = "Forest",
    Light = "Light",
    Dark = "Dark",
    Void = "Void"
}

export enum KiokuRole {
    Attacker = "Attacker",
    Buffer = "Buffer",
    Debuffer = "Debuffer",
    Healer = "Healer",
    Breaker = "Breaker",
    Defender = "Defender"
}

export const elementMap: Record<string, KiokuElement> = {
    1: KiokuElement.Flame,
    2: KiokuElement.Aqua,
    3: KiokuElement.Forest,
    4: KiokuElement.Light,
    5: KiokuElement.Dark,
    6: KiokuElement.Void,
};

export const portraits = (elem: KiokuElement) => ["A Dream of a Little Mermaid", "The Savior's Apostle", dmgUpPortraits[elem]]

const dmgUpPortraits = {
    [KiokuElement.Flame]: "A Reluctant Coach Steps Up",
    [KiokuElement.Aqua]: "Futures Felt in Photographs",
    [KiokuElement.Forest]: "Special Stage Persona",
    [KiokuElement.Light]: "High Five for Harmony",
    [KiokuElement.Dark]: "One Time Team-up!",
    [KiokuElement.Void]: "Pride on the Line",
}

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
    element: KiokuElement
    role: KiokuRole
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
    element: KiokuElement
    role: KiokuRole
    atk100: number
    minAtk: number
    atka5: number
    skill_id: number
    attack_id: number
    special_id: number
    crystalis_id: number
    support_id: number
    support_target: KiokuElement | KiokuRole
    ability_id: number
    ascension_1_effect_2_id: number
    ascension_2_effect_2_id: number
    ascension_3_effect_2_id?: number
    ascension_4_effect_2_id: number
    ascension_5_effect_2_id?: number
}

export enum AvailableCrys {
    ATK_25_PERCENT = "ATK%-25",
    CRIT_DMG = "CD-20",
    DMG_TO_WEAK_ELEMENT = "Elem-24",
    ELEMENTAL_DMG = "Dmg-20",
    FLAT_ATK = "ATK-125",
    EX = "EX"
};

export enum AvailableSubCrys {
    CRIT_DMG = "CD-10",
    FLAT_ATK = "ATK-60"
};

const heartphialAtkRewardLvls = {
    45: 20,
    39: 20,
    33: 20,
    27: 20,
    21: 20,
    15: 10,
    9: 10
}

export const KiokuConstants = {
    availableCrys: AvailableCrys,
    availableSubCrys: AvailableSubCrys,
    maxKiokuLvl: 120,
    maxMagicLvl: 130,
    maxAscension: 5,
    maxHeartphialLvl: 50,
    maxSpecialLvl: 10,
    heartphialAtkRewardLvls

}
export interface KiokuGeneratorArgs {
    name: string;
    dpsElement: KiokuElement;
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

export const correctCharacterParams = (character?: Character) => {
    if (character) {
        if (character.ascension < 3) {
            character.specialLvl = Math.min(character.specialLvl, 4)
        } else if (character.ascension < 5) {
            character.specialLvl = Math.min(character.specialLvl, 7)
        }
    }
    return character
}
