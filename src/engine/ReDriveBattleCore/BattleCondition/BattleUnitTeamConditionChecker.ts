// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { HashSet, List, int } from "../../runtime";
import type { AffectedUnitNotice } from "../AffectedUnitNotice";
import type { BattleConditionUtils_Condition } from "./BattleConditionUtils";
import { ConditionCheckerBase } from "./ConditionCheckerBase";
import type { BattleUnit } from "../BattleUnit";

// ---- ReDriveBattleCore.BattleCondition.BattleUnitTeamConditionChecker  (TypeDefIndex 1062, public class) ----
export class BattleUnitTeamConditionChecker extends ConditionCheckerBase {
    /** 0x18 private List<BattleUnit> battleUnits */
    battleUnits: List<BattleUnit> = null!;
    /** 0x20 private int SP */
    SP: int = 0;
    /** 0x24 private int breakedUnitTotalCount */
    breakedUnitTotalCount: int = 0;
    /** 0x28 private List<AffectedUnitNotice> affectedUnitNotices */
    affectedUnitNotices: List<AffectedUnitNotice> = null!;
    /** 0x30 private HashSet<string> appliedSkillEffectTypes */
    appliedSkillEffectTypes: HashSet<string> = null!;
    /** @rva 0x17E8180  public void .ctor(BattleConditionUtils.Condition condition, List<BattleUnit> battleUnits, List<AffectedUnitNotice> affectedUnitNotices, int SP, int breakedUnitTotalCount, HashSet<string> appliedSkillEffectTypes) { } */
    ctor$Condition_ListBattleUnit_ListAffectedUnitNotice_int_int_HashSetstring(condition: BattleConditionUtils_Condition, battleUnits: List<BattleUnit>, affectedUnitNotices: List<AffectedUnitNotice>, SP: int, breakedUnitTotalCount: int, appliedSkillEffectTypes: HashSet<string>): this { return notPorted("BattleUnitTeamConditionChecker..ctor", 0x17E8180); }
    /** @rva 0x17E5F30 slot 4  public override bool Check() { } */
    Check(): boolean { return notPorted("BattleUnitTeamConditionChecker.Check", 0x17E5F30); }
    /** @rva 0x17E7F50  private bool <Check>b__6_34(BattleUnit unit) { } */
    $Check$b__6_34(unit: BattleUnit): boolean { return notPorted("BattleUnitTeamConditionChecker.<Check>b__6_34", 0x17E7F50); }
    /** @rva 0x17E8060  private bool <Check>b__6_40(BattleUnit unit) { } */
    $Check$b__6_40(unit: BattleUnit): boolean { return notPorted("BattleUnitTeamConditionChecker.<Check>b__6_40", 0x17E8060); }
}
