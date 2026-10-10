// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../runtime";
import type { List, Nullable, int } from "../runtime";
import type { BattleConditionUtils_ConditionCheckDataBundle } from "./BattleCondition/BattleConditionUtils";
import type { EnemyConditionSetsAndActionMstModel } from "./Model/EnemyConditionSetsAndActionMstModel";

// ---- ReDriveBattleCore.EnemyConditionAndActionController  (TypeDefIndex 390, public class) ----
export class EnemyConditionAndActionController {
    /** 0x10 private List<EnemyConditionAndActionController.ConditionSetsAndAction> <conditionAndActionList>k__BackingField */
    _conditionAndActionList: List<EnemyConditionAndActionController_ConditionSetsAndAction> = null!;
    /** 0x18 private Queue<int> <CachedSkillMstIds>k__BackingField */
    _CachedSkillMstIds: any /* Queue<int> */ = null!;
    /** 0x20 private List<EnemyConditionAndActionController.StartConditionTimingAction> <EnemyStartConditionTimingActionList>k__BackingField */
    _EnemyStartConditionTimingActionList: List<EnemyConditionAndActionController_StartConditionTimingAction> = null!;
    get conditionAndActionList(): List<EnemyConditionAndActionController_ConditionSetsAndAction> { return this.get_conditionAndActionList(); }
    set conditionAndActionList(v: List<EnemyConditionAndActionController_ConditionSetsAndAction>) { this.set_conditionAndActionList(v); }
    get CachedSkillMstIds(): any /* Queue<int> */ { return this.get_CachedSkillMstIds(); }
    set CachedSkillMstIds(v: any /* Queue<int> */) { this.set_CachedSkillMstIds(v); }
    get EnemyStartConditionTimingActionList(): List<EnemyConditionAndActionController_StartConditionTimingAction> { return this.get_EnemyStartConditionTimingActionList(); }
    set EnemyStartConditionTimingActionList(v: List<EnemyConditionAndActionController_StartConditionTimingAction>) { this.set_EnemyStartConditionTimingActionList(v); }
    /** @rva 0x730C50  public List<EnemyConditionAndActionController.ConditionSetsAndAction> get_conditionAndActionList() { } */
    get_conditionAndActionList(): List<EnemyConditionAndActionController_ConditionSetsAndAction> { return this._conditionAndActionList; /* auto-property */ }
    /** @rva 0x730C60  public void set_conditionAndActionList(List<EnemyConditionAndActionController.ConditionSetsAndAction> value) { } */
    set_conditionAndActionList(value: List<EnemyConditionAndActionController_ConditionSetsAndAction>): void { this._conditionAndActionList = value; /* auto-property */ }
    /** @rva 0x733E90  public Queue<int> get_CachedSkillMstIds() { } */
    get_CachedSkillMstIds(): any /* Queue<int> */ { return this._CachedSkillMstIds; /* auto-property */ }
    /** @rva 0x736AB0  public void set_CachedSkillMstIds(Queue<int> value) { } */
    set_CachedSkillMstIds(value: any /* Queue<int> */): void { this._CachedSkillMstIds = value; /* auto-property */ }
    /** @rva 0x7369E0  public List<EnemyConditionAndActionController.StartConditionTimingAction> get_EnemyStartConditionTimingActionList() { } */
    get_EnemyStartConditionTimingActionList(): List<EnemyConditionAndActionController_StartConditionTimingAction> { return this._EnemyStartConditionTimingActionList; /* auto-property */ }
    /** @rva 0x736A50  public void set_EnemyStartConditionTimingActionList(List<EnemyConditionAndActionController.StartConditionTimingAction> value) { } */
    set_EnemyStartConditionTimingActionList(value: List<EnemyConditionAndActionController_StartConditionTimingAction>): void { this._EnemyStartConditionTimingActionList = value; /* auto-property */ }
    /** @rva 0x1496E50  protected void .ctor() { } */
    ctor(): this { return notPorted("EnemyConditionAndActionController..ctor", 0x1496E50); }
    /** @rva 0x1496F10  public void .ctor(int enemyConditionSkillSetId) { } */
    ctor$int(enemyConditionSkillSetId: int): this { return notPorted("EnemyConditionAndActionController..ctor", 0x1496F10); }
    /** @rva 0x1495FA0  public Nullable<int> GetAction(BattleConditionUtils.ConditionCheckDataBundle conditionCheckDataBundle, int actionCount = 1) { } */
    GetAction(conditionCheckDataBundle: BattleConditionUtils_ConditionCheckDataBundle, actionCount?: int /* = 1 */): Nullable<int> { return notPorted("EnemyConditionAndActionController.GetAction", 0x1495FA0); }
    /** @rva 0x14964F0  private void LoadStartTimingConditionAction() { } */
    LoadStartTimingConditionAction(): void { return notPorted("EnemyConditionAndActionController.LoadStartTimingConditionAction", 0x14964F0); }
    /** @rva 0x1496BE0  public void SetEnabledActiveStartConditionTimingAction(EnemyConditionAndActionController.EnemyStartConditionTimingType timingType) { } */
    SetEnabledActiveStartConditionTimingAction(timingType: EnemyConditionAndActionController_EnemyStartConditionTimingType): void { return notPorted("EnemyConditionAndActionController.SetEnabledActiveStartConditionTimingAction", 0x1496BE0); }
    /** @rva 0x1496AC0  public void RegisterStartConditionTimingAction(int timingTypeValue, int skillMstId) { } */
    RegisterStartConditionTimingAction(timingTypeValue: int, skillMstId: int): void { return notPorted("EnemyConditionAndActionController.RegisterStartConditionTimingAction", 0x1496AC0); }
    /** @rva 0x14963D0  public bool HasAnyCanActivateStartConditionTimingAction() { } */
    HasAnyCanActivateStartConditionTimingAction(): boolean { return notPorted("EnemyConditionAndActionController.HasAnyCanActivateStartConditionTimingAction", 0x14963D0); }
    /** @rva 0x14962F0  public List<EnemyConditionAndActionController.StartConditionTimingAction> GetCanActivateStartConditionTimingActionList(EnemyConditionAndActionController.EnemyStartConditionTimingType timingType) { } */
    GetCanActivateStartConditionTimingActionList(timingType: EnemyConditionAndActionController_EnemyStartConditionTimingType): List<EnemyConditionAndActionController_StartConditionTimingAction> { return notPorted("EnemyConditionAndActionController.GetCanActivateStartConditionTimingActionList", 0x14962F0); }
    /** @rva 0x1496D00  private void <GetAction>b__15_0(int x) { } */
    $GetAction$b__15_0(x: int): void { return notPorted("EnemyConditionAndActionController.<GetAction>b__15_0", 0x1496D00); }
    /** @rva 0x1496D60  private void <LoadStartTimingConditionAction>g__AddAction|17_0(int skillMstId, int timingTypeValue) { } */
    $LoadStartTimingConditionAction$g__AddAction_17_0(skillMstId: int, timingTypeValue: int): void { return notPorted("EnemyConditionAndActionController.<LoadStartTimingConditionAction>g__AddAction|17_0", 0x1496D60); }
}

// ---- ReDriveBattleCore.EnemyConditionAndActionController.EnemyStartConditionTimingType  (TypeDefIndex 379, public enum) ----
export const EnemyConditionAndActionController_EnemyStartConditionTimingType = {
    BattleStart: 1,
    WaveStart: 2,
} as const;
export type EnemyConditionAndActionController_EnemyStartConditionTimingType = (typeof EnemyConditionAndActionController_EnemyStartConditionTimingType)[keyof typeof EnemyConditionAndActionController_EnemyStartConditionTimingType];

// ---- ReDriveBattleCore.EnemyConditionAndActionController.StartConditionTimingAction  (TypeDefIndex 380, public class) ----
export class EnemyConditionAndActionController_StartConditionTimingAction {
    /** 0x10 private int <SkillMstId>k__BackingField */
    _SkillMstId: int = 0;
    /** 0x14 private int <StartConditionTimingType>k__BackingField */
    _StartConditionTimingType: int = 0;
    /** 0x18 private bool <CanActivate>k__BackingField */
    _CanActivate: boolean = false;
    /** 0x19 private bool <IsRegistered>k__BackingField */
    _IsRegistered: boolean = false;
    get SkillMstId(): int { return this.get_SkillMstId(); }
    set SkillMstId(v: int) { this.set_SkillMstId(v); }
    get StartConditionTimingType(): int { return this.get_StartConditionTimingType(); }
    set StartConditionTimingType(v: int) { this.set_StartConditionTimingType(v); }
    get CanActivate(): boolean { return this.get_CanActivate(); }
    set CanActivate(v: boolean) { this.set_CanActivate(v); }
    get IsRegistered(): boolean { return this.get_IsRegistered(); }
    set IsRegistered(v: boolean) { this.set_IsRegistered(v); }
    /** @rva 0x7364F0  public int get_SkillMstId() { } */
    get_SkillMstId(): int { return this._SkillMstId; /* auto-property */ }
    /** @rva 0x739D00  public void set_SkillMstId(int value) { } */
    set_SkillMstId(value: int): void { this._SkillMstId = value; /* auto-property */ }
    /** @rva 0x803350  public int get_StartConditionTimingType() { } */
    get_StartConditionTimingType(): int { return this._StartConditionTimingType; /* auto-property */ }
    /** @rva 0x803540  public void set_StartConditionTimingType(int value) { } */
    set_StartConditionTimingType(value: int): void { this._StartConditionTimingType = value; /* auto-property */ }
    /** @rva 0x7F97F0  public bool get_CanActivate() { } */
    get_CanActivate(): boolean { return this._CanActivate; /* auto-property */ }
    /** @rva 0x7F9810  public void set_CanActivate(bool value) { } */
    set_CanActivate(value: boolean): void { this._CanActivate = value; /* auto-property */ }
    /** @rva 0x9823B0  public bool get_IsRegistered() { } */
    get_IsRegistered(): boolean { return this._IsRegistered; /* auto-property */ }
    /** @rva 0x11E2DD0  public void set_IsRegistered(bool value) { } */
    set_IsRegistered(value: boolean): void { this._IsRegistered = value; /* auto-property */ }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
}

// ---- ReDriveBattleCore.EnemyConditionAndActionController.ConditionSetsAndAction  (TypeDefIndex 382, public class) ----
export class EnemyConditionAndActionController_ConditionSetsAndAction {
    /** 0x10 private int <EnemyConditionSetsAndActionMstId>k__BackingField */
    _EnemyConditionSetsAndActionMstId: int = 0;
    /** 0x18 private EnemyConditionSetsAndActionMstModel enemyConditionSetsAndActionMstModel */
    enemyConditionSetsAndActionMstModel: EnemyConditionSetsAndActionMstModel = null!;
    /** 0x20 private EnemyConditionAndActionController.ActionBase <Action>k__BackingField */
    _Action: EnemyConditionAndActionController_ActionBase = null!;
    get EnemyConditionSetsAndActionMstId(): int { return this.get_EnemyConditionSetsAndActionMstId(); }
    set EnemyConditionSetsAndActionMstId(v: int) { this.set_EnemyConditionSetsAndActionMstId(v); }
    get ConditionSetsAndActionMstModel(): EnemyConditionSetsAndActionMstModel { return this.get_ConditionSetsAndActionMstModel(); }
    get Action(): EnemyConditionAndActionController_ActionBase { return this.get_Action(); }
    set Action(v: EnemyConditionAndActionController_ActionBase) { this.set_Action(v); }
    get Priority(): int { return this.get_Priority(); }
    get IsAvailable(): boolean { return this.get_IsAvailable(); }
    get IsSkillBundle(): boolean { return this.get_IsSkillBundle(); }
    /** @rva 0x7364F0  public int get_EnemyConditionSetsAndActionMstId() { } */
    get_EnemyConditionSetsAndActionMstId(): int { return this._EnemyConditionSetsAndActionMstId; /* auto-property */ }
    /** @rva 0x739D00  public void set_EnemyConditionSetsAndActionMstId(int value) { } */
    set_EnemyConditionSetsAndActionMstId(value: int): void { this._EnemyConditionSetsAndActionMstId = value; /* auto-property */ }
    /** @rva 0x1493C60  public EnemyConditionSetsAndActionMstModel get_ConditionSetsAndActionMstModel() { } */
    get_ConditionSetsAndActionMstModel(): EnemyConditionSetsAndActionMstModel { return notPorted("EnemyConditionAndActionController_ConditionSetsAndAction.get_ConditionSetsAndActionMstModel", 0x1493C60); }
    /** @rva 0x7369E0  public EnemyConditionAndActionController.ActionBase get_Action() { } */
    get_Action(): EnemyConditionAndActionController_ActionBase { return this._Action; /* auto-property */ }
    /** @rva 0x736A50  public void set_Action(EnemyConditionAndActionController.ActionBase value) { } */
    set_Action(value: EnemyConditionAndActionController_ActionBase): void { this._Action = value; /* auto-property */ }
    /** @rva 0x1493DB0  public int get_Priority() { } */
    get_Priority(): int { return notPorted("EnemyConditionAndActionController_ConditionSetsAndAction.get_Priority", 0x1493DB0); }
    /** @rva 0x1493D60  public bool get_IsAvailable() { } */
    get_IsAvailable(): boolean { return notPorted("EnemyConditionAndActionController_ConditionSetsAndAction.get_IsAvailable", 0x1493D60); }
    /** @rva 0x1493D80  public bool get_IsSkillBundle() { } */
    get_IsSkillBundle(): boolean { return notPorted("EnemyConditionAndActionController_ConditionSetsAndAction.get_IsSkillBundle", 0x1493D80); }
    /** @rva 0x7305E0  protected void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x1493930  public void .ctor(int ConditionSetsAndActionMstId) { } */
    ctor$int(ConditionSetsAndActionMstId: int): this { return notPorted("EnemyConditionAndActionController_ConditionSetsAndAction..ctor", 0x1493930); }
    /** @rva 0x14938B0  public bool CheckCondition(BattleConditionUtils.ConditionCheckDataBundle conditionCheckDataBundle) { } */
    CheckCondition(conditionCheckDataBundle: BattleConditionUtils_ConditionCheckDataBundle): boolean { return notPorted("EnemyConditionAndActionController_ConditionSetsAndAction.CheckCondition", 0x14938B0); }
}

// ---- ReDriveBattleCore.EnemyConditionAndActionController.ActionBase  (TypeDefIndex 383, public abstract class) ----
export abstract class EnemyConditionAndActionController_ActionBase {
    /** 0x10 private List<int> <SkillMstIds>k__BackingField */
    _SkillMstIds: List<int> = null!;
    /** 0x18 private bool <IsSkillResuable>k__BackingField */
    _IsSkillResuable: boolean = false;
    /** 0x19 private bool <IsAvailable>k__BackingField */
    _IsAvailable: boolean = false;
    get SkillMstIds(): List<int> { return this.get_SkillMstIds(); }
    set SkillMstIds(v: List<int>) { this.set_SkillMstIds(v); }
    get IsSkillResuable(): boolean { return this.get_IsSkillResuable(); }
    set IsSkillResuable(v: boolean) { this.set_IsSkillResuable(v); }
    get IsAvailable(): boolean { return this.get_IsAvailable(); }
    set IsAvailable(v: boolean) { this.set_IsAvailable(v); }
    /** @rva 0x730C50  public List<int> get_SkillMstIds() { } */
    get_SkillMstIds(): List<int> { return this._SkillMstIds; /* auto-property */ }
    /** @rva 0x730C60  public void set_SkillMstIds(List<int> value) { } */
    set_SkillMstIds(value: List<int>): void { this._SkillMstIds = value; /* auto-property */ }
    /** @rva 0x7F97F0  public bool get_IsSkillResuable() { } */
    get_IsSkillResuable(): boolean { return this._IsSkillResuable; /* auto-property */ }
    /** @rva 0x7F9810  public void set_IsSkillResuable(bool value) { } */
    set_IsSkillResuable(value: boolean): void { this._IsSkillResuable = value; /* auto-property */ }
    /** @rva 0x9823B0  public bool get_IsAvailable() { } */
    get_IsAvailable(): boolean { return this._IsAvailable; /* auto-property */ }
    /** @rva 0x11E2DD0  public void set_IsAvailable(bool value) { } */
    set_IsAvailable(value: boolean): void { this._IsAvailable = value; /* auto-property */ }
    /** @rva 0x7305E0  protected void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x1490430  public void .ctor(List<int> skillMstIds, bool isSkillResuable) { } */
    ctor$Listint_bool(skillMstIds: List<int>, isSkillResuable: boolean): this {
        this._SkillMstIds = skillMstIds;
        this._IsSkillResuable = isSkillResuable;
        this._IsAvailable = true;
        return this;
    }
}

// ---- ReDriveBattleCore.EnemyConditionAndActionController.BundleAction  (TypeDefIndex 384, public class) ----
export class EnemyConditionAndActionController_BundleAction extends EnemyConditionAndActionController_ActionBase {
    /** @rva 0x7305E0  protected void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x1490430  public void .ctor(List<int> skillMstIds, bool isSkillResuable) { } */
    ctor$Listint_bool(skillMstIds: List<int>, isSkillResuable: boolean): this {
        this._SkillMstIds = skillMstIds;
        this._IsSkillResuable = isSkillResuable;
        this._IsAvailable = true;
        return this;
    }
    /** @rva 0x1493160  public List<int> GetActions(int actionCount) { } */
    GetActions(actionCount: int): List<int> { return notPorted("EnemyConditionAndActionController_BundleAction.GetActions", 0x1493160); }
}

// ---- ReDriveBattleCore.EnemyConditionAndActionController.SingleAction  (TypeDefIndex 386, public class) ----
export class EnemyConditionAndActionController_SingleAction extends EnemyConditionAndActionController_ActionBase {
    /** @rva 0x7305E0  protected void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x1490430  public void .ctor(List<int> skillMstIds, bool isSkillResuable) { } */
    ctor$Listint_bool(skillMstIds: List<int>, isSkillResuable: boolean): this {
        this._SkillMstIds = skillMstIds;
        this._IsSkillResuable = isSkillResuable;
        this._IsAvailable = true;
        return this;
    }
    /** @rva 0x14A47F0  public int GetAction() { } */
    GetAction(): int { return notPorted("EnemyConditionAndActionController_SingleAction.GetAction", 0x14A47F0); }
}
