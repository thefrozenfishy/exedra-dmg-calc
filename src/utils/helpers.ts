import selectionAbilityJson from '../assets/base_data/getSelectionAbilityMstList.json';
import portraitsJson from '../assets/base_data/getCardMstList.json';
import portraitLevelsJson from '../assets/base_data/getCardLimitBreakMstList.json';
import passiveDetailsJson from '../assets/base_data/getPassiveSkillDetailMstList.json';
import skillDetailsJson from '../assets/base_data/getSkillDetailMstList.json';
import styleParamUpJson from '../assets/base_data/getStyleParamUpMstList.json';
import styleParamUpEffectJson from '../assets/base_data/getStyleParamUpEffectMstList.json';
import characterHeartParamUpGroupJson from '../assets/base_data/getCharacterHeartParamUpGroupMstList.json';
import characterHeartJson from '../assets/base_data/getCharacterHeartMstList.json';
import characterHeartLevelUpJson from '../assets/base_data/getCharacterHeartLevelUpMstList.json';
import kiokuDataJson from '../assets/base_data/kioku_data.json';
import questStageJson from '../assets/base_data/getQuestStageMstList.json';
import questEnemyAppearanceJson from '../assets/base_data/getQuestEnemyAppearanceMstList.json';
import { Portrait, CrystalisData, KiokuData, PortraitLvlData, StyleParamUpEffect, CharacterHeart, CharacterHeartParamUpGroup, ActiveSkill, PassiveSkill, StyleParamUp } from '../types/KiokuTypes';
import { elementMap, KiokuElement } from '../types/enums';

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

export const heartLevelUpExp = Object.fromEntries(
    characterHeartLevelUpJson.map((item: any) => [item.heartLevel, item.heartLevelUpExp])
) as Record<number, number>;

export const maxHeartphialExp = Object.values(heartLevelUpExp).reduce((sum, exp) => sum + exp, 0);

export const cumulativeHeartphialExp: Record<number, number> = { 0: 0 };
for (let lvl = 1; lvl <= 50; lvl++) {
    cumulativeHeartphialExp[lvl] = cumulativeHeartphialExp[lvl - 1] + (heartLevelUpExp[lvl] ?? 0);
}

export const kiokuData = kiokuDataJson as unknown as Record<string, KiokuData>;

export interface HeartExpStage {
    questStageMstId: number;
    name: string;
    exp: number;
    icon: string | null;
    weakElements: KiokuElement[]
}

export const heartExpStages: HeartExpStage[] = (questStageJson as any[])
    .filter(stage => stage.characterHeartExp > 0)
    .map(stage => {
        const enemies = (questEnemyAppearanceJson as any[]).filter(
            e => e.questStageMstId === stage.questStageMstId
        );
        const enemy = enemies.find(e => e.isMainTargetEnemy) ?? enemies[0];

        return {
            questStageMstId: stage.questStageMstId,
            name: stage.name,
            exp: stage.characterHeartExp,
            icon: enemy ? `enemy/${enemy.enemyMstId}_thumbnail.png` : null,
            weakElements: [...Array(5).keys()].map(i => enemy[`weakElement${i}`]).filter(e => e).map(e => elementMap[e])
        };
    })
    .sort((a, b) => b.exp - a.exp);

export const bestHeartExpStage: HeartExpStage | null = heartExpStages[0] ?? null;
