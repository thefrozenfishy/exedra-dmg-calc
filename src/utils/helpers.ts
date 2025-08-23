import battleConditionsJson from '../assets/base_data/getBattleConditionSetMstList.json';
import portraitsJson from '../assets/base_data/getCardMstList.json';
import portraitLevelsJson from '../assets/base_data/getCardLimitBreakMstList.json';
import passiveDetailsJson from '../assets/base_data/getPassiveSkillDetailMstList.json';
import skillDetailsJson from '../assets/base_data/getSkillDetailMstList.json';
import kiokuDataJson from '../assets/base_data/kioku_data.json';
import magicLevelsJson from '../assets/base_data/magic_levels.json';

export const elementMap: Record<string, string> = {
    1: "Flame",
    2: "Aqua",
    3: "Forest",
    4: "Light",
    5: "Dark",
    6: "Void",
};


interface PortraitData {
    cardMstId: number;
    passiveSkill1: number;
}

interface PortraitLvlData {
    atk: number;
}

export interface MagicLevel {
    eff: string
    val: number
}

export type SkillDetail = Record<string, any>;

export interface KiokuData {
    id: number
    name: number
    rarity: number
    character_en: string
    element: string
    role: string
    atk100: number
    minAtk: number
    atka5: number
    skill_id: number
    attack_id: number
    special_id: number
    crystalis_id: number
    support_id: number
    support_target: string
    ability_id: number
    ascension_1_effect_2_id: number
    ascension_2_effect_2_id: number
    ascension_3_effect_2_id?: number
    ascension_4_effect_2_id: number
    ascension_5_effect_2_id?: number

}

export const battleConditions = Object.fromEntries(
    battleConditionsJson.map((item: any) => [item.battleConditionSetMstId, item])
) as Record<string, object>;

export const portraits = Object.fromEntries(
    portraitsJson.map((item: any) => [item.name, item])
) as Record<string, PortraitData>;

export const portraitLevels = Object.fromEntries(
    portraitLevelsJson.map((item: any) => [item.cardLimitBreakMstId, item])
) as Record<string, PortraitLvlData>;

export const passiveDetails = Object.fromEntries(
    passiveDetailsJson.map((item: any) => [item.passiveSkillDetailMstId, item])
) as Record<string, SkillDetail>;

export const skillDetails = Object.fromEntries(
    skillDetailsJson.map((item: any) => [item.skillDetailMstId, item])
) as Record<string, SkillDetail>;

export const kiokuData = kiokuDataJson as unknown as Record<string, KiokuData>;

export const magicData = magicLevelsJson as unknown as Record<string, MagicLevel>[];
