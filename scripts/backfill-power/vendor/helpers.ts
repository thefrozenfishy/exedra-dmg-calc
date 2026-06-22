import selectionAbilityJson from './base_data/getSelectionAbilityMstList.json';
import portraitsJson from './base_data/getCardMstList.json';
import portraitLevelsJson from './base_data/getCardLimitBreakMstList.json';
import passiveDetailsJson from './base_data/getPassiveSkillDetailMstList.json';
import skillDetailsJson from './base_data/getSkillDetailMstList.json';
import styleParamUpJson from './base_data/getStyleParamUpMstList.json';
import styleParamUpEffectJson from './base_data/getStyleParamUpEffectMstList.json';
import characterHeartParamUpGroupJson from './base_data/getCharacterHeartParamUpGroupMstList.json';
import characterHeartJson from './base_data/getCharacterHeartMstList.json';
import kiokuDataJson from './base_data/kioku_data.json';
import { Portrait, CrystalisData, KiokuData, PortraitLvlData, StyleParamUpEffect, CharacterHeart, CharacterHeartParamUpGroup, ActiveSkill, PassiveSkill, StyleParamUp } from './KiokuTypes';

const portraitLevels = Object.fromEntries(
    portraitLevelsJson.map((item: any) => [item.cardLimitBreakMstId, item])
) as Record<string, PortraitLvlData>;

export const portraits = Object.fromEntries(
    portraitsJson.filter(item => item.rarity === 5).map((item: any) => [item.name, { ...item, stats: portraitLevels[item.cardMstId * 10 + 5] }])
) as Record<string, Portrait>;

export const passiveDetails = Object.fromEntries(
    passiveDetailsJson.map((item: any) => [item.passiveSkillDetailMstId, item])
) as Record<string, PassiveSkill>;

export const skillDetails = Object.fromEntries(
    skillDetailsJson.map((item: any) => [item.skillDetailMstId, item])
) as Record<string, ActiveSkill>;

export const crystalises = Object.fromEntries(
    selectionAbilityJson.map((item: any) => [item.selectionAbilityMstId, item])
) as Record<string, CrystalisData>;

export const styleParamUpEffect = Object.fromEntries(
    styleParamUpEffectJson.map((item: any) => [item.styleParamUpEffectMstId, item])
) as Record<string, StyleParamUpEffect>;

export const styleParamUp = Object.fromEntries(
    styleParamUpJson.map((item: any) => [item.styleParamUpMstId, item])
) as Record<string, StyleParamUp>;

export const characterHeartParamUpGroup = Object.fromEntries(
    characterHeartParamUpGroupJson.map((item: any) => [item.characterHeartParamUpGroupMstId, item])
) as Record<string, CharacterHeartParamUpGroup>;

export const characterHeart = Object.fromEntries(
    characterHeartJson.map((item: any) => [item.characterMstId, item])
) as Record<string, CharacterHeart>;

export const kiokuData = kiokuDataJson as unknown as Record<string, KiokuData>;
