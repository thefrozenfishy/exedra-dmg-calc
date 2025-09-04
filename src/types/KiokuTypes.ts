import { crystalises, portraits } from "../utils/helpers";

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
export type SupportKey = KiokuRole | KiokuElement


export const elementMap: Record<string, KiokuElement> = {
    1: KiokuElement.Flame,
    2: KiokuElement.Aqua,
    3: KiokuElement.Forest,
    4: KiokuElement.Light,
    5: KiokuElement.Dark,
    6: KiokuElement.Void,
};

export const getPortraits = (elem?: KiokuElement): string[] => [
    { name: "" },
    ...Object.values(portraits)]
    .sort((a, b) => {
        if (a.name === "A Dream of a Little Mermaid") return -1
        if (b.name === "A Dream of a Little Mermaid") return 1
        if (a.name === "The Savior's Apostle") return -1
        if (b.name === "The Savior's Apostle") return 1
        if (elem && a.name === dmgUpPortraits[elem]) return -1
        if (elem && b.name === dmgUpPortraits[elem]) return 1
        if (a.name === "") return -1
        if (b.name === "") return 1

        return a.name.localeCompare(b.name)
    })
    .map(p => p.name)

export const portraitsBestOnly = (elem: KiokuElement) => ["A Dream of a Little Mermaid", "The Savior's Apostle"]

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
    element: number;
    rarity: number;
    name: string;
    resourceName: string;
}

export interface PortraitLvlData {
    atk: number;
    def: number;
    hp: number;
}

export interface MagicLevel {
    eff: string
    val: number
}

interface PassiveSkill {
    abilityEffectType: string
    activeConditionSetIdCsv: string
    description: string
    descriptionType: number
    element: number
    passiveSkillDetailMstId: number
    passiveSkillMstId: number
    range: number
    remainCount: number
    role: number
    startConditionSetIdCsv: string
    startTimingIdCsv: string
    turn: number
    value1: number
    value2: number
    value3: number
}

interface ActiveSkill {
    abilityEffectType: string
    activeConditionSetIdCsv: string
    description: string
    descriptionType: number
    element: number
    probability: number
    range: number
    remainCount: number
    role: number
    skillDetailMstId: number
    skillMstId: number
    startConditionSetIdCsv: string
    turn: number
    value1: number
    value2: number
    value3: number
    value4: number
}

export type SkillDetail = PassiveSkill | ActiveSkill;

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
    crys_sub: string[]
}

export interface PvPCharacter extends Character {
    av: number
    spd: number
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
    def100: number
    minDef: number
    defa5: number
    hp100: number
    minHp: number
    hpa5: number
    ep: number
    minSpd: number
    minCritDmg: number
    minCritRate: number
    skill_id: number
    attack_id: number
    special_id: number
    crystalis_id: number
    support_id: number
    support_target: KiokuElement | KiokuRole
    ability_id: number
    maxMagicStacks?: number
    ascension_1_effect_2_id: number
    ascension_2_effect_2_id: number
    ascension_3_effect_2_id?: number
    ascension_4_effect_2_id: number
    ascension_5_effect_2_id?: number
}

export interface CrystalisData {
    name: string
    rarity: number
    value1: number
    styleMstId: number
    selectionAbilityType: number
}

export const getCrystalises = (elem?: KiokuElement) => [
    { name: "EX", "styleMstId": 0, selectionAbilityType: 1 },
    { name: "", "styleMstId": 0, selectionAbilityType: 1 },
    ...Object.values(crystalises)
].filter(c => c.styleMstId === 0)
    .filter(c => c.selectionAbilityType === 1)
    .sort((a, b) => {
        if (a.name === "EX") return -1
        if (b.name === "EX") return 1
        if (a.name === "Dominant Blow++") return -1
        if (b.name === "Dominant Blow++") return 1
        if (a.name === "Mighty Hit++") return -1
        if (b.name === "Mighty Hit++") return 1
        if (a.name === "Towering Offense++") return -1
        if (b.name === "Towering Offense++") return 1
        if (elem && a.name === elementalCrystalises[elem]) return -1
        if (elem && b.name === elementalCrystalises[elem]) return 1
        if (a.name === "") return -1
        if (b.name === "") return 1

        return a.name.localeCompare(b.name)
    })
    .map(c => c.name)


export const getBestCrystalises = (elem: KiokuElement) => [
    "EX",
    "Dominant Blow++",
    "Mighty Hit++",
    "Towering Offense++",
    elementalCrystalises[elem]

]
const elementalCrystalises = {
    [KiokuElement.Flame]: "Inferno++",
    [KiokuElement.Aqua]: "Torrent++",
    [KiokuElement.Forest]: "Verdure++",
    [KiokuElement.Light]: "Radiance++",
    [KiokuElement.Dark]: "Chaos++",
    [KiokuElement.Void]: "Nullity++",
}

export const getSubCrystalises = () => [
    { name: "", selectionAbilityType: 2 },
    ...Object.values(crystalises)]
    .filter(c => c.selectionAbilityType === 2)
    .sort((a, b) => {
        if (a.name === "Increases ATK by 60.") return -1
        if (b.name === "Increases ATK by 60.") return 1
        if (a.name === "Increases critical DMG by 10%.") return -1
        if (b.name === "Increases critical DMG by 10%.") return 1
        if (a.name === "Increases critical rate by 5%.") return -1
        if (b.name === "Increases critical rate by 5%.") return 1
        if (a.name === "") return -1
        if (b.name === "") return 1

        return a.name.localeCompare(b.name, undefined, { numeric: true })
    })
    .map(c => c.name)


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
    maxKiokuLvl: 120,
    maxMagicLvl: 130,
    maxAscension: 5,
    maxHeartphialLvl: 50,
    maxSpecialLvl: 10,
    heartphialAtkRewardLvls

}
export interface KiokuGeneratorArgs {
    name: string;
    kiokuLvl?: number;
    magicLvl?: number;
    heartphialLvl?: number;
    portrait?: string;
    supportKey?: any[];
    crys?: string[];
    crys_sub?: string[]
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
