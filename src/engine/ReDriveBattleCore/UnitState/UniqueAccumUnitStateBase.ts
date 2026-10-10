// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
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
import type { UnitStateBase } from "./UnitStateBase";

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
    /** @rva 0x820790  public int get_AccumCountMax() { } */
    get_AccumCountMax(): int { return this._AccumCountMax; /* auto-property */ }
    /** @rva 0x821190  public void set_AccumCountMax(int value) { } */
    set_AccumCountMax(value: int): void { this._AccumCountMax = value; /* auto-property */ }
    /** @rva 0x9FD140  public int get_AccumCount() { } */
    get_AccumCount(): int { return this._AccumCount; /* auto-property */ }
    /** @rva 0xA10790  public void set_AccumCount(int value) { } */
    set_AccumCount(value: int): void { this._AccumCount = value; /* auto-property */ }
    /** @rva 0x9FD140 slot 27  public int get_StateIconNumber() { } */
    get_StateIconNumber(): int { return this._AccumCount; /* asm: mov eax, dword ptr [rcx + 0x9c]; ret */ }
    /** @rva 0x7360C0 slot 28  public bool get_IsShowZeroIfZero() { } */
    get_IsShowZeroIfZero(): boolean { return false; /* asm: xor al, al; ret */ }
    /** @rva 0x16DE010  protected void .ctor() { } */
    ctor(): this { return notPorted("UniqueAccumUnitStateBase..ctor", 0x16DE010); }
    /** @rva 0x16DE030  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("UniqueAccumUnitStateBase..ctor", 0x16DE030); }
    /** @rva 0x16DDAF0 slot 25  public bool Blend(UnitStateBase injectUnitState) { } */
    Blend(injectUnitState: UnitStateBase): boolean { return notPorted("UniqueAccumUnitStateBase.Blend", 0x16DDAF0); }
    /** @rva 0x16DDC10 slot 23  public override List<BattleUnit> GetAIFilteredTargets(BattleUnit userUnit, List<BattleUnit> targetUnitList, SkillType skillType, RangeType effectRange, GameDirectorBase gameDirector) { } */
    GetAIFilteredTargets(userUnit: BattleUnit, targetUnitList: List<BattleUnit>, skillType: SkillType, effectRange: RangeType, gameDirector: GameDirectorBase): List<BattleUnit> { return notPorted("UniqueAccumUnitStateBase.GetAIFilteredTargets", 0x16DDC10); }
    /** @rva 0x16DDDD0  private bool <GetAIFilteredTargets>b__15_1(BattleUnit unit) { } */
    $GetAIFilteredTargets$b__15_1(unit: BattleUnit): boolean { return notPorted("UniqueAccumUnitStateBase.<GetAIFilteredTargets>b__15_1", 0x16DDDD0); }
}
