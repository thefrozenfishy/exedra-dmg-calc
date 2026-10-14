import { Debug } from "../ReDriveBattleCore/Debugging/Debug";
// App side of the master-data boundary: binds every IBattleMstReader the battle core reads to a repository over the
// server master lists in src/assets/base_data (the game client does the same with its ResourceMstRepository).
// Generated table (scripts/engine/gen_records.py writes src/engine/records.json); call bindMasterData() once.

import type { int } from "../runtime";
import { BattleMstReaderContainer } from "../ReDriveBattleCore/Reader/BattleMstReaderContainer";
import { BattleMstModelRepositoryBase, DetailMstModelRepository } from "../ReDrive/Model/BattleMstModelRepositoryBase";
import abilityEffectTypeMstModelJson from "../../assets/base_data/getAbilityEffectTypeMstList.json";
import { AbilityEffectTypeMstModel } from "../ReDriveBattleCore/Model/AbilityEffectTypeMstModel";
import type { AbilityEffectTypeMstRecord } from "../Network/Definition/Skill/AbilityEffectTypeMstRecord";
import battleConditionMstModelJson from "../../assets/base_data/getBattleConditionMstList.json";
import { BattleConditionMstModel } from "../ReDriveBattleCore/Model/BattleConditionMstModel";
import type { BattleConditionMstRecord } from "../Network/Definition/QuestBattle/BattleConditionMstRecord";
import battleConditionSetMstModelJson from "../../assets/base_data/getBattleConditionSetMstList.json";
import { BattleConditionSetMstModel } from "../ReDriveBattleCore/Model/BattleConditionSetMstModel";
import type { BattleConditionSetMstRecord } from "../Network/Definition/QuestBattle/BattleConditionSetMstRecord";
import breakMstModelJson from "../../assets/base_data/getBreakMstList.json";
import { BreakMstModel } from "../ReDriveBattleCore/Model/BreakMstModel";
import type { BreakMstRecord } from "../Network/Definition/QuestOutGame/BreakMstRecord";
import calculationPointPolicyMstModelJson from "../../assets/base_data/getCalculationPointPolicyMstList.json";
import { CalculationPointPolicyMstModel } from "../ReDriveBattleCore/Model/CalculationPointPolicyMstModel";
import type { CalculationPointPolicyMstRecord } from "../Network/Definition/CalcPoint/CalculationPointPolicyMstRecord";
import enemyConditionSetsAndActionMstModelJson from "../../assets/base_data/getEnemyConditionSetsAndActionMstList.json";
import { EnemyConditionSetsAndActionMstModel } from "../ReDriveBattleCore/Model/EnemyConditionSetsAndActionMstModel";
import type { EnemyConditionSetsAndActionMstRecord } from "../Network/Definition/QuestBattle/EnemyConditionSetsAndActionMstRecord";
import enemyMstModelJson from "../../assets/base_data/getEnemyMstList.json";
import { EnemyMstModel } from "../ReDriveBattleCore/Model/EnemyMstModel";
import type { EnemyMstRecord } from "../Network/Definition/QuestOutGame/EnemyMstRecord";
import passiveSkillDetailMstModelJson from "../../assets/base_data/getPassiveSkillDetailMstList.json";
import { PassiveSkillDetailMstModel } from "../ReDriveBattleCore/Model/PassiveSkillDetailMstModel";
import type { PassiveSkillDetailMstRecord } from "../Network/Definition/Skill/PassiveSkillDetailMstRecord";
import passiveSkillMstModelJson from "../../assets/base_data/getPassiveSkillMstList.json";
import { PassiveSkillMstModel } from "../ReDriveBattleCore/Model/PassiveSkillMstModel";
import type { PassiveSkillMstRecord } from "../Network/Definition/Skill/PassiveSkillMstRecord";
import questEnemyAppearanceMstModelJson from "../../assets/base_data/getQuestEnemyAppearanceMstList.json";
import { QuestEnemyAppearanceMstModel } from "../ReDriveBattleCore/Model/QuestEnemyAppearanceMstModel";
import type { QuestEnemyAppearanceMstRecord } from "../Network/Definition/QuestOutGame/QuestEnemyAppearanceMstRecord";
import questEnemyModeChangeMstModelJson from "../../assets/base_data/getQuestEnemyModeChangeMstList.json";
import { QuestEnemyModeChangeMstModel } from "../ReDriveBattleCore/Model/QuestEnemyModeChangeMstModel";
import type { QuestEnemyModeChangeMstRecord } from "../Network/Definition/QuestOutGame/QuestEnemyModeChangeMstRecord";
import questEnemySkillSetMstModelJson from "../../assets/base_data/getQuestEnemySkillSetMstList.json";
import { QuestEnemySkillSetMstModel } from "../ReDriveBattleCore/Model/QuestEnemySkillSetMstModel";
import type { QuestEnemySkillSetMstRecord } from "../Network/Definition/QuestOutGame/QuestEnemySkillSetMstRecord";
import questEnemyWaveMstModelJson from "../../assets/base_data/getQuestEnemyWaveMstList.json";
import { QuestEnemyWaveMstModel } from "../ReDriveBattleCore/Model/QuestEnemyWaveMstModel";
import type { QuestEnemyWaveMstRecord } from "../Network/Definition/QuestOutGame/QuestEnemyWaveMstRecord";
import questStageMstModelJson from "../../assets/base_data/getQuestStageMstList.json";
import { QuestStageMstModel } from "../ReDriveBattleCore/Model/QuestStageMstModel";
import type { QuestStageMstRecord } from "../Network/Definition/QuestOutGame/QuestStageMstRecord";
import skillDetailMstModelJson from "../../assets/base_data/getSkillDetailMstList.json";
import { SkillDetailMstModel } from "../ReDriveBattleCore/Model/SkillDetailMstModel";
import type { SkillDetailMstRecord } from "../Network/Definition/Skill/SkillDetailMstRecord";
import skillMstModelJson from "../../assets/base_data/getSkillMstList.json";
import { SkillMstModel } from "../ReDriveBattleCore/Model/SkillMstModel";
import type { SkillMstRecord } from "../Network/Definition/Skill/SkillMstRecord";
import soloRaidPartyBuffMstModelJson from "../../assets/base_data/getSoloRaidPartyBuffMstList.json";
import { SoloRaidPartyBuffMstModel } from "../ReDriveBattleCore/Model/SoloRaidPartyBuffMstModel";
import type { SoloRaidPartyBuffMstRecord } from "../Network/Definition/SoloRaid/SoloRaidPartyBuffMstRecord";
import soloRaidSeasonBuffMstModelJson from "../../assets/base_data/getSoloRaidSeasonBuffMstList.json";
import { SoloRaidSeasonBuffMstModel } from "../ReDriveBattleCore/Model/SoloRaidSeasonBuffMstModel";
import type { SoloRaidSeasonBuffMstRecord } from "../Network/Definition/SoloRaid/SoloRaidSeasonBuffMstRecord";
import styleMstModelJson from "../../assets/base_data/getStyleMstList.json";
import { StyleMstModel } from "../ReDriveBattleCore/Model/StyleMstModel";
import type { StyleMstRecord } from "../Network/Definition/Style/StyleMstRecord";
import uniqueStateLevelMstModelJson from "../../assets/base_data/getUniqueStateLevelMstList.json";
import { UniqueStateLevelMstModel } from "../ReDriveBattleCore/Model/UniqueStateLevelMstModel";
import type { UniqueStateLevelMstRecord } from "../Network/Definition/Skill/UniqueStateLevelMstRecord";
import uniqueStatePatternMstModelJson from "../../assets/base_data/getUniqueStatePatternMstList.json";
import { UniqueStatePatternMstModel } from "../ReDriveBattleCore/Model/UniqueStatePatternMstModel";
import type { UniqueStatePatternMstRecord } from "../Network/Definition/Skill/UniqueStatePatternMstRecord";

let bound = false;
/** Bind the readers (idempotent). */
/** Messages the battle core logged through ReDriveBattleCore.Debugging.Debug (kept for inspection). */
export const engineLog: [string, string][] = [];
export function bindMasterData(): void {
    if (bound) return;
    bound = true;
    // The game client sets the ReDriveBattleCore log delegates at startup; some battle code invokes them directly.
    Debug.onLog = (message: string) => { engineLog.push(["log", message]); };
    Debug.onLogWarning = (message: string) => { engineLog.push(["warning", message]); };
    Debug.onLogError = (message: string) => { engineLog.push(["error", message]); };
    BattleMstReaderContainer.Bind(AbilityEffectTypeMstModel, new BattleMstModelRepositoryBase<AbilityEffectTypeMstModel, AbilityEffectTypeMstRecord, int>(
        abilityEffectTypeMstModelJson as unknown as AbilityEffectTypeMstRecord[], r => r.abilityEffectTypeMstId, r => new AbilityEffectTypeMstModel().ctor$AbilityEffectTypeMstRecord(r)));
    BattleMstReaderContainer.Bind(BattleConditionMstModel, new BattleMstModelRepositoryBase<BattleConditionMstModel, BattleConditionMstRecord, int>(
        battleConditionMstModelJson as unknown as BattleConditionMstRecord[], r => r.battleConditionMstId, r => new BattleConditionMstModel().ctor$BattleConditionMstRecord(r)));
    BattleMstReaderContainer.Bind(BattleConditionSetMstModel, new BattleMstModelRepositoryBase<BattleConditionSetMstModel, BattleConditionSetMstRecord, int>(
        battleConditionSetMstModelJson as unknown as BattleConditionSetMstRecord[], r => r.battleConditionSetMstId, r => new BattleConditionSetMstModel().ctor$BattleConditionSetMstRecord(r)));
    BattleMstReaderContainer.Bind(BreakMstModel, new BattleMstModelRepositoryBase<BreakMstModel, BreakMstRecord, int>(
        breakMstModelJson as unknown as BreakMstRecord[], r => r.breakMstId, r => new BreakMstModel().ctor$BreakMstRecord(r)));
    BattleMstReaderContainer.Bind(CalculationPointPolicyMstModel, new BattleMstModelRepositoryBase<CalculationPointPolicyMstModel, CalculationPointPolicyMstRecord, int>(
        calculationPointPolicyMstModelJson as unknown as CalculationPointPolicyMstRecord[], r => r.calculationPointPolicyMstId, r => new CalculationPointPolicyMstModel().ctor$CalculationPointPolicyMstRecord(r)));
    BattleMstReaderContainer.Bind(EnemyConditionSetsAndActionMstModel, new BattleMstModelRepositoryBase<EnemyConditionSetsAndActionMstModel, EnemyConditionSetsAndActionMstRecord, int>(
        enemyConditionSetsAndActionMstModelJson as unknown as EnemyConditionSetsAndActionMstRecord[], r => r.enemyConditionSetsAndActionMstId, r => new EnemyConditionSetsAndActionMstModel().ctor$EnemyConditionSetsAndActionMstRecord(r)));
    BattleMstReaderContainer.Bind(EnemyMstModel, new BattleMstModelRepositoryBase<EnemyMstModel, EnemyMstRecord, int>(
        enemyMstModelJson as unknown as EnemyMstRecord[], r => r.enemyMstId, r => new EnemyMstModel().ctor$EnemyMstRecord(r)));
    BattleMstReaderContainer.Bind(PassiveSkillDetailMstModel, new DetailMstModelRepository<PassiveSkillDetailMstModel, PassiveSkillDetailMstRecord>(
        passiveSkillDetailMstModelJson as unknown as PassiveSkillDetailMstRecord[], r => r.passiveSkillDetailMstId, r => new PassiveSkillDetailMstModel().ctor$PassiveSkillDetailMstRecord(r), r => r.passiveSkillMstId));
    BattleMstReaderContainer.Bind(PassiveSkillMstModel, new BattleMstModelRepositoryBase<PassiveSkillMstModel, PassiveSkillMstRecord, int>(
        passiveSkillMstModelJson as unknown as PassiveSkillMstRecord[], r => r.passiveSkillMstId, r => new PassiveSkillMstModel().ctor$PassiveSkillMstRecord(r)));
    BattleMstReaderContainer.Bind(QuestEnemyAppearanceMstModel, new BattleMstModelRepositoryBase<QuestEnemyAppearanceMstModel, QuestEnemyAppearanceMstRecord, int>(
        questEnemyAppearanceMstModelJson as unknown as QuestEnemyAppearanceMstRecord[], r => r.questEnemyAppearanceMstId, r => new QuestEnemyAppearanceMstModel().ctor$QuestEnemyAppearanceMstRecord(r)));
    BattleMstReaderContainer.Bind(QuestEnemyModeChangeMstModel, new BattleMstModelRepositoryBase<QuestEnemyModeChangeMstModel, QuestEnemyModeChangeMstRecord, int>(
        questEnemyModeChangeMstModelJson as unknown as QuestEnemyModeChangeMstRecord[], r => r.questEnemyModeChangeMstId, r => new QuestEnemyModeChangeMstModel().ctor$QuestEnemyModeChangeMstRecord(r)));
    BattleMstReaderContainer.Bind(QuestEnemySkillSetMstModel, new BattleMstModelRepositoryBase<QuestEnemySkillSetMstModel, QuestEnemySkillSetMstRecord, int>(
        questEnemySkillSetMstModelJson as unknown as QuestEnemySkillSetMstRecord[], r => r.questEnemySkillSetMstId, r => new QuestEnemySkillSetMstModel().ctor$QuestEnemySkillSetMstRecord(r)));
    BattleMstReaderContainer.Bind(QuestEnemyWaveMstModel, new BattleMstModelRepositoryBase<QuestEnemyWaveMstModel, QuestEnemyWaveMstRecord, int>(
        questEnemyWaveMstModelJson as unknown as QuestEnemyWaveMstRecord[], r => r.questEnemyWaveMstId, r => new QuestEnemyWaveMstModel().ctor$QuestEnemyWaveMstRecord(r)));
    BattleMstReaderContainer.Bind(QuestStageMstModel, new BattleMstModelRepositoryBase<QuestStageMstModel, QuestStageMstRecord, int>(
        questStageMstModelJson as unknown as QuestStageMstRecord[], r => r.questStageMstId, r => new QuestStageMstModel().ctor$QuestStageMstRecord(r)));
    BattleMstReaderContainer.Bind(SkillDetailMstModel, new DetailMstModelRepository<SkillDetailMstModel, SkillDetailMstRecord>(
        skillDetailMstModelJson as unknown as SkillDetailMstRecord[], r => r.skillDetailMstId, r => new SkillDetailMstModel().ctor$SkillDetailMstRecord(r), r => r.skillMstId));
    BattleMstReaderContainer.Bind(SkillMstModel, new BattleMstModelRepositoryBase<SkillMstModel, SkillMstRecord, int>(
        skillMstModelJson as unknown as SkillMstRecord[], r => r.skillMstId, r => new SkillMstModel().ctor$SkillMstRecord(r)));
    BattleMstReaderContainer.Bind(SoloRaidPartyBuffMstModel, new BattleMstModelRepositoryBase<SoloRaidPartyBuffMstModel, SoloRaidPartyBuffMstRecord, int>(
        soloRaidPartyBuffMstModelJson as unknown as SoloRaidPartyBuffMstRecord[], r => r.soloRaidPartyBuffMstId, r => new SoloRaidPartyBuffMstModel().ctor$SoloRaidPartyBuffMstRecord(r)));
    BattleMstReaderContainer.Bind(SoloRaidSeasonBuffMstModel, new BattleMstModelRepositoryBase<SoloRaidSeasonBuffMstModel, SoloRaidSeasonBuffMstRecord, int>(
        soloRaidSeasonBuffMstModelJson as unknown as SoloRaidSeasonBuffMstRecord[], r => r.soloRaidSeasonBuffMstId, r => new SoloRaidSeasonBuffMstModel().ctor$SoloRaidSeasonBuffMstRecord(r)));
    BattleMstReaderContainer.Bind(StyleMstModel, new BattleMstModelRepositoryBase<StyleMstModel, StyleMstRecord, int>(
        styleMstModelJson as unknown as StyleMstRecord[], r => r.styleMstId, r => new StyleMstModel().ctor$StyleMstRecord(r)));
    BattleMstReaderContainer.Bind(UniqueStateLevelMstModel, new BattleMstModelRepositoryBase<UniqueStateLevelMstModel, UniqueStateLevelMstRecord, int>(
        uniqueStateLevelMstModelJson as unknown as UniqueStateLevelMstRecord[], r => r.uniqueStateLevelMstId, r => new UniqueStateLevelMstModel().ctor$UniqueStateLevelMstRecord(r)));
    BattleMstReaderContainer.Bind(UniqueStatePatternMstModel, new BattleMstModelRepositoryBase<UniqueStatePatternMstModel, UniqueStatePatternMstRecord, int>(
        uniqueStatePatternMstModelJson as unknown as UniqueStatePatternMstRecord[], r => r.uniqueStatePatternMstId, r => new UniqueStatePatternMstModel().ctor$UniqueStatePatternMstRecord(r)));
}

/** App side: adds made-up master records (e.g. the Kioku Grid bench's dummy stage) to the bound reader of `model`. */
export function addMasterRecords(model: any, records: readonly any[]): void {
    bindMasterData();
    (BattleMstReaderContainer.GetReader(model) as unknown as BattleMstModelRepositoryBase<any, any, any>).AddRecords(records);
}
