// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { IEnumerable, int } from "../../runtime";
import { AISkillTargetSelector_UnitFilterFuncOrder } from "../AI/AISkillTargetSelector";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import { UnitStateBase } from "./UnitStateBase";
import type { UnitStateBase_DirectionType } from "./UnitStateBase";
import type { List } from "../../runtime";

// ---- ReDriveBattleCore.UnitState.CountdownStartUnitState  (TypeDefIndex 557, public class) ----
export class CountdownStartUnitState extends UnitStateBase {
    /** 0x88 protected int startCountdown */
    startCountdown: int = 0;
    /** 0x8C protected int countdown */
    countdown: int = 0;
    /** 0x90 protected int canCancelMaxTotalDamage */
    canCancelMaxTotalDamage: int = 0;
    /** @rva 0x15B3A90  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x7431D0 slot 6  public override UnitStateBase.DirectionType get_Direction() { } */
    get_Direction(): UnitStateBase_DirectionType { return 0 as UnitStateBase_DirectionType; /* asm: xor eax, eax; ret */ }
    /** @rva 0x76F830 slot 12  public override bool get_IsDontShowAddStateFlip() { } */
    get_IsDontShowAddStateFlip(): boolean { return true; /* asm: mov al, 1; ret */ }
    /** @rva 0x15B7350  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("CountdownStartUnitState..ctor", 0x15B7350); }
    /** @rva 0x15B7290 slot 18  public override void OnAddedToCondition(BattleUnit unit, GameDirectorBase gameDirector) { } */
    OnAddedToCondition(unit: BattleUnit, gameDirector: GameDirectorBase): void { return notPorted("CountdownStartUnitState.OnAddedToCondition", 0x15B7290); }
    /** @rva 0x15B7190 slot 21  public override bool CanAddTo(BattleUnit unit) { } */
    CanAddTo(unit: BattleUnit): boolean { return notPorted("CountdownStartUnitState.CanAddTo", 0x15B7190); }
    /** @rva 0x15B7200 slot 24  public override AISkillTargetSelector.UnitFilterFuncOrder GetUnitFilterFuncOrder(BattleUnit userUnit, IEnumerable<BattleUnit> candidateUnits) { } */
    GetUnitFilterFuncOrder(userUnit: BattleUnit, candidateUnits: IEnumerable<BattleUnit>): AISkillTargetSelector_UnitFilterFuncOrder {
        const list: List<(a0: IEnumerable<BattleUnit>) => IEnumerable<BattleUnit>> = [];
        return new AISkillTargetSelector_UnitFilterFuncOrder().ctor$ListFuncIEnumerableBattleUnitIEnumerableBattleUnit(list);
    }
}
