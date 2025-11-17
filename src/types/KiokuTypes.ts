import { PvPTeam, KiokuState } from "../models/PvPTeam";
import { crystalises, kiokuData, portraits } from "../utils/helpers";


export enum BasicIds {
    CRYS = 11,
    SUPPORT = 22,
    ASCENSION = 33,
    PORTRAIT = 44,
}

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
        if (a.name === "Faith We'll Meet Again Someday") return -1
        if (b.name === "Faith We'll Meet Again Someday") return 1
        if (elem && a.name === dmgUpPortraits[elem]) return -1
        if (elem && b.name === dmgUpPortraits[elem]) return 1
        if (a.name === "") return -1
        if (b.name === "") return 1

        return a.name.localeCompare(b.name)
    })
    .map(p => p.name)

export const portraitsBestOnly = (elem: KiokuElement) => [
    "A Dream of a Little Mermaid", "The Savior's Apostle", "Faith We'll Meet Again Someday"
]

const dmgUpPortraits = {
    [KiokuElement.Flame]: "A Reluctant Coach Steps Up",
    [KiokuElement.Aqua]: "Futures Felt in Photographs",
    [KiokuElement.Forest]: "Special Stage Persona",
    [KiokuElement.Light]: "High Five for Harmony",
    [KiokuElement.Dark]: "One Time Team-up!",
    [KiokuElement.Void]: "Pride on the Line",
}

export interface Portrait {
    cardMstId: number;
    passiveSkill1: number;
    element: number;
    rarity: number;
    name: string;
    resourceName: string;
    stats: PortraitLvlData
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

export interface PassiveSkill {
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

export interface ActiveSkill {
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
export const skillDetailId = (d: SkillDetail) => "skillDetailMstId" in d ? d.skillDetailMstId : d.passiveSkillDetailMstId
export type SkillKey = "skillMstId" | "passiveSkillMstId";

export interface Character {
    id: number
    name: string
    character_en: string
    enabled: boolean
    ascension: number
    element: KiokuElement
    supportTarget: SupportKey
    supportDescription: string
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

export interface TeamSnapshotList {
    sp: number
    team: TeamSnapshot[]
}

export interface TeamSnapshot {
    spd: number
    atk: number
    baseSpd: number
    magicStacks: number
    maxMagicStacks: number
    secondsLeft: number
    distanceLeft: number
    id: number
    breakCurrent: number
    maxBreakGauge: number
    mp: number
    maxMp: number
    name: string
}

export interface BattleSnapshot {
    allies: TeamSnapshotList
    enemies: TeamSnapshotList
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
    crystalis_effect: string
    support_id: number
    support_target: SupportKey
    support_effect: string
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

export interface StyleParamUp {
    styleParamUpMstId: number
    styleMstId: number
    styleParamUpTreeMstId: number
    priority: number
    styleParamUpEffectMstId: number
}

export interface StyleParamUpEffect {
    abilityEffectType: string
    name: string
    styleParamUpEffectMstId: number
    targetType: number
    value1: number
    value2: number
}

export interface CharacterHeart {
    characterHeartMstId: number
    characterMstId: number
    objectRewardGroupId: number
    paramUpGroupId: number
}

export interface CharacterHeartParamUpGroup {
    characterHeartParamUpGroupMstId: number
    heartLevel: number
    paramUpGroupId: number
    styleParamUpEffectMstId: number
}

export const getPersonalCrystalisEffects = (styleId: number): string[] =>
    Object.values(kiokuData).find(k => k.id === styleId)?.crystalis_effect?.split("<br>") ?? []


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
        if (a.name === "Increases SPD by 4.") return -1
        if (b.name === "Increases SPD by 4.") return 1
        if (a.name === "") return -1
        if (b.name === "") return 1

        return a.name.localeCompare(b.name, undefined, { numeric: true })
    })
    .map(c => c.name)



export const KiokuConstants = {
    maxKiokuLvl: 120,
    maxMagicLvl: 130,
    maxAscension: 5,
    maxHeartphialLvl: 50,
    maxSpecialLvl: 10,
    optimal_attacker_crys_sub: Array(3).fill(["Increases critical rate by 5%.", "Increases critical DMG by 10%.", "Increases ATK by 60."]).flat()
}



export interface KiokuArgs {
    name: string;
    kiokuLvl: number;
    magicLvl: number;
    heartphialLvl: number;
    portrait?: string;
    supportKey?: any[];
    crys: string[];
    crys_sub: string[]
    ascension: number;
    specialLvl: number;
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

export const maxMeters = 10_000

export const aggro = {
    [KiokuRole.Defender]: 15,
    [KiokuRole.Buffer]: 10,
    [KiokuRole.Debuffer]: 10,
    [KiokuRole.Healer]: 10,
    [KiokuRole.Attacker]: 5,
    [KiokuRole.Breaker]: 5,
}

export enum TargetType {
    specialId = "SpecialAttack",
    skillId = "ActiveSkill",
    attackId = "NormalAttack",
    fuaId = "AdditionalSkill",
}

export const TargetTypeLookup = {
    [TargetType.specialId]: "special_id",
    [TargetType.skillId]: "skill_id",
    [TargetType.attackId]: "attack_id",
}

export const targetTypeToLvl = {
    [TargetType.specialId]: "specialLvl",
    [TargetType.skillId]: "skillLvl",
    [TargetType.attackId]: "attackLvl",
}

export enum targetRange {
    SELF = -1,
    TARGET = 1,
    PROXIMITY = 2,
    ALL = 3,
}

export const defaultbreak = {
    [TargetType.specialId]: { [targetRange.TARGET]: 35, [targetRange.PROXIMITY]: 30, [targetRange.ALL]: 25 },
    [TargetType.skillId]: { [targetRange.TARGET]: 20, [targetRange.PROXIMITY]: 15, [targetRange.ALL]: 12 },
    [TargetType.attackId]: { [targetRange.TARGET]: 10 },
    [TargetType.fuaId]: { [targetRange.TARGET]: 0 }, // TODO: Check
}

export const mpGainFromAction = {
    [TargetType.specialId]: 5,
    [TargetType.skillId]: 30,
    [TargetType.attackId]: 15,
}

export interface BattleState {
    actorTeam: PvPTeam,
    enemyTeam: PvPTeam,
    actor: KiokuState,
    target: KiokuState,
    actionType?: TargetType
}