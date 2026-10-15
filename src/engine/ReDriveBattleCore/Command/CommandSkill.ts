// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { StepUpSkillUnitState } from "../UnitState/StepUpSkillUnitState";
import { StepUpSkillHandler } from "../StepUpSkillHandler";
import { SwitchSkillUnitState } from "../UnitState/SwitchSkillUnitState";
import { QuestEnemyAppearanceParameter } from "../QuestEnemyAppearanceParameter";
import { ActiveSkillBase } from "../ActiveSkillBase";
import { SwitchedActiveSkillInfo } from "./SwitchedActiveSkillInfo";
import { AddEnemyInfo } from "./AddEnemyInfo";
import { dictGet, notPorted, ref } from "../../runtime";
import type { Dictionary, IEnumerable, List, int } from "../../runtime";
import type { AffectedUnitNotice } from "../AffectedUnitNotice";
import type { BattleUnit } from "../BattleUnit";

import { CommandExecuteActBase } from "./CommandExecuteActBase";
import type { CommandType } from "./CommandType";

import type { GainSoloRaidBuffPointNotice } from "../GainSoloRaidBuffPointNotice";
import { AffectedUnitNotice_DamageInfo } from "../AffectedUnitNotice";

// ---- ReDriveBattleCore.Command.CommandSkill  (TypeDefIndex 1015, public sealed class) ----
export class CommandSkill extends CommandExecuteActBase {
    /** 0x38 private int <MainTargetUnitId>k__BackingField */
    _MainTargetUnitId: int = 0;
    /** 0x3C private int <ResultSP>k__BackingField */
    _ResultSP: int = 0;
    /** 0x40 private int <ResultSPBeforeApplyPassiveSkill>k__BackingField */
    _ResultSPBeforeApplyPassiveSkill: int = 0;
    /** 0x44 private int <SkillMstId>k__BackingField */
    _SkillMstId: int = 0;
    /** 0x48 private SwitchedActiveSkillInfo <SwitchedActiveSkillInfo>k__BackingField */
    _SwitchedActiveSkillInfo: SwitchedActiveSkillInfo = null!;
    /** 0x58 private bool <HasStepUpSkill>k__BackingField */
    _HasStepUpSkill: boolean = false;
    /** 0x54 private int <StepUpConsumeSp>k__BackingField */
    _StepUpConsumeSp: int = 0;
    /** 0x50 private int <StepUpLevel>k__BackingField */
    _StepUpLevel: int = 0;
    /** 0x60 private AddEnemyInfo[] <AddEnemyInfos>k__BackingField */
    _AddEnemyInfos: AddEnemyInfo[] = null!;
    get UserUnitId(): int { return this.get_UserUnitId(); }
    get MainTargetUnitId(): int { return this.get_MainTargetUnitId(); }
    set MainTargetUnitId(v: int) { this.set_MainTargetUnitId(v); }
    get ResultSP(): int { return this.get_ResultSP(); }
    set ResultSP(v: int) { this.set_ResultSP(v); }
    get ResultSPBeforeApplyPassiveSkill(): int { return this.get_ResultSPBeforeApplyPassiveSkill(); }
    set ResultSPBeforeApplyPassiveSkill(v: int) { this.set_ResultSPBeforeApplyPassiveSkill(v); }
    get SkillMstId(): int { return this.get_SkillMstId(); }
    set SkillMstId(v: int) { this.set_SkillMstId(v); }
    get SwitchedActiveSkillInfo(): SwitchedActiveSkillInfo { return this.get_SwitchedActiveSkillInfo(); }
    set SwitchedActiveSkillInfo(v: SwitchedActiveSkillInfo) { this.set_SwitchedActiveSkillInfo(v); }
    set HasStepUpSkill(v: boolean) { this.set_HasStepUpSkill(v); }
    get HasStepUpSkill(): boolean { return this.get_HasStepUpSkill(); }
    set StepUpConsumeSp(v: int) { this.set_StepUpConsumeSp(v); }
    get StepUpConsumeSp(): int { return this.get_StepUpConsumeSp(); }
    set StepUpLevel(v: int) { this.set_StepUpLevel(v); }
    get StepUpLevel(): int { return this.get_StepUpLevel(); }
    get AddEnemyInfos(): AddEnemyInfo[] { return this.get_AddEnemyInfos(); }
    set AddEnemyInfos(v: AddEnemyInfo[]) { this.set_AddEnemyInfos(v); }
    get IsRandomAttack(): boolean { return this.get_IsRandomAttack(); }
    /** @rva 0xD8D350 slot 4  public override CommandType GetCommandType() { } */
    GetCommandType(): CommandType { return 3 as CommandType; /* asm: mov eax, 3; ret */ }
    /** @rva 0x762820  public int get_UserUnitId() { } */
    get_UserUnitId(): int { return this._ActUnitId; /* asm: mov eax, dword ptr [rcx + 0x18]; ret */ }
    /** @rva 0x75DDA0  public int get_MainTargetUnitId() { } */
    get_MainTargetUnitId(): int { return this._MainTargetUnitId; /* auto-property */ }
    /** @rva 0x8A12B0  public void set_MainTargetUnitId(int value) { } */
    set_MainTargetUnitId(value: int): void { this._MainTargetUnitId = value; /* auto-property */ }
    /** @rva 0x8F2F40  public int get_ResultSP() { } */
    get_ResultSP(): int { return this._ResultSP; /* auto-property */ }
    /** @rva 0x900870  public void set_ResultSP(int value) { } */
    set_ResultSP(value: int): void { this._ResultSP = value; /* auto-property */ }
    /** @rva 0x7660B0  public int get_ResultSPBeforeApplyPassiveSkill() { } */
    get_ResultSPBeforeApplyPassiveSkill(): int { return this._ResultSPBeforeApplyPassiveSkill; /* auto-property */ }
    /** @rva 0x766A90  public void set_ResultSPBeforeApplyPassiveSkill(int value) { } */
    set_ResultSPBeforeApplyPassiveSkill(value: int): void { this._ResultSPBeforeApplyPassiveSkill = value; /* auto-property */ }
    /** @rva 0x900840  public int get_SkillMstId() { } */
    get_SkillMstId(): int { return this._SkillMstId; /* auto-property */ }
    /** @rva 0x900880  public void set_SkillMstId(int value) { } */
    set_SkillMstId(value: int): void { this._SkillMstId = value; /* auto-property */ }
    /** @rva 0x7358F0  public SwitchedActiveSkillInfo get_SwitchedActiveSkillInfo() { } */
    get_SwitchedActiveSkillInfo(): SwitchedActiveSkillInfo { return this._SwitchedActiveSkillInfo; /* auto-property */ }
    /** @rva 0x735A00  public void set_SwitchedActiveSkillInfo(SwitchedActiveSkillInfo value) { } */
    set_SwitchedActiveSkillInfo(value: SwitchedActiveSkillInfo): void { this._SwitchedActiveSkillInfo = value; /* auto-property */ }
    /** @rva 0x7F9CD0  public void set_HasStepUpSkill(bool value) { } */
    set_HasStepUpSkill(value: boolean): void { this._HasStepUpSkill = value; /* auto-property */ }
    /** @rva 0x7F9AD0  public bool get_HasStepUpSkill() { } */
    get_HasStepUpSkill(): boolean { return this._HasStepUpSkill; /* auto-property */ }
    /** @rva 0x8A12E0  public void set_StepUpConsumeSp(int value) { } */
    set_StepUpConsumeSp(value: int): void { this._StepUpConsumeSp = value; /* auto-property */ }
    /** @rva 0x8A1210  public int get_StepUpConsumeSp() { } */
    get_StepUpConsumeSp(): int { return this._StepUpConsumeSp; /* auto-property */ }
    /** @rva 0x7538B0  public void set_StepUpLevel(int value) { } */
    set_StepUpLevel(value: int): void { this._StepUpLevel = value; /* auto-property */ }
    /** @rva 0x7535F0  public int get_StepUpLevel() { } */
    get_StepUpLevel(): int { return this._StepUpLevel; /* auto-property */ }
    /** @rva 0x736A10  public AddEnemyInfo[] get_AddEnemyInfos() { } */
    get_AddEnemyInfos(): AddEnemyInfo[] { return this._AddEnemyInfos; /* auto-property */ }
    /** @rva 0x736A50  public void set_AddEnemyInfos(AddEnemyInfo[] value) { } */
    set_AddEnemyInfos(value: AddEnemyInfo[]): void { this._AddEnemyInfos = value; /* auto-property */ }
    /** @rva 0x1812910  public bool get_IsRandomAttack() { } */
    get_IsRandomAttack(): boolean {
        return this.GetRandomDamageInternal().length > 0; // Any()
    }
    /** @rva 0x72F5E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x1811F70  public void .ctor(int id, int mainTargetUnitId, int sp, int beforeApplyPassiveSkillSp, int skillMstId, List<AffectedUnitNotice> noticeList, Dictionary<int, BattleUnit> battleUnitDic, List<GainSoloRaidBuffPointNotice> gainSoloRaidBuffPointNoticeList) { } */
    ctor$int_int_int_int_int_ListAffectedUnitNotice_DictionaryintBattleUnit_ListGainSoloRaidBuffPointNotice(id: int, mainTargetUnitId: int, sp: int, beforeApplyPassiveSkillSp: int, skillMstId: int, noticeList: List<AffectedUnitNotice>, battleUnitDic: Dictionary<int, BattleUnit>, gainSoloRaidBuffPointNoticeList: List<GainSoloRaidBuffPointNotice>): this {
        this._ActUnitId = id;
        this._MainTargetUnitId = mainTargetUnitId;
        this._ResultSP = sp;
        this._ResultSPBeforeApplyPassiveSkill = beforeApplyPassiveSkillSp;
        this._SkillMstId = skillMstId;
        this._AffectedUnitNoticeList = noticeList;
        this._GainSoloRaidBuffPointNoticeList = gainSoloRaidBuffPointNoticeList ?? [];
        const addEnemyInfos: List<AddEnemyInfo> = [];
        const summoned = noticeList.filter(info => info.IsSummoned) // <>c.b__42_0
            .map(info => dictGet(battleUnitDic, info.AffectedUnitId)); // <>c__DisplayClass42_0.b__1
        for (const unit of summoned) {
            const param = unit.BattleParameter;
            if (param instanceof QuestEnemyAppearanceParameter) addEnemyInfos.push(new AddEnemyInfo().ctor$int_int_int(unit.Id, param.QuestEnemyAppearanceMstId, unit.PositionId));
        }
        this._AddEnemyInfos = [...addEnemyInfos];
        if (battleUnitDic == null || !battleUnitDic.has(id)) return this;
        const actUnit = dictGet(battleUnitDic, id);
        const switchable = actUnit.SkillSet.SwitchableSkills.find(skill => skill.Id === skillMstId) ?? null; // <>c__DisplayClass42_0.b__2 (DisplayClass42_1.<0x10>)
        if (switchable == null) {
            const activeSkill = ref<ActiveSkillBase>(null!);
            const unitState = ref<SwitchSkillUnitState>(null!);
            if (actUnit.IsSwitchingActiveSkill<ActiveSkillBase>(ActiveSkillBase, activeSkill, unitState)) {
                const used = actUnit.SkillSet.GetSkill(skillMstId);
                if (used != null && used.constructor !== activeSkill.v.constructor) { // GetType() != GetType()
                    const info = new SwitchedActiveSkillInfo();
                    info._SkillType = unitState.v.SkillType;
                    info._ActiveSkillMstId = activeSkill.v.Id;
                    info._VisualEffectNo = unitState.v.visualEffectNo;
                    info._VisualEffectElement = unitState.v.TargetElement;
                    this._SwitchedActiveSkillInfo = info;
                }
            }
        } else {
            const state = actUnit.Condition.StateList.filter((s): s is SwitchSkillUnitState => s instanceof SwitchSkillUnitState)
                .find(s => s.switchSkillUniqueId === switchable.UniqueId) ?? null; // <>c__DisplayClass42_1.b__4
            if (state != null) {
                const info = new SwitchedActiveSkillInfo();
                info._SkillType = state.SkillType;
                info._ActiveSkillMstId = switchable.Id;
                info._VisualEffectNo = state.visualEffectNo;
                info._VisualEffectElement = state.TargetElement;
                this._SwitchedActiveSkillInfo = info;
            }
        }
        // 3.21.0: Step-Up level and its SP of the used skill
        const stepUpSkills = actUnit.SkillSet._StepUpSkills;
        if (stepUpSkills != null) {
            const stepped = stepUpSkills.find(s => s != null && s.Id === skillMstId) ?? null; // <>c__DisplayClass42_0.b__3
            if (stepped != null) {
                const level = StepUpSkillHandler.GetActiveStepUpLevel(actUnit, skillMstId);
                if (0 < level) {
                    this._StepUpLevel = level;
                    this._StepUpConsumeSp = StepUpSkillHandler.CalcStepUpTotalConsumeSp(stepped._ConsumeSP, level);
                }
            }
        }
        this._HasStepUpSkill = actUnit.Condition.GetUnitStateList<StepUpSkillUnitState>(StepUpSkillUnitState).length > 0; // Any()
        return this;
    }
    /** @rva 0x1811F20  public ValueTuple<int, AffectedUnitNotice.DamageInfo>[] GetRandomDamages() { } */
    GetRandomDamages(): any /* ValueTuple<int, AffectedUnitNotice.DamageInfo> */[] {
        return [...this.GetRandomDamageInternal()];
    }
    /** @rva 0x1811BF0  private IEnumerable<ValueTuple<int, AffectedUnitNotice.DamageInfo>> GetRandomDamageInternal() { } */
    GetRandomDamageInternal(): IEnumerable<any /* ValueTuple<int, AffectedUnitNotice.DamageInfo> */> {
        const all = this.AffectedUnitNoticeList.flatMap(notice => [...notice.BarrierDamages, ...notice.Damages] // <>c.b__32_0
            .map(info => [info.DamageValue, info] as [int, AffectedUnitNotice_DamageInfo])); // <>c.b__32_1
        if (all.some(damage => damage[1].Sequence > 0)) return all; // <>c.b__32_2
        return [];
    }
}
