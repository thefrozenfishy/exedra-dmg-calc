import portraitsJson from '../assets/base_data/getCardMstList.json';
import portraitLevelsJson from '../assets/base_data/getCardLimitBreakMstList.json';
import passiveDetailsJson from '../assets/base_data/getPassiveSkillDetailMstList.json';
import skillDetailsJson from '../assets/base_data/getSkillDetailMstList.json';
import kiokuDataJson from '../assets/base_data/kioku_data.json';
import magicLevelsJson from '../assets/base_data/magic_levels.json';
import { PortraitData, SkillDetail, KiokuData, MagicLevel, PortraitLvlData } from '../types/KiokuTypes';

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
