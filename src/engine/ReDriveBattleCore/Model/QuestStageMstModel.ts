// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import type { ElementType } from "../../Network/Definition/Battle/ElementType";
import type { JudgeResultType } from "../JudgeResultType";
import { MstModelBase } from "./MstModelBase";

// ---- ReDriveBattleCore.Model.QuestStageMstModel  (TypeDefIndex 893, public class) ----
export class QuestStageMstModel extends MstModelBase<any /* QuestStageMstRecord */> {
    /** 0x18 private ElementType[] recommendationElements */
    recommendationElements: ElementType[] = null!;
    get Record(): any /* QuestStageMstRecord */ { return this.get_Record(); }
    get QuestStageMstId(): int { return this.get_QuestStageMstId(); }
    get QuestGroupMstId(): int { return this.get_QuestGroupMstId(); }
    get StageName(): string { return this.get_StageName(); }
    get UseStamina(): int { return this.get_UseStamina(); }
    get PrevQuestStageMstId(): int { return this.get_PrevQuestStageMstId(); }
    get ConditionGroupId(): int { return this.get_ConditionGroupId(); }
    get QuestMissionGroupId(): int { return this.get_QuestMissionGroupId(); }
    get Difficulty(): any { return this.get_Difficulty(); }
    get StagePrefabName(): string { return this.get_StagePrefabName(); }
    get BgmCueSheetName(): string { return this.get_BgmCueSheetName(); }
    get BgmCueName(): string { return this.get_BgmCueName(); }
    get ResourceName(): string { return this.get_ResourceName(); }
    get RewardGroupId(): int { return this.get_RewardGroupId(); }
    get FirstClearRewardGroupId(): int { return this.get_FirstClearRewardGroupId(); }
    get RecommendationElement(): ElementType { return this.get_RecommendationElement(); }
    get RecommendationElements(): ElementType[] { return this.get_RecommendationElements(); }
    get RecommendationPartyPower(): int { return this.get_RecommendationPartyPower(); }
    get BeforeBattleScenarioMstId(): int { return this.get_BeforeBattleScenarioMstId(); }
    get AfterBattleScenarioMstId(): int { return this.get_AfterBattleScenarioMstId(); }
    get JudgeResultType(): JudgeResultType { return this.get_JudgeResultType(); }
    get JudgeResultValue(): int { return this.get_JudgeResultValue(); }
    get OverrideComponentPrefabName(): string { return this.get_OverrideComponentPrefabName(); }
    get Element(): ElementType { return this.get_Element(); }
    get IsAutoModeOff(): boolean { return this.get_IsAutoModeOff(); }
    get SelectionAbilityLotteryMstId(): int { return this.get_SelectionAbilityLotteryMstId(); }
    /** @rva 0x16D5820  public void .ctor(QuestStageMstRecord record) { } */
    ctor$QuestStageMstRecord(record: any /* QuestStageMstRecord */): this { return notPorted("QuestStageMstModel..ctor", 0x16D5820); }
    /** @rva 0x730C50  public QuestStageMstRecord get_Record() { } */
    get_Record(): any /* QuestStageMstRecord */ { return notPorted("QuestStageMstModel.get_Record", 0x730C50); }
    /** @rva 0x901770  public int get_QuestStageMstId() { } */
    get_QuestStageMstId(): int { return notPorted("QuestStageMstModel.get_QuestStageMstId", 0x901770); }
    /** @rva 0x901790  public int get_QuestGroupMstId() { } */
    get_QuestGroupMstId(): int { return notPorted("QuestStageMstModel.get_QuestGroupMstId", 0x901790); }
    /** @rva 0x85E540  public string get_StageName() { } */
    get_StageName(): string { return notPorted("QuestStageMstModel.get_StageName", 0x85E540); }
    /** @rva 0xA0E810  public int get_UseStamina() { } */
    get_UseStamina(): int { return notPorted("QuestStageMstModel.get_UseStamina", 0xA0E810); }
    /** @rva 0x16CBED0  public int get_PrevQuestStageMstId() { } */
    get_PrevQuestStageMstId(): int { return notPorted("QuestStageMstModel.get_PrevQuestStageMstId", 0x16CBED0); }
    /** @rva 0x16D31F0  public int get_ConditionGroupId() { } */
    get_ConditionGroupId(): int { return notPorted("QuestStageMstModel.get_ConditionGroupId", 0x16D31F0); }
    /** @rva 0x901960  public int get_QuestMissionGroupId() { } */
    get_QuestMissionGroupId(): int { return notPorted("QuestStageMstModel.get_QuestMissionGroupId", 0x901960); }
    /** @rva 0x16D5AD0  public object get_Difficulty() { } */
    get_Difficulty(): any { return notPorted("QuestStageMstModel.get_Difficulty", 0x16D5AD0); }
    /** @rva 0x16D5C20  public string get_StagePrefabName() { } */
    get_StagePrefabName(): string { return notPorted("QuestStageMstModel.get_StagePrefabName", 0x16D5C20); }
    /** @rva 0x16D5AB0  public string get_BgmCueSheetName() { } */
    get_BgmCueSheetName(): string { return notPorted("QuestStageMstModel.get_BgmCueSheetName", 0x16D5AB0); }
    /** @rva 0x16D5A90  public string get_BgmCueName() { } */
    get_BgmCueName(): string { return notPorted("QuestStageMstModel.get_BgmCueName", 0x16D5A90); }
    /** @rva 0x7F9C00  public string get_ResourceName() { } */
    get_ResourceName(): string { return notPorted("QuestStageMstModel.get_ResourceName", 0x7F9C00); }
    /** @rva 0x16D4340  public int get_RewardGroupId() { } */
    get_RewardGroupId(): int { return notPorted("QuestStageMstModel.get_RewardGroupId", 0x16D4340); }
    /** @rva 0x16D4DE0  public int get_FirstClearRewardGroupId() { } */
    get_FirstClearRewardGroupId(): int { return notPorted("QuestStageMstModel.get_FirstClearRewardGroupId", 0x16D4DE0); }
    /** @rva 0x16D5BE0  public ElementType get_RecommendationElement() { } */
    get_RecommendationElement(): ElementType { return notPorted("QuestStageMstModel.get_RecommendationElement", 0x16D5BE0); }
    /** @rva 0x733E90  public ElementType[] get_RecommendationElements() { } */
    get_RecommendationElements(): ElementType[] { return this.recommendationElements; /* asm: mov rax, qword ptr [rcx + 0x18]; ret */ }
    /** @rva 0x16D0B20  public int get_RecommendationPartyPower() { } */
    get_RecommendationPartyPower(): int { return notPorted("QuestStageMstModel.get_RecommendationPartyPower", 0x16D0B20); }
    /** @rva 0x16D5A70  public int get_BeforeBattleScenarioMstId() { } */
    get_BeforeBattleScenarioMstId(): int { return notPorted("QuestStageMstModel.get_BeforeBattleScenarioMstId", 0x16D5A70); }
    /** @rva 0x16D5A50  public int get_AfterBattleScenarioMstId() { } */
    get_AfterBattleScenarioMstId(): int { return notPorted("QuestStageMstModel.get_AfterBattleScenarioMstId", 0x16D5A50); }
    /** @rva 0x16D5B80  public JudgeResultType get_JudgeResultType() { } */
    get_JudgeResultType(): JudgeResultType { return notPorted("QuestStageMstModel.get_JudgeResultType", 0x16D5B80); }
    /** @rva 0x16D5BA0  public int get_JudgeResultValue() { } */
    get_JudgeResultValue(): int { return notPorted("QuestStageMstModel.get_JudgeResultValue", 0x16D5BA0); }
    /** @rva 0x16D5BC0  public string get_OverrideComponentPrefabName() { } */
    get_OverrideComponentPrefabName(): string { return notPorted("QuestStageMstModel.get_OverrideComponentPrefabName", 0x16D5BC0); }
    /** @rva 0x16D5B30  public ElementType get_Element() { } */
    get_Element(): ElementType { return notPorted("QuestStageMstModel.get_Element", 0x16D5B30); }
    /** @rva 0x16D5B50  public bool get_IsAutoModeOff() { } */
    get_IsAutoModeOff(): boolean { return notPorted("QuestStageMstModel.get_IsAutoModeOff", 0x16D5B50); }
    /** @rva 0x16D5C00  public int get_SelectionAbilityLotteryMstId() { } */
    get_SelectionAbilityLotteryMstId(): int { return notPorted("QuestStageMstModel.get_SelectionAbilityLotteryMstId", 0x16D5C00); }
}
