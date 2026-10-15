// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { List, int } from "../../runtime";
import type { RangeType } from "../../Network/Definition/Battle/RangeType";
import type { SkillType } from "../../Network/Definition/Battle/SkillType";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { IBlendable } from "./IBlendable";
import type { IStateIconNumberDisplayable } from "./IStateIconNumberDisplayable";
import { UniqueUnitStateBase } from "./UniqueUnitStateBase";
import { UnitStateBase } from "./UnitStateBase";

// ---- ReDriveBattleCore.UnitState.UniqueAccumUnitStateBase  (TypeDefIndex 667, public abstract class) ----
export abstract class UniqueAccumUnitStateBase extends UniqueUnitStateBase {  // implements IBlendable, IStateIconNumberDisplayable
    static readonly __interfaces: readonly string[] = ['IBlendable', 'IStateIconNumberDisplayable'];
    /** 0x98 private int <AccumCountMax>k__BackingField */
    _AccumCountMax: int = 0;
    /** 0x9C private int <AccumCount>k__BackingField */
    _AccumCount: int = 0;
    get AccumCountMax(): int { return this.get_AccumCountMax(); }
    set AccumCountMax(v: int) { this.set_AccumCountMax(v); }
    get AccumCount(): int { return this.get_AccumCount(); }
    set AccumCount(v: int) { this.set_AccumCount(v); }
    get StateIconNumber(): int { return this.get_StateIconNumber(); }
    get IsShowZeroIfZero(): boolean { return this.get_IsShowZeroIfZero(); }
    /** @rva 0x81F790  public int get_AccumCountMax() { } */
    get_AccumCountMax(): int { return this._AccumCountMax; /* auto-property */ }
    /** @rva 0x820190  public void set_AccumCountMax(int value) { } */
    set_AccumCountMax(value: int): void { this._AccumCountMax = value; /* auto-property */ }
    /** @rva 0xA06FF0  public int get_AccumCount() { } */
    get_AccumCount(): int { return this._AccumCount; /* auto-property */ }
    /** @rva 0xA070A0  public void set_AccumCount(int value) { } */
    set_AccumCount(value: int): void { this._AccumCount = value; /* auto-property */ }
    /** @rva 0xA06FF0 slot 27  public int get_StateIconNumber() { } */
    get_StateIconNumber(): int { return this._AccumCount; /* asm: mov eax, dword ptr [rcx + 0x9c]; ret */ }
    /** @rva 0x7350C0 slot 28  public bool get_IsShowZeroIfZero() { } */
    get_IsShowZeroIfZero(): boolean { return false; /* asm: xor al, al; ret */ }
    /** @rva 0x17084C0  protected void .ctor() { } */
    ctor(): this {
        this._AccumCount = 1;
        super.ctor();
        return this;
    }
    /** @rva 0x17084E0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        this._AccumCount = 1;
        this.iconName = "";
        super.ctor$AbilityEffectInfo(info);
        this._UniqueStatePatternMstId = info._EffectValue1;
        this._AccumCountMax = info._EffectValue2;
        return this;
    }
    /** @rva 0x1707FA0 slot 25  public bool Blend(UnitStateBase injectUnitState) { } */
    Blend(injectUnitState: UnitStateBase): boolean {
        if (injectUnitState.constructor !== this.constructor) return false; // GetType() != GetType()
        if (!(injectUnitState instanceof UniqueAccumUnitStateBase)) return false;
        if (injectUnitState._UniqueStatePatternMstId !== this._UniqueStatePatternMstId) return false;
        if (this._AccumCount < this._AccumCountMax) this._AccumCount++;
        this._RemainingTurn = injectUnitState._RemainingTurn;
        this.IsExemptPassingTurnOnce = injectUnitState.IsExemptPassingTurnOnce;
        return true;
    }
    /** @rva 0x17080C0 slot 23  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, RangeType effectRange, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, effectRange: RangeType, gameDirector: GameDirectorBase): List<BattleUnit> {
        let list = targetUnitList.filter(x => !x.get_IsDead()); // <>c.b__15_0
        if (list.length > 0) list = list.filter(unit => this.$GetAIFilteredTargets$b__15_1(unit));
        return list;
    }
    /** @rva 0x1708280  private bool <GetAIFilteredTargets>b__15_1(BattleUnit unit) { } */
    $GetAIFilteredTargets$b__15_1(unit: BattleUnit): boolean {
        const same = unit._Condition.GetSameStateList(this, false).filter((s): s is UniqueAccumUnitStateBase => s instanceof UniqueAccumUnitStateBase); // OfType (lazy, enumerated twice)
        if (same.some(state => state._AccumCount < state._AccumCountMax)) return true; // <>c.b__15_2
        return !same.some(state => state._EffectTurn === UnitStateBase.EffectTurnOfPermanent || state._RemainingTurn > 1); // <>c.b__15_3
    }
}
