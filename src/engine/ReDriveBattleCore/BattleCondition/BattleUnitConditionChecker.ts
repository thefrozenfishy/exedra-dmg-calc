// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { List } from "../../runtime";
import type { AffectedUnitNotice } from "../AffectedUnitNotice";
import type { BattleConditionUtils_Condition } from "./BattleConditionUtils";
import { ConditionCheckerBase } from "./ConditionCheckerBase";
import type { BattleUnit } from "../BattleUnit";

// ---- ReDriveBattleCore.BattleCondition.BattleUnitConditionChecker  (TypeDefIndex 1046, public class) ----
export class BattleUnitConditionChecker extends ConditionCheckerBase {
    /** 0x18 private BattleUnit battleUnit */
    battleUnit: BattleUnit = null!;
    /** 0x20 private BattleUnit selfUnit */
    selfUnit: BattleUnit = null!;
    /** 0x28 private BattleUnit actorUnit */
    actorUnit: BattleUnit = null!;
    /** 0x30 private BattleUnit mainTargetUnit */
    mainTargetUnit: BattleUnit = null!;
    /** 0x38 private List<BattleUnit> friendUnits */
    friendUnits: List<BattleUnit> = null!;
    /** 0x40 private List<BattleUnit> opponentUnits */
    opponentUnits: List<BattleUnit> = null!;
    /** 0x48 private AffectedUnitNotice notice */
    notice: AffectedUnitNotice = null!;
    /** @rva 0x17E5D80  public void .ctor(BattleConditionUtils.Condition condition, BattleUnit battleUnit, BattleUnit selfUnit, BattleUnit actorUnit, BattleUnit mainTargetUnit, List<BattleUnit> friendUnits, List<BattleUnit> opponentUnits, AffectedUnitNotice notice) { } */
    ctor$Condition_BattleUnit_BattleUnit_BattleUnit_BattleUnit_ListBattleUnit_ListBattleUnit_AffectedUnitNotice(condition: BattleConditionUtils_Condition, battleUnit: BattleUnit, selfUnit: BattleUnit, actorUnit: BattleUnit, mainTargetUnit: BattleUnit, friendUnits: List<BattleUnit>, opponentUnits: List<BattleUnit>, notice: AffectedUnitNotice): this { return notPorted("BattleUnitConditionChecker..ctor", 0x17E5D80); }
    /** @rva 0x17E3F10 slot 4  public override bool Check() { } */
    Check(): boolean { return notPorted("BattleUnitConditionChecker.Check", 0x17E3F10); }
}
