// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { bindDelegate, listRemove, notPorted } from "../runtime";
import type { Dictionary, List, int } from "../runtime";
import type { BattleUnit } from "./BattleUnit";
import { BattleUnit_TeamType } from "./BattleUnit";

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
    /** @rva 0x14A0AA0  public void AddUnit(BattleUnit unit) { } */
    AddUnit(unit: BattleUnit): void {
        this.dic.set(unit.Id, unit); // Dictionary.Add
        const list = unit.Team === BattleUnit_TeamType.Ally ? this.allyList : this.enemyList;
        list.push(unit);
        if (!unit.IsDead) this.AddToActiveUnitList(unit);
        unit.add_onAliveStateChanged(bindDelegate(this, this.OnUnitAliveStateChanged));
    }
    /** @rva 0x14A1180  public void RemoveUnit(int unitId) { } */
    RemoveUnit$int(unitId: int): void {
        const unit = this.dic.get(unitId);
        if (unit === undefined) return;
        this.dic.delete(unit.Id);
        const list = unit.Team === BattleUnit_TeamType.Ally ? this.allyList : this.enemyList;
        listRemove(list, unit);
        if (this.activeList.includes(unit)) this.RemoveFromActiveUnitList(unit);
        unit.remove_onAliveStateChanged(bindDelegate(this, this.OnUnitAliveStateChanged));
    }
    /** @rva 0x14A12F0  public void RemoveUnit(BattleUnit unit) { } */
    RemoveUnit$BattleUnit(unit: BattleUnit): void {
        this.dic.delete(unit.Id);
        const list = unit.Team === BattleUnit_TeamType.Ally ? this.allyList : this.enemyList;
        listRemove(list, unit);
        if (this.activeList.includes(unit)) this.RemoveFromActiveUnitList(unit);
        unit.remove_onAliveStateChanged(bindDelegate(this, this.OnUnitAliveStateChanged)); // inlined in the game
    }
    /** @rva 0x14A0E90  public void RemoveAllEnemyUnits() { } */
    RemoveAllEnemyUnits(): void {
        for (const unit of [...this.enemyList]) this.RemoveUnit$BattleUnit(unit); // ToList() copy; call target 0x1491010
    }
    /** @rva 0x14A0DD0  private void OnUnitAliveStateChanged(BattleUnit unit) { } */
    OnUnitAliveStateChanged(unit: BattleUnit): void {
        if (unit.IsDead && this.activeList.includes(unit)) {
            this.RemoveFromActiveUnitList(unit);
            return;
        }
        if (!unit.IsDead && !this.activeList.includes(unit)) this.AddToActiveUnitList(unit); // inlined in the game
    }
    /** @rva 0x14A07F0  private void AddToActiveUnitList(BattleUnit newUnit) { } */
    AddToActiveUnitList(newUnit: BattleUnit): void {
        if (this.activeList.includes(newUnit)) return;
        // the game builds a new list (copy + add) so running enumerations of the old one are not disturbed
        const old = this.activeList;
        this.activeList = [];
        for (const u of old) this.activeList.push(u);
        this.activeList.push(newUnit);
    }
    /** @rva 0x14A0FB0  private void RemoveFromActiveUnitList(BattleUnit removeUnit) { } */
    RemoveFromActiveUnitList(removeUnit: BattleUnit): void {
        if (!this.activeList.includes(removeUnit)) return;
        const old = this.activeList;
        this.activeList = [];
        for (const u of old) if (u !== removeUnit) this.activeList.push(u);
    }
    /** @rva 0x14A0BB0  public void OnDeserialized(StreamingContext _) { } */
    OnDeserialized(_: any /* StreamingContext */): void {
        for (const unit of this.dic.values()) {
            if (unit.Team === BattleUnit_TeamType.Ally) this.allyList.push(unit);
            else this.enemyList.push(unit);
            if (!unit.IsDead) this.AddToActiveUnitList(unit);
            unit.add_onAliveStateChanged(bindDelegate(this, this.OnUnitAliveStateChanged));
        }
    }
    /** @rva 0x14A1410  public void .ctor() { } */
    ctor(): this {
        this.dic = new Map(); // capacity 16
        this.allyList = []; // capacity 5
        this.enemyList = []; // capacity 8
        this.activeList = [];
        return this;
    }
}
