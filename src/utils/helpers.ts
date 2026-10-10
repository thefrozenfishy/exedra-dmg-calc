import characterHeartJson from '../assets/base_data/getCharacterHeartMstList.json';
import characterHeartLevelUpJson from '../assets/base_data/getCharacterHeartLevelUpMstList.json';
import characterHeartParamUpGroupJson from '../assets/base_data/getCharacterHeartParamUpGroupMstList.json';
import configJson from '../assets/base_data/get_config.json'
import getSkillLevelUpConditionJson from '../assets/base_data/getSkillLevelUpConditionMstList.json'
import characterJson from '../assets/base_data/getCharacterMstList.json';
import kiokuExtrasJson from '../assets/base_data/kioku_data.json';
import replaceCharacterNameJson from '../assets/base_data/getReplaceCharacterNameMstList.json';
import passiveJson from '../assets/base_data/getPassiveSkillMstList.json';
import passiveDetailsJson from '../assets/base_data/getPassiveSkillDetailMstList.json';
import portraitLevelsJson from '../assets/base_data/getCardLimitBreakMstList.json';
import portraitsJson from '../assets/base_data/getCardMstList.json';
import questEnemyAppearanceJson from '../assets/base_data/getQuestEnemyAppearanceMstList.json';
import questStageJson from '../assets/base_data/getQuestStageMstList.json';
import selectionAbilityJson from '../assets/base_data/getSelectionAbilityMstList.json';
import skillDetailsJson from '../assets/base_data/getSkillDetailMstList.json';
import styleParamUpCostJson from '../assets/base_data/getStyleParamUpCostMstList.json'
import styleParamUpEffectJson from '../assets/base_data/getStyleParamUpEffectMstList.json';
import styleParamUpJson from '../assets/base_data/getStyleParamUpMstList.json';
import styleJson from '../assets/base_data/getStyleMstList.json';
import styleLevelUpJson from '../assets/base_data/getStyleLevelUpMstList.json';
import styleLimitBreakJson from '../assets/base_data/getStyleLimitBreakMstList.json';
import styleLimitBreakEffectJson from '../assets/base_data/getStyleLimitBreakEffectMstList.json';
import userLevelUpJson from '../assets/base_data/getUserLevelUpMstList.json'
import { Portrait, CrystalisData, KiokuData, PortraitLvlData, StyleParamUpEffect, CharacterHeart, CharacterHeartParamUpGroup, ActiveSkill, PassiveSkill, StyleParamUp, PassiveBaseSkill } from '../types/KiokuTypes';
import { elementMap, KiokuElement, KiokuObtain, roleMap, type SupportKey } from '../types/enums';

const portraitLevels = Object.fromEntries(
    portraitLevelsJson.map((item: any) => [item.cardLimitBreakMstId, item])
) as Record<string, PortraitLvlData>;

export const portraits = Object.fromEntries(
    portraitsJson.map((item: any) => [item.name, {
        ...item, stats: [...Array(6).keys()].map(i => portraitLevels[item.cardMstId * 10 + i])
    }])
) as Record<string, Portrait>;

export const passiveBase = Object.fromEntries(
    passiveJson.map((item: any) => [item.passiveSkillMstId, item])
) as Record<string, PassiveBaseSkill>;

export const passiveDetails = Object.fromEntries(
    passiveDetailsJson.map((item: any) => [item.passiveSkillDetailMstId, item])
) as Record<string, PassiveSkill>;

// Indexed by passiveSkillMstId*100+lvl (the composite key ScoreAttackKioku.addEffect looks up by),
// built once here instead of re-scanning every entry on every lookup.
export const passiveDetailsByMstId = new Map<number, PassiveSkill[]>();
for (const v of Object.values(passiveDetails)) {
    const k = (v as any).passiveSkillMstId;
    (passiveDetailsByMstId.get(k) ?? passiveDetailsByMstId.set(k, []).get(k)!).push(v);
}

export const skillDetails = Object.fromEntries(
    skillDetailsJson.map((item: any) => [item.skillDetailMstId, item])
) as Record<string, ActiveSkill>;

// Indexed by skillMstId*100+lvl (the composite key ScoreAttackKioku.addEffect looks up by),
// built once here instead of re-scanning every entry on every lookup.
export const skillDetailsByMstId = new Map<number, ActiveSkill[]>();
for (const v of Object.values(skillDetails)) {
    const k = (v as any).skillMstId;
    (skillDetailsByMstId.get(k) ?? skillDetailsByMstId.set(k, []).get(k)!).push(v);
}

export const crystalises = Object.fromEntries(
    selectionAbilityJson.map((item: any) => [item.selectionAbilityMstId, item])
) as Record<string, CrystalisData>;

// Indexed by styleMstId (0 = the generic/shared crys pool, otherwise a character-specific EX crys),
// built once here instead of scanning the whole table on every getEX/relevantCrys call.
export const crystalisesByStyle: Record<number, CrystalisData[]> = {};
for (const v of Object.values(crystalises)) {
    (crystalisesByStyle[v.styleMstId] ??= []).push(v);
}

export const styleParamUpEffect = Object.fromEntries(
    styleParamUpEffectJson.map((item: any) => [item.styleParamUpEffectMstId, item])
) as Record<string, StyleParamUpEffect>;

export const styleParamUp = Object.fromEntries(
    styleParamUpJson.map((item: any) => [item.styleParamUpMstId, item])
) as Record<string, StyleParamUp>;

// Indexed by styleMstId (character id), built once here instead of scanning every character's
// magic-level entries to find one character's on every Kioku construction.
export const styleParamUpByStyleId: Record<number, StyleParamUp[]> = {};
for (const v of Object.values(styleParamUp)) {
    (styleParamUpByStyleId[v.styleMstId] ??= []).push(v);
}

interface StyleParamUpCost {
    styleParamUpCostMstId: number;
    useItemMstId1: number;
    useItemMstId2: number;
    useItemMstId3: number;
    useItemMstId4: number;
    useItemMstId5: number;
    useItemMstId6: number;
    useItemMstId7: number;
    useItemMstId8: number;
    useItemNum1: number;
    useItemNum2: number;
    useItemNum3: number;
    useItemNum4: number;
    useItemNum5: number;
    useItemNum6: number;
    useItemNum7: number;
    useItemNum8: number;
    useMoney: number;
}

const styleParamUpCost = Object.fromEntries(
    styleParamUpCostJson.map((item: any) => [item.styleParamUpCostMstId, item])
) as Record<string, StyleParamUpCost>;

export interface MagicLevelCost {
    gold: number;
    items: Record<number, number>;
}

export const magicLevelCosts: Record<string, Record<number, MagicLevelCost>> = {};
{
    const styleParamUpByStyle: Record<string, any[]> = {};
    (styleParamUpJson as any[]).forEach((item: any) => {
        (styleParamUpByStyle[item.styleMstId] ??= []).push(item);
    });

    Object.entries(styleParamUpByStyle).forEach(([styleMstId, levels]) => {
        const sortedLevels = [...levels].sort((a, b) => a.priority - b.priority);
        const perStyle: Record<number, MagicLevelCost> = { 0: { gold: 0, items: {} } };

        sortedLevels.forEach((lvl: any) => {
            const cost = styleParamUpCost[lvl.styleParamUpCostMstId];
            const prev = perStyle[lvl.priority - 1] ?? { gold: 0, items: {} };
            const items: Record<number, number> = { ...prev.items };

            for (let j = 1; j <= 8; j++) {
                items[j] = (items[j] ?? 0) + ((cost as any)?.[`useItemNum${j}`] ?? 0);
            }

            perStyle[lvl.priority] = {
                gold: prev.gold + (cost?.useMoney ?? 0),
                items,
            };
        });

        magicLevelCosts[styleMstId] = perStyle;
    });
}

export const characterHeartParamUpGroup = Object.fromEntries(
    characterHeartParamUpGroupJson.map((item: any) => [item.characterHeartParamUpGroupMstId, item])
) as Record<string, CharacterHeartParamUpGroup>;

// Indexed by paramUpGroupId, built once here instead of scanning every character's heart-level
// entries to find one character's group on every Kioku construction.
export const characterHeartParamUpGroupByGroupId: Record<number, CharacterHeartParamUpGroup[]> = {};
for (const v of Object.values(characterHeartParamUpGroup)) {
    (characterHeartParamUpGroupByGroupId[v.paramUpGroupId] ??= []).push(v);
}

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

// ---------------------------------------------------------------------------------------------------------------
// kiokuData: one entry per collectable kioku (getStyleMstList.isCollectionDisp), keyed by kioku name.
// Everything that exists in the master tables is read from them here. kioku_data.json (generated by
// ma-ex-data/wiki/generator_kioku_pages.py) only carries what the tables don't have:
//   obtain (KiokuObtain: Permanent/Exclusive/Free/Event), permaDate (from the wiki appendix) and heartphial (shared heartphial owner).
// ---------------------------------------------------------------------------------------------------------------

interface KiokuExtras {
    obtain?: KiokuObtain
    permaDate?: string
    heartphial?: string
}

const kiokuExtras = kiokuExtrasJson as unknown as Record<string, KiokuExtras>;

const styleLevelUp = Object.fromEntries(
    (styleLevelUpJson as any[]).map(item => [item.styleLevelUpMstId, item])
) as Record<number, { maxHp: number, maxAtk: number, maxDef: number }>;

const styleLimitBreak = Object.fromEntries(
    (styleLimitBreakJson as any[]).map(item => [item.styleLimitBreakMstId, item])
) as Record<number, { styleLimitBreakEffectMstId1: number, styleLimitBreakEffectMstId2: number }>;

const styleLimitBreakEffect = Object.fromEntries(
    (styleLimitBreakEffectJson as any[]).map(item => [item.styleLimitBreakEffectMstId, item])
) as Record<number, { targetType: number, value1: number }>;

const characterNames = Object.fromEntries(
    (characterJson as any[]).map(item => [item.characterMstId, item.name as string])
) as Record<number, string>;

// Ultimate Madoka, Devil Homura, ... use a different display name than their base character
const replaceCharacterNames = Object.fromEntries(
    (replaceCharacterNameJson as any[]).map(item => [item.styleMstId, item.overrideCharacterName as string])
) as Record<number, string>;

// Same rule as the wiki generator (fix_date): everything released before the global launch counts as launch day
const releaseDateOf = (releaseTime: string) =>
    Number(releaseTime.slice(0, 4)) < 2025 ? "2025-03-27" : releaseTime.slice(0, 10);

// Supports whose scaling can't be read off the rows (same hand-written text as the wiki generator)
const SUPPORT_TEXT_FIXES: Record<number, [string, string]> = {
    95042: [ // Sacred Gift
        "increases break gauge depletion (Effect increases the higher the remaining HP)",
        "increases break gauge depletion (50%-59% (1), 60%-79% (2), 80%-99% (3), 100% (4))",
    ],
};

// Support passives read "Equipped to <role/element>:<br><effect>" at their max level (id*100+10).
// Amounts the text leaves out are filled in from the rows, like the wiki generator does:
// break gauge depletion (UP_GIV_BREAK_POINT_DMG_FIXED value1) and chance of being targeted (UP_HATE value1).
function supportInfo(supportId: number): { target: SupportKey, effect: string } {
    const description = passiveBase[supportId * 100 + 10]?.description ?? "";
    const rows = passiveDetailsByMstId.get(supportId * 100 + 10) ?? [];
    const m = description.match(/^Equipped to (.*?):(.*?)$/);
    let effect = m ? m[2].trim().replace(/^<br>/, "").trim() : description;
    const fix = SUPPORT_TEXT_FIXES[supportId];
    if (fix && effect.includes(fix[0])) {
        effect = effect.replace(fix[0], fix[1]);
    } else if (/break gauge depletion/i.test(effect) && !/depletion by/i.test(effect)) {
        const breakRows = rows.filter(d => d.abilityEffectType === "UP_GIV_BREAK_POINT_DMG_FIXED");
        const amounts = new Set(breakRows.map(d => d.value1));
        if (amounts.size === 1) {
            const [amount] = amounts;
            effect = breakRows.length > 1
                ? effect.replace(/(break gauge depletion)( further)?/gi, `$1$2 (${amount})`)
                : effect.replace(/break gauge depletion(\+)?/gi, `$& (${amount})`);
        }
    }
    const hate = rows.find(d => d.abilityEffectType === "UP_HATE");
    if (hate) effect = effect.replace(/chance of being targeted/gi, `$& (${hate.value1})`);
    return { target: (m ? m[1].trim() : "") as SupportKey, effect };
}

// Max Magic stacks = value2 of the ability's CHARGE row (the ability is keyed id*100+lvl)
function maxMagicStacksOf(abilityId: number): number | undefined {
    for (let lvl = 1; lvl <= 20; lvl++) {
        const charge = passiveDetailsByMstId.get(abilityId * 100 + lvl)?.find(d => d.abilityEffectType === "CHARGE");
        if (charge) return charge.value2;
    }
    return undefined;
}

function buildKiokuData(style: any): KiokuData {
    const id: number = style.styleMstId;
    const support = supportInfo(style.subPassiveSkill);
    const extras = kiokuExtras[style.name] ?? {};
    const data: Record<string, unknown> = {
        id,
        character_en: replaceCharacterNames[id] ?? characterNames[Math.floor(id / 10_000)] ?? "",
        rarity: style.rarity,
        element: elementMap[style.element],
        role: roleMap[style.role],
        ep: style.ep,
        bp: style.bp ?? 0,
        releaseDate: releaseDateOf(style.releaseTime),
        minHp: style.hp,
        minAtk: style.atk,
        minDef: style.def,
        minSpd: style.speed,
        minCritRate: Math.floor(style.criticalRate / 10),
        minCritDmg: Math.floor(style.criticalDamageRate / 10),
        attack_id: style.normalAttack,
        skill_id: style.skill1,
        special_id: style.specialAttackMstId,
        ability_id: style.passiveSkill1,
        support_id: style.subPassiveSkill,
        support_target: support.target,
        support_effect: support.effect,
        crystalis_id: crystalisesByStyle[id]?.[0]?.value1 ?? 0,
        obtain: extras.obtain ?? KiokuObtain.Permanent,
        permaDate: extras.permaDate ?? "",
        heartphial: extras.heartphial ?? "",
    };
    const maxMagicStacks = maxMagicStacksOf(style.passiveSkill1);
    if (maxMagicStacks !== undefined) data.maxMagicStacks = maxMagicStacks;
    // Stat caps at the level breakpoints: getStyleLevelUpMstList is keyed styleMstId*1000+level
    for (const lvl of [120, 140, 160, 180, 200]) {
        const row = styleLevelUp[id * 1000 + lvl];
        data[`hp${lvl}`] = row?.maxHp;
        data[`atk${lvl}`] = row?.maxAtk;
        data[`def${lvl}`] = row?.maxDef;
    }
    // Ascension N (keyed styleMstId*100+N): effect 2 with targetType 3 is a passive; store its skillUniqueId
    // (the id*100+lvl base) like the other kit ids. targetType 1/2 are plain stat/special-cap bonuses.
    for (let i = 1; i <= 5; i++) {
        const limitBreak = styleLimitBreak[id * 100 + i];
        const effect = limitBreak && styleLimitBreakEffect[limitBreak.styleLimitBreakEffectMstId2];
        if (effect && effect.targetType !== 1 && effect.targetType !== 2) {
            const passiveId = passiveBase[effect.value1]?.skillUniqueId;
            if (passiveId) data[`ascension_${i}_effect_2_id`] = passiveId;
        }
    }
    return data as unknown as KiokuData;
}

// Sorted by name (code point order), the order kioku_data.json used to have
export const kiokuData: Record<string, KiokuData> = Object.fromEntries(
    (styleJson as any[])
        .filter(style => style.isCollectionDisp)
        .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
        .map(style => [style.name, buildKiokuData(style)])
);

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

export const kiokuLevelCosts: Record<number, { exp: number; gold: number }> = { 0: { exp: 0, gold: 0 } };
((configJson as any)?.payload?.styleConfig?.levelUpCost || []).forEach((item: any) => {
    kiokuLevelCosts[item.level] = {
        exp: kiokuLevelCosts[item.level - 1].exp + item.exp,
        gold: kiokuLevelCosts[item.level - 1].gold + item.goldPerExp,
    }
})

export const playerLevelCosts: Record<number, { exp: number }> = { 1: { exp: 0 } };
Object.values(userLevelUpJson).forEach((item: any) => {
    playerLevelCosts[item.level + 1] = {
        exp: playerLevelCosts[item.level].exp + item.levelUpExp,
    }
})

export const portraitEnchantmentCosts: Record<number, Record<number, { item1: number, item2: number, item3: number, gold: number }>> = {
    4: { 0: { item1: 0, item2: 0, item3: 0, gold: 0 } },
    5: { 0: { item1: 0, item2: 0, item3: 0, gold: 0 } },
};
export const specialUpgradeCosts: Record<number, Record<number, { item1: number, item2: number, item3: number, gold: number }>> = {
    4: { 0: { item1: 0, item2: 0, item3: 0, gold: 0 } },
    5: { 0: { item1: 0, item2: 0, item3: 0, gold: 0 } },
};
// 1 is special levels, 2 is portrait
getSkillLevelUpConditionJson.forEach((item: any) => {
    const dest = item.skillLevelUpType === 1 ? specialUpgradeCosts : portraitEnchantmentCosts;
    dest[item.rarity][item.minLevel] = {
        item1: dest[item.rarity][item.minLevel - 1].item1 + item.itemNum1,
        item2: dest[item.rarity][item.minLevel - 1].item2 + item.itemNum2,
        item3: dest[item.rarity][item.minLevel - 1].item3 + item.itemNum3,
        gold: dest[item.rarity][item.minLevel - 1].gold + item.useMoney,
    }
})
