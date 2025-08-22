import battleConditionsJson from './base_data/getBattleConditionSetMstList.json';
import portraitsJson from './base_data/getCardMstList.json';
import portraitLevelsJson from './base_data/getCardLimitBreakMstList.json';
import passiveDetailsJson from './base_data/getPassiveSkillDetailMstList.json';
import skillDetailsJson from './base_data/getSkillDetailMstList.json';
import kiokuDataJson from './base_data/kioku_data.json';

export const elementMap: Record<number, string> = {
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

export type SkillDetail = Record<string, any>;

export interface KiokuData {
    support_id: number;
    support_target: string;
    element: string;
    role: string;
    rarity: number;
    atk100: number;
    minAtk: number;
    maxAtk: number;
    ascension_1_effect_2_id: number;
    ascension_2_effect_2_id: number;
    ascension_3_effect_2_id: number | null;
    ascension_4_effect_2_id: number;
    ascension_5_effect_2_id: number | null;
    skill_id: number;
    attack_id: number;
    ability_id: number;
    special_id: number;
    crystalis_id: number;
}

export const battleConditions = Object.fromEntries(
    battleConditionsJson.map((item: any) => [item.battleConditionSetMstId, item])
) as Record<number, object>;

export const portraits = Object.fromEntries(
    portraitsJson.map((item: any) => [item.name, item])
) as Record<string, PortraitData>;

export const portraitLevels = Object.fromEntries(
    portraitLevelsJson.map((item: any) => [item.cardLimitBreakMstId, item])
) as Record<number, PortraitLvlData>;

export const passiveDetails = Object.fromEntries(
    passiveDetailsJson.map((item: any) => [item.passiveSkillDetailMstId, item])
) as Record<number, SkillDetail>;

export const skillDetails = Object.fromEntries(
    skillDetailsJson.map((item: any) => [item.skillDetailMstId, item])
) as Record<number, SkillDetail>;

export const kiokuData = kiokuDataJson as unknown as Record<string, KiokuData>;
