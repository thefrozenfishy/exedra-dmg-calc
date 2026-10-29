// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { intParse, isNullOrEmpty, notPorted } from "../../runtime";
import type { int } from "../../runtime";
import type { ElementType } from "../../Network/Definition/Battle/ElementType";
import type { JudgeResultType } from "../JudgeResultType";
import { MstModelBase } from "./MstModelBase";
import type { QuestStageMstRecord } from "../../Network/Definition/QuestOutGame/QuestStageMstRecord";

// ---- ReDriveBattleCore.Model.QuestStageMstModel  (TypeDefIndex 893, public class) ----
export class QuestStageMstModel extends MstModelBase<QuestStageMstRecord> {
    /** 0x18 private ElementType[] recommendationElements */
    recommendationElements: ElementType[] = null!;
    get Record(): QuestStageMstRecord { return this.get_Record(); }
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
    /** @rva 0x16E93D0  public void .ctor(QuestStageMstRecord record) { } */
    ctor$QuestStageMstRecord(record: QuestStageMstRecord): this {
        super.ctor$TRecord(record);
        this.recommendationElements = isNullOrEmpty(record.recommendationElementCsv)
            ? []
            : record.recommendationElementCsv.split(",").map(i => intParse(i) as ElementType); // <.ctor>b__0_0: int.Parse
        return this;
    }
    /** @rva 0x730C50  public QuestStageMstRecord get_Record() { } */
    get_Record(): QuestStageMstRecord { return this.record; }
    /** @rva 0x902330  public int get_QuestStageMstId() { } */
    get_QuestStageMstId(): int { return this.record.questStageMstId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x901785; mov eax, dword ptr [rax + 0x10]; add rsp, 0x28; ret */ }
    /** @rva 0x902350  public int get_QuestGroupMstId() { } */
    get_QuestGroupMstId(): int { return this.record.questGroupMstId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x9017a5; mov eax, dword ptr [rax + 0x14]; add rsp, 0x28; ret */ }
    /** @rva 0x85E540  public string get_StageName() { } */
    get_StageName(): string { return this.record.name; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x85e556; mov rax, qword ptr [rax + 0x18]; add rsp, 0x28; ret */ }
    /** @rva 0x902EF0  public int get_UseStamina() { } */
    get_UseStamina(): int { return this.record.useStamina; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0xa0e825; mov eax, dword ptr [rax + 0x34]; add rsp, 0x28; ret */ }
    /** @rva 0x902F10  public int get_PrevQuestStageMstId() { } */
    get_PrevQuestStageMstId(): int { return this.record.prevQuestStageMstId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16cbee5; mov eax, dword ptr [rax + 0x38]; add rsp, 0x28; ret */ }
    /** @rva 0x902ED0  public int get_ConditionGroupId() { } */
    get_ConditionGroupId(): int { return this.record.conditionGroupId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d3205; mov eax, dword ptr [rax + 0x3c]; add rsp, 0x28; ret */ }
    /** @rva 0x902E50  public int get_QuestMissionGroupId() { } */
    get_QuestMissionGroupId(): int { return this.record.questMissionGroupId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x901975; mov eax, dword ptr [rax + 0x40]; add rsp, 0x28; ret */ }
    /** @rva 0x16E9680  public object get_Difficulty() { } */
    get_Difficulty(): any { return this.record.difficulty; /* boxed int */ }
    /** @rva 0x16E97D0  public string get_StagePrefabName() { } */
    get_StagePrefabName(): string { return this.record.stagePrefabName; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d5c39; mov rax, qword ptr [rax + 0x98]; add rsp, 0x28; ret */ }
    /** @rva 0x16E9660  public string get_BgmCueSheetName() { } */
    get_BgmCueSheetName(): string { return this.record.bgmCueSheetName; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d5ac9; mov rax, qword ptr [rax + 0x88]; add rsp, 0x28; ret */ }
    /** @rva 0x16E9640  public string get_BgmCueName() { } */
    get_BgmCueName(): string { return this.record.bgmCueName; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d5aa9; mov rax, qword ptr [rax + 0x90]; add rsp, 0x28; ret */ }
    /** @rva 0x7F9C00  public string get_ResourceName() { } */
    get_ResourceName(): string { return this.record.resourceName; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x7f9c16; mov rax, qword ptr [rax + 0x48]; add rsp, 0x28; ret */ }
    /** @rva 0x16E7EF0  public int get_RewardGroupId() { } */
    get_RewardGroupId(): int { return this.record.rewardGroupId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d4355; mov eax, dword ptr [rax + 0x5c]; add rsp, 0x28; ret */ }
    /** @rva 0x16E8990  public int get_FirstClearRewardGroupId() { } */
    get_FirstClearRewardGroupId(): int { return this.record.firstClearRewardGroupId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d4df5; mov eax, dword ptr [rax + 0x60]; add rsp, 0x28; ret */ }
    /** @rva 0x16E9790  public ElementType get_RecommendationElement() { } */
    get_RecommendationElement(): ElementType { return this.record.recommendationElement as ElementType; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d5bf8; mov eax, dword ptr [rax + 0xcc]; add rsp, 0x28; ret */ }
    /** @rva 0x733E90  public ElementType[] get_RecommendationElements() { } */
    get_RecommendationElements(): ElementType[] { return this.recommendationElements; /* asm: mov rax, qword ptr [rcx + 0x18]; ret */ }
    /** @rva 0x16E5680  public int get_RecommendationPartyPower() { } */
    get_RecommendationPartyPower(): int { return this.record.recommendationPartyPower; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d0b35; mov eax, dword ptr [rax + 0x58]; add rsp, 0x28; ret */ }
    /** @rva 0x16E9620  public int get_BeforeBattleScenarioMstId() { } */
    get_BeforeBattleScenarioMstId(): int { return this.record.beforeBattleScenarioMstId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d5a88; mov eax, dword ptr [rax + 0xa8]; add rsp, 0x28; ret */ }
    /** @rva 0x16E9600  public int get_AfterBattleScenarioMstId() { } */
    get_AfterBattleScenarioMstId(): int { return this.record.afterBattleScenarioMstId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d5a68; mov eax, dword ptr [rax + 0xac]; add rsp, 0x28; ret */ }
    /** @rva 0x16E9730  public JudgeResultType get_JudgeResultType() { } */
    get_JudgeResultType(): JudgeResultType { return this.record.judgeResultType as JudgeResultType; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d5b98; mov eax, dword ptr [rax + 0xa0]; add rsp, 0x28; ret */ }
    /** @rva 0x16E9750  public int get_JudgeResultValue() { } */
    get_JudgeResultValue(): int { return this.record.judgeResultValue; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d5bb8; mov eax, dword ptr [rax + 0xa4]; add rsp, 0x28; ret */ }
    /** @rva 0x16E9770  public string get_OverrideComponentPrefabName() { } */
    get_OverrideComponentPrefabName(): string { return this.record.overrideComponentPrefabName; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d5bd9; mov rax, qword ptr [rax + 0xb8]; add rsp, 0x28; ret */ }
    /** @rva 0x16E96E0  public ElementType get_Element() { } */
    get_Element(): ElementType { return this.record.element as ElementType; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d5b48; mov eax, dword ptr [rax + 0xc8]; add rsp, 0x28; ret */ }
    /** @rva 0x16E9700  public bool get_IsAutoModeOff() { } */
    get_IsAutoModeOff(): boolean { return this.record.isAutoModeOff === 1; }
    /** @rva 0x16E97B0  public int get_SelectionAbilityLotteryMstId() { } */
    get_SelectionAbilityLotteryMstId(): int { return this.record.selectionAbilityLotteryMstId; /* asm: sub rsp, 0x28; mov rax, qword ptr [rcx + 0x10]; test rax, rax; je 0x16d5c18; mov eax, dword ptr [rax + 0xc4]; add rsp, 0x28; ret */ }
}
