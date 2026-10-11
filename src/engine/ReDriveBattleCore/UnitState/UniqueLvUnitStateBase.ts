// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { List, int } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { UniqueStateLevelMstModel } from "../Model/UniqueStateLevelMstModel";
import type { IBlendable } from "./IBlendable";
import type { IStateIconNumberDisplayable } from "./IStateIconNumberDisplayable";
import { UniqueUnitStateBase } from "./UniqueUnitStateBase";
import type { UnitStateBase } from "./UnitStateBase";

// ---- ReDriveBattleCore.UnitState.UniqueLvUnitStateBase  (TypeDefIndex 669, public abstract class) ----
export abstract class UniqueLvUnitStateBase extends UniqueUnitStateBase {  // implements IBlendable, IStateIconNumberDisplayable
    static readonly __interfaces: readonly string[] = ['IBlendable', 'IStateIconNumberDisplayable'];
    /** 0x98 private int <Lv>k__BackingField */
    _Lv: int = 0;
    /** 0x9C private int <HitCounter>k__BackingField */
    _HitCounter: int = 0;
    /** 0xA0 private int <UniqueStateLevelMstGroupId>k__BackingField */
    _UniqueStateLevelMstGroupId: int = 0;
    /** 0xA8 private List<UniqueStateLevelMstModel> lvMstListCache */
    lvMstListCache: List<UniqueStateLevelMstModel> = null!;
    get Lv(): int { return this.get_Lv(); }
    set Lv(v: int) { this.set_Lv(v); }
    get HitCounter(): int { return this.get_HitCounter(); }
    set HitCounter(v: int) { this.set_HitCounter(v); }
    get UniqueStateLevelMstGroupId(): int { return this.get_UniqueStateLevelMstGroupId(); }
    set UniqueStateLevelMstGroupId(v: int) { this.set_UniqueStateLevelMstGroupId(v); }
    get LvMstList(): List<UniqueStateLevelMstModel> { return this.get_LvMstList(); }
    get MaxLv(): int { return this.get_MaxLv(); }
    get StateIconNumber(): int { return this.get_StateIconNumber(); }
    get IsShowZeroIfZero(): boolean { return this.get_IsShowZeroIfZero(); }
    /** @rva 0x820790  public int get_Lv() { } */
    get_Lv(): int { return this._Lv; /* auto-property */ }
    /** @rva 0x821190  public void set_Lv(int value) { } */
    set_Lv(value: int): void { this._Lv = value; /* auto-property */ }
    /** @rva 0x9FD140  public int get_HitCounter() { } */
    get_HitCounter(): int { return this._HitCounter; /* auto-property */ }
    /** @rva 0xA10790  public void set_HitCounter(int value) { } */
    set_HitCounter(value: int): void { this._HitCounter = value; /* auto-property */ }
    /** @rva 0x754630  public int get_UniqueStateLevelMstGroupId() { } */
    get_UniqueStateLevelMstGroupId(): int { return this._UniqueStateLevelMstGroupId; /* auto-property */ }
    /** @rva 0x754900  public void set_UniqueStateLevelMstGroupId(int value) { } */
    set_UniqueStateLevelMstGroupId(value: int): void { this._UniqueStateLevelMstGroupId = value; /* auto-property */ }
    /** @rva 0x16DE8D0  public List<UniqueStateLevelMstModel> get_LvMstList() { } */
    get_LvMstList(): List<UniqueStateLevelMstModel> { return notPorted("UniqueLvUnitStateBase.get_LvMstList", 0x16DE8D0); }
    /** @rva 0x16DEA40  public int get_MaxLv() { } */
    get_MaxLv(): int { return notPorted("UniqueLvUnitStateBase.get_MaxLv", 0x16DEA40); }
    /** @rva 0x820790 slot 27  public int get_StateIconNumber() { } */
    get_StateIconNumber(): int { return this._Lv; /* asm: mov eax, dword ptr [rcx + 0x98]; ret */ }
    /** @rva 0x7360C0 slot 28  public bool get_IsShowZeroIfZero() { } */
    get_IsShowZeroIfZero(): boolean { return false; /* asm: xor al, al; ret */ }
    /** @rva 0x16DE240  protected void .ctor() { } */
    ctor(): this {
        this._Lv = 1;
        super.ctor();
        return this;
    }
    /** @rva 0x16DE260  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        this._Lv = 1;
        this.iconName = "";
        super.ctor$AbilityEffectInfo(info);
        this._UniqueStatePatternMstId = info._EffectValue1;
        this._UniqueStateLevelMstGroupId = info._EffectValue2;
        return this;
    }
    /** @rva 0x16DE5F0  protected bool TryCountUp() { } */
    TryCountUp(): boolean { return notPorted("UniqueLvUnitStateBase.TryCountUp", 0x16DE5F0); }
    /** @rva 0x16DE530  public int GetRequiredHitCount() { } */
    GetRequiredHitCount(): int {
        const model = this.LvMstList.find(m => this.$GetRequiredHitCount$b__24_0(m)) ?? null; // FirstOrDefault
        if (model == null) return 0;
        return model.record.conditionCount;
    }
    /** @rva 0x16DE420 slot 25  public bool Blend(UnitStateBase injectUnitState) { } */
    Blend(injectUnitState: UnitStateBase): boolean { return notPorted("UniqueLvUnitStateBase.Blend", 0x16DE420); }
    /** @rva 0x16DE8B0  private bool <get_LvMstList>b__14_0(UniqueStateLevelMstRecord r) { } */
    $get_LvMstList$b__14_0(r: any /* UniqueStateLevelMstRecord */): boolean { return notPorted("UniqueLvUnitStateBase.<get_LvMstList>b__14_0", 0x16DE8B0); }
    /** @rva 0x16DE880  private bool <GetRequiredHitCount>b__24_0(UniqueStateLevelMstModel m) { } */
    $GetRequiredHitCount$b__24_0(m: UniqueStateLevelMstModel): boolean {
        return m.record.level === this.Lv + 1;
    }
}
