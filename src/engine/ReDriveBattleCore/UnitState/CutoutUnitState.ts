// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { AffectedUnitNotice } from "../AffectedUnitNotice";
import { AffectedUnitNoticeBundle } from "../AffectedUnitNoticeBundle";
import { LockTurnOrderUnitState } from "./LockTurnOrderUnitState";
import { isImpl, notPorted } from "../../runtime";
import type { IEnumerable, float, int } from "../../runtime";
import type { BattleType } from "../../Network/Definition/Battle/BattleType";
import { AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";

import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { EffectOriginType } from "./EffectOriginType";
import type { IBuff } from "./IBuff";
import type { ITurnEndTrigger } from "./ITurnEndTrigger";
import { UnitStateBase } from "./UnitStateBase";
import type { UnitStateBase_DirectionType } from "./UnitStateBase";
import { f32 } from "../../runtime";
import type { List } from "../../runtime";
import { AISkillTargetSelector } from "../AI/AISkillTargetSelector";
import { ref } from "../../runtime";

// ---- ReDriveBattleCore.UnitState.CutoutUnitState  (TypeDefIndex 561, public class) ----
export class CutoutUnitState extends UnitStateBase {  // implements IBuff, ITurnEndTrigger
    static readonly __interfaces: readonly string[] = ['IBuff', 'ITurnEndTrigger'];
    /** private const int DebuffRemoveNumAll */
    static readonly DebuffRemoveNumAll: int = 0;
    /** 0x88 protected int hasteRate */
    hasteRate: int = 0;
    /** 0x8C protected int debuffRemoveNum */
    debuffRemoveNum: int = 0;
    /** 0x90 private bool <IsActivated>k__BackingField */
    _IsActivated: boolean = false;
    /** 0x91 private bool <IsUserUnitLockTurnOrderUnitState>k__BackingField */
    _IsUserUnitLockTurnOrderUnitState: boolean = false;
    get HasteRatio(): float { return this.get_HasteRatio(); }
    get DebuffRemoveNum(): int { return this.get_DebuffRemoveNum(); }
    get IsActivated(): boolean { return this.get_IsActivated(); }
    set IsActivated(v: boolean) { this.set_IsActivated(v); }
    get IsUserUnitLockTurnOrderUnitState(): boolean { return this.get_IsUserUnitLockTurnOrderUnitState(); }
    set IsUserUnitLockTurnOrderUnitState(v: boolean) { this.set_IsUserUnitLockTurnOrderUnitState(v); }
    /** @rva 0x7421D0 slot 6  public override UnitStateBase.DirectionType get_Direction() { } */
    get_Direction(): UnitStateBase_DirectionType { return 0 as UnitStateBase_DirectionType; /* asm: xor eax, eax; ret */ }
    /** @rva 0x15DE370 slot 7  public override string get_IconName() { } */
    get_IconName(): string {
        return "battle_icon_cutout";
    }
    /** @rva 0x15DE320 slot 13  public override string get_GiveVisualEffectName() { } */
    get_GiveVisualEffectName(): string {
        return "eff_cmn_act_buff_appear_001";
    }
    /** @rva 0x15DE350  public float get_HasteRatio() { } */
    get_HasteRatio(): float {
        return f32(f32(this.hasteRate) / 10);
    }
    /** @rva 0xA06F50  public int get_DebuffRemoveNum() { } */
    get_DebuffRemoveNum(): int { return this.debuffRemoveNum; /* asm: mov eax, dword ptr [rcx + 0x8c]; ret */ }
    /** @rva 0x9F8550  public bool get_IsActivated() { } */
    get_IsActivated(): boolean { return this._IsActivated; /* auto-property */ }
    /** @rva 0x9F7970  public void set_IsActivated(bool value) { } */
    set_IsActivated(value: boolean): void { this._IsActivated = value; /* auto-property */ }
    /** @rva 0xC7A0B0  public bool get_IsUserUnitLockTurnOrderUnitState() { } */
    get_IsUserUnitLockTurnOrderUnitState(): boolean { return this._IsUserUnitLockTurnOrderUnitState; /* auto-property */ }
    /** @rva 0xC7A370  public void set_IsUserUnitLockTurnOrderUnitState(bool value) { } */
    set_IsUserUnitLockTurnOrderUnitState(value: boolean): void { this._IsUserUnitLockTurnOrderUnitState = value; /* auto-property */ }
    /** @rva 0x15D9DA0  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x15DE2E0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this.hasteRate = info._EffectValue1;
        this.debuffRemoveNum = info._EffectValue2;
        return this;
    }
    /** @rva 0x15DDA90 slot 17  public override void SetTriggeringInfo(EffectOriginType effectOrigin, BattleUnit userUnit, bool isOwnSkill = False, bool isConditionActivation = False, BattleType battleType = 1) { } */
    SetTriggeringInfo(effectOrigin: EffectOriginType, userUnit: BattleUnit, isOwnSkill: boolean = false, isConditionActivation: boolean = false, battleType: BattleType = 1 as BattleType): void {
        super.SetTriggeringInfo(effectOrigin, userUnit, isOwnSkill, isConditionActivation, battleType);
        let has = false;
        if (userUnit != null) {
            has = userUnit._Condition.TryGetUnitState(LockTurnOrderUnitState, ref<LockTurnOrderUnitState>(null!), false);
        }
        this._IsUserUnitLockTurnOrderUnitState = has;
    }
    /** @rva 0x15DD830 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder {
        const list: List<(a0: IEnumerable<BattleUnit>) => IEnumerable<BattleUnit>> = [];
        list.push(AISkillTargetSelector.UnitFilterByMainTarget);
        list.push(AISkillTargetSelector.UnitFilterByRoleAttacker);
        list.push(AISkillTargetSelector.UnitFilterWithMaxAtk);
        return new AISkillTargetSelector_UnitFilterFuncOrder().ctor$ListFuncIEnumerableBattleUnitIEnumerableBattleUnit(list);
    }
    /** @rva 0x15DDB50 slot 25  public AffectedUnitNoticeBundle TriggeringAtTurnEnd(BattleUnit userUnit, GameDirectorBase gameDirector) { } */
    TriggeringAtTurnEnd(userUnit: BattleUnit, gameDirector: GameDirectorBase): AffectedUnitNoticeBundle {
        const bundle = new AffectedUnitNoticeBundle().ctor();
        if (userUnit._Condition._StateList.some(s => s instanceof CutoutUnitState && s._IsActivated)) { // OfType<CutoutUnitState>().Any(b__25_0)
            this._IsActivated = true;
            this._ShouldBeRemovedNow = true;
            return bundle;
        }
        let notice = new AffectedUnitNotice().ctor$int(userUnit._Id);
        const debuffs = userUnit._Condition._StateList
            .filter(s => s._EffectOrigin === 1) // b__25_1
            .filter(s => isImpl(s, "IDebuff") && !s._ShouldBeRemovedNow) // b__25_2
            .reverse();
        const count = this.debuffRemoveNum < 1 ? debuffs.length : this.debuffRemoveNum;
        for (const state of debuffs.slice(0, Math.max(0, count))) state._ShouldBeRemovedNow = true; // Take(count)
        if (!this._IsUserUnitLockTurnOrderUnitState) {
            const turnOrderPriority = gameDirector.turnActSystem.turnReferee.get_NextTurnOrderPriority();
            // UnitTurnGauge.AddGaugeValue inlined in the game
            const variation = userUnit._TurnGauge.AddGaugeValue(-f32(this.hasteRate / 1000), turnOrderPriority);
            notice = AffectedUnitNotice.op_Addition(notice, AffectedUnitNotice.CreateByTurnGaugeVariation(userUnit._Id, variation));
        }
        notice.NonDamageVisualEffectList.push("eff_cmn_act_cutout_appear_001");
        bundle.Add(notice);
        this._IsActivated = true;
        this._ShouldBeRemovedNow = true;
        return bundle;
    }
}
