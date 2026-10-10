// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../runtime";
import type { Dictionary, List, int } from "../runtime";
import type { BattleUnit } from "./BattleUnit";

// ---- ReDriveBattleCore.BattleUnitBundle  (TypeDefIndex 359, public class) ----
export class BattleUnitBundle {
    /** 0x10 public Dictionary<int, BattleUnit> dic */
    dic: Dictionary<int, BattleUnit> = null!;
    /** 0x18 public readonly List<BattleUnit> allyList */
    allyList: List<BattleUnit> = null!;
    /** 0x20 public readonly List<BattleUnit> enemyList */
    enemyList: List<BattleUnit> = null!;
    /** 0x28 public List<BattleUnit> activeList */
    activeList: List<BattleUnit> = null!;
    /** @rva 0x14907C0  public void AddUnit(BattleUnit unit) { } */
    AddUnit(unit: BattleUnit): void { return notPorted("BattleUnitBundle.AddUnit", 0x14907C0); }
    /** @rva 0x1490EA0  public void RemoveUnit(int unitId) { } */
    RemoveUnit$int(unitId: int): void { return notPorted("BattleUnitBundle.RemoveUnit", 0x1490EA0); }
    /** @rva 0x1491010  public void RemoveUnit(BattleUnit unit) { } */
    RemoveUnit$BattleUnit(unit: BattleUnit): void { return notPorted("BattleUnitBundle.RemoveUnit", 0x1491010); }
    /** @rva 0x1490BB0  public void RemoveAllEnemyUnits() { } */
    RemoveAllEnemyUnits(): void { return notPorted("BattleUnitBundle.RemoveAllEnemyUnits", 0x1490BB0); }
    /** @rva 0x1490AF0  private void OnUnitAliveStateChanged(BattleUnit unit) { } */
    OnUnitAliveStateChanged(unit: BattleUnit): void { return notPorted("BattleUnitBundle.OnUnitAliveStateChanged", 0x1490AF0); }
    /** @rva 0x1490510  private void AddToActiveUnitList(BattleUnit newUnit) { } */
    AddToActiveUnitList(newUnit: BattleUnit): void { return notPorted("BattleUnitBundle.AddToActiveUnitList", 0x1490510); }
    /** @rva 0x1490CD0  private void RemoveFromActiveUnitList(BattleUnit removeUnit) { } */
    RemoveFromActiveUnitList(removeUnit: BattleUnit): void { return notPorted("BattleUnitBundle.RemoveFromActiveUnitList", 0x1490CD0); }
    /** @rva 0x14908D0  public void OnDeserialized(StreamingContext _) { } */
    OnDeserialized(_: any /* StreamingContext */): void { return notPorted("BattleUnitBundle.OnDeserialized", 0x14908D0); }
    /** @rva 0x1491130  public void .ctor() { } */
    ctor(): this { return notPorted("BattleUnitBundle..ctor", 0x1491130); }
}
