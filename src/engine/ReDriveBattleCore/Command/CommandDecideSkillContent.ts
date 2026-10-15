// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { StepUpSkillHandler } from "../StepUpSkillHandler";
import { StepUpSkillUnitState } from "../UnitState/StepUpSkillUnitState";
import type { SpReferee } from "../SpReferee";
import type { SwitchSkillUnitState } from "../UnitState/SwitchSkillUnitState";
import { SwitchedActiveSkillInfo } from "./SwitchedActiveSkillInfo";
import { TurnUnitActBase } from "../Act/TurnUnitActBase";
import { ReActionTurnUnitAct } from "../Act/ReActionTurnUnitAct";
import { AdditionalTurnUnitAct } from "../Act/AdditionalTurnUnitAct";
import { SpecialAttackAct } from "../Act/SpecialAttackAct";
import { ActiveSkillBase } from "../ActiveSkillBase";
import { isImpl, notPorted, ref } from "../../runtime";
import type { Dictionary, List, int } from "../../runtime";
import type { ActBase } from "../Act/ActBase";
import type { BattleUnit } from "../BattleUnit";
import { CommandBase } from "./CommandBase";
import type { CommandType } from "./CommandType";

import type { IEffectValueVariation } from "../UnitState/IEffectValueVariation";
import type { IRequiredStateForDecide } from "../UnitState/IRequiredStateForDecide";
import { dictGet } from "../../runtime";

// ---- ReDriveBattleCore.Command.CommandDecideSkillContent  (TypeDefIndex 985, public class) ----
export class CommandDecideSkillContent extends CommandBase {
    /** 0x18 private bool <IsSpecialAttack>k__BackingField */
    _IsSpecialAttack: boolean = false;
    /** 0x1C private int <UnitId>k__BackingField */
    _UnitId: int = 0;
    /** 0x20 private bool <IsAdditionalTurnAct>k__BackingField */
    _IsAdditionalTurnAct: boolean = false;
    /** 0x21 private bool <IsReActionTurnAct>k__BackingField */
    _IsReActionTurnAct: boolean = false;
    /** 0x28 private Dictionary<int, List<IRequiredStateForDecide>> <UnitStateListForDecideDic>k__BackingField */
    _UnitStateListForDecideDic: Dictionary<int, List<IRequiredStateForDecide>> = null!;
    /** 0x30 private IEffectValueVariation[] <EffectValueVariations>k__BackingField */
    _EffectValueVariations: IEffectValueVariation[] = null!;
    /** 0x38 private SwitchedActiveSkillInfo <SwitchedActiveSkillInfo>k__BackingField */
    _SwitchedActiveSkillInfo: SwitchedActiveSkillInfo = null!;
    /** 0x41 private bool <CanStepUpSkill>k__BackingField */
    _CanStepUpSkill: boolean = false;
    /** 0x40 private bool <HasStepUpSkill>k__BackingField */
    _HasStepUpSkill: boolean = false;
    get IsSpecialAttack(): boolean { return this.get_IsSpecialAttack(); }
    set IsSpecialAttack(v: boolean) { this.set_IsSpecialAttack(v); }
    get UnitId(): int { return this.get_UnitId(); }
    set UnitId(v: int) { this.set_UnitId(v); }
    get IsAdditionalTurnAct(): boolean { return this.get_IsAdditionalTurnAct(); }
    set IsAdditionalTurnAct(v: boolean) { this.set_IsAdditionalTurnAct(v); }
    get IsReActionTurnAct(): boolean { return this.get_IsReActionTurnAct(); }
    set IsReActionTurnAct(v: boolean) { this.set_IsReActionTurnAct(v); }
    get UnitStateListForDecideDic(): Dictionary<int, List<IRequiredStateForDecide>> { return this.get_UnitStateListForDecideDic(); }
    set UnitStateListForDecideDic(v: Dictionary<int, List<IRequiredStateForDecide>>) { this.set_UnitStateListForDecideDic(v); }
    get EffectValueVariations(): IEffectValueVariation[] { return this.get_EffectValueVariations(); }
    set EffectValueVariations(v: IEffectValueVariation[]) { this.set_EffectValueVariations(v); }
    get SwitchedActiveSkillInfo(): SwitchedActiveSkillInfo { return this.get_SwitchedActiveSkillInfo(); }
    set SwitchedActiveSkillInfo(v: SwitchedActiveSkillInfo) { this.set_SwitchedActiveSkillInfo(v); }
    set CanStepUpSkill(v: boolean) { this.set_CanStepUpSkill(v); }
    get CanStepUpSkill(): boolean { return this.get_CanStepUpSkill(); }
    set HasStepUpSkill(v: boolean) { this.set_HasStepUpSkill(v); }
    get HasStepUpSkill(): boolean { return this.get_HasStepUpSkill(); }
    /** @rva 0x1810050 slot 4  public override CommandType GetCommandType() { } */
    GetCommandType(): CommandType { return 17 as CommandType; /* asm: mov eax, 0x11; ret */ }
    /** @rva 0x7F87F0  public bool get_IsSpecialAttack() { } */
    get_IsSpecialAttack(): boolean { return this._IsSpecialAttack; /* auto-property */ }
    /** @rva 0x7F8810  public void set_IsSpecialAttack(bool value) { } */
    set_IsSpecialAttack(value: boolean): void { this._IsSpecialAttack = value; /* auto-property */ }
    /** @rva 0x7F8800  public int get_UnitId() { } */
    get_UnitId(): int { return this._UnitId; /* auto-property */ }
    /** @rva 0x7F8820  public void set_UnitId(int value) { } */
    set_UnitId(value: int): void { this._UnitId = value; /* auto-property */ }
    /** @rva 0x8AB0D0  public bool get_IsAdditionalTurnAct() { } */
    get_IsAdditionalTurnAct(): boolean { return this._IsAdditionalTurnAct; /* auto-property */ }
    /** @rva 0x8AB0E0  public void set_IsAdditionalTurnAct(bool value) { } */
    set_IsAdditionalTurnAct(value: boolean): void { this._IsAdditionalTurnAct = value; /* auto-property */ }
    /** @rva 0x8D5550  public bool get_IsReActionTurnAct() { } */
    get_IsReActionTurnAct(): boolean { return this._IsReActionTurnAct; /* auto-property */ }
    /** @rva 0x8D5580  public void set_IsReActionTurnAct(bool value) { } */
    set_IsReActionTurnAct(value: boolean): void { this._IsReActionTurnAct = value; /* auto-property */ }
    /** @rva 0x735EA0  public Dictionary<int, List<IRequiredStateForDecide>> get_UnitStateListForDecideDic() { } */
    get_UnitStateListForDecideDic(): Dictionary<int, List<IRequiredStateForDecide>> { return this._UnitStateListForDecideDic; /* auto-property */ }
    /** @rva 0x735F10  public void set_UnitStateListForDecideDic(Dictionary<int, List<IRequiredStateForDecide>> value) { } */
    set_UnitStateListForDecideDic(value: Dictionary<int, List<IRequiredStateForDecide>>): void { this._UnitStateListForDecideDic = value; /* auto-property */ }
    /** @rva 0x735F00  public IEffectValueVariation[] get_EffectValueVariations() { } */
    get_EffectValueVariations(): IEffectValueVariation[] { return this._EffectValueVariations; /* auto-property */ }
    /** @rva 0x735F30  public void set_EffectValueVariations(IEffectValueVariation[] value) { } */
    set_EffectValueVariations(value: IEffectValueVariation[]): void { this._EffectValueVariations = value; /* auto-property */ }
    /** @rva 0x735970  public SwitchedActiveSkillInfo get_SwitchedActiveSkillInfo() { } */
    get_SwitchedActiveSkillInfo(): SwitchedActiveSkillInfo { return this._SwitchedActiveSkillInfo; /* auto-property */ }
    /** @rva 0x735A30  public void set_SwitchedActiveSkillInfo(SwitchedActiveSkillInfo value) { } */
    set_SwitchedActiveSkillInfo(value: SwitchedActiveSkillInfo): void { this._SwitchedActiveSkillInfo = value; /* auto-property */ }
    /** @rva 0xA06250  public void set_CanStepUpSkill(bool value) { } */
    set_CanStepUpSkill(value: boolean): void { this._CanStepUpSkill = value; /* auto-property */ }
    /** @rva 0xA06240  public bool get_CanStepUpSkill() { } */
    get_CanStepUpSkill(): boolean { return this._CanStepUpSkill; /* auto-property */ }
    /** @rva 0x900C80  public void set_HasStepUpSkill(bool value) { } */
    set_HasStepUpSkill(value: boolean): void { this._HasStepUpSkill = value; /* auto-property */ }
    /** @rva 0x900C50  public bool get_HasStepUpSkill() { } */
    get_HasStepUpSkill(): boolean { return this._HasStepUpSkill; /* auto-property */ }
    /** @rva 0x18103D0  public void .ctor() { } */
    ctor(): this {
        this._EffectValueVariations = [];
        return this;
    }
    /** @rva 0x1810060  public void .ctor(int unitId, bool isSpecialAttack, bool isAdditionalTurnAct, bool isReActionTurnAct, Dictionary<int, BattleUnit> unitDic) { } */
    ctor$int_bool_bool_bool_DictionaryintBattleUnit(unitId: int, isSpecialAttack: boolean, isAdditionalTurnAct: boolean, isReActionTurnAct: boolean, unitDic: Dictionary<int, BattleUnit>): this {
        this._EffectValueVariations = [];
        this._IsReActionTurnAct = isReActionTurnAct;
        this._UnitId = unitId;
        this._IsSpecialAttack = isSpecialAttack;
        this._IsAdditionalTurnAct = isAdditionalTurnAct;
        if (unitDic == null) return this;
        const dic = new Map<int, List<IRequiredStateForDecide>>(); // ToDictionary(<>c.b__38_0 key, <>c.b__38_1 value)
        for (const [key, unit] of unitDic) {
            dic.set(key, unit.Condition.StateList.filter(state => unit.$GetStateListForDecide$b__165_0(state))
                .filter(state => isImpl(state, "IRequiredStateForDecide")) as unknown as List<IRequiredStateForDecide>);
        }
        this._UnitStateListForDecideDic = dic;
        const unit = unitDic.get(unitId); // <>c__DisplayClass38_0
        if (unit !== undefined) {
            this._EffectValueVariations = unit.Condition.StateList
                .filter(state => isImpl(state, "IEffectValueVariation") && state.IsActive$BattleUnit(unit)) // <>c__DisplayClass38_0.b__2 (IsActive inlined in the game)
                .filter(state => isImpl(state, "IEffectValueVariation")) as unknown as IEffectValueVariation[]; // OfType<IEffectValueVariation>
        }
        return this;
    }
    /** @rva 0x180FD00  public static CommandDecideSkillContent Create(ActBase currentAct, Dictionary<int, BattleUnit> unitDic, SpReferee spReferee) { } */
    static Create(currentAct: ActBase, unitDic: Dictionary<int, BattleUnit>, spReferee: SpReferee): CommandDecideSkillContent {
        const unitId = currentAct.actUnitId;
        const command = new CommandDecideSkillContent().ctor$int_bool_bool_bool_DictionaryintBattleUnit(unitId,
            currentAct instanceof SpecialAttackAct, currentAct instanceof AdditionalTurnUnitAct, currentAct instanceof ReActionTurnUnitAct, unitDic);
        if (!(currentAct instanceof TurnUnitActBase)) return command;
        const unit = dictGet(unitDic, unitId);
        const activeSkill = ref<ActiveSkillBase>(null!);
        const unitState = ref<SwitchSkillUnitState>(null!);
        if (unit.IsSwitchingActiveSkill<ActiveSkillBase>(ActiveSkillBase, activeSkill, unitState)) {
            const info = new SwitchedActiveSkillInfo();
            info._SkillType = unitState.v.SkillType;
            info._ActiveSkillMstId = activeSkill.v.Id;
            info._VisualEffectNo = unitState.v.visualEffectNo;
            info._VisualEffectElement = unitState.v.TargetElement;
            command._SwitchedActiveSkillInfo = info;
        }
        // 3.21.0: Step-Up button state for the skill decision UI
        command._HasStepUpSkill = unit.Condition.GetUnitStateList<StepUpSkillUnitState>(StepUpSkillUnitState).length > 0; // Any()
        command._CanStepUpSkill = command._HasStepUpSkill ? StepUpSkillHandler.CanStepUpFromLevel(unit, 0, spReferee) : false;
        return command;
    }
}
