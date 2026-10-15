// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { dictGet, notPorted } from "../runtime";
import type { Dictionary, List, float, int } from "../runtime";
import type { BattleUnit, BattleUnit_TeamType } from "./BattleUnit";

// ---- ReDriveBattleCore.TurnOrderUnitInfo  (TypeDefIndex 469, public class) ----
export class TurnOrderUnitInfo {
    /** 0x10 private int <BattleUnitId>k__BackingField */
    _BattleUnitId: int = 0;
    /** 0x14 private float <GaugeValue>k__BackingField */
    _GaugeValue: float = 0;
    /** 0x18 private int <ComboActionNum>k__BackingField */
    _ComboActionNum: int = 0;
    /** 0x1C private int <TurnOrderPriority>k__BackingField */
    _TurnOrderPriority: int = 0;
    /** 0x20 private BattleUnit.TeamType <TeamType>k__BackingField */
    _TeamType: BattleUnit_TeamType = 0 as BattleUnit_TeamType;
    get BattleUnitId(): int { return this.get_BattleUnitId(); }
    set BattleUnitId(v: int) { this.set_BattleUnitId(v); }
    get GaugeValue(): float { return this.get_GaugeValue(); }
    set GaugeValue(v: float) { this.set_GaugeValue(v); }
    get ComboActionNum(): int { return this.get_ComboActionNum(); }
    set ComboActionNum(v: int) { this.set_ComboActionNum(v); }
    get TurnOrderPriority(): int { return this.get_TurnOrderPriority(); }
    set TurnOrderPriority(v: int) { this.set_TurnOrderPriority(v); }
    get TeamType(): BattleUnit_TeamType { return this.get_TeamType(); }
    set TeamType(v: BattleUnit_TeamType) { this.set_TeamType(v); }
    /** @rva 0x7354F0  public int get_BattleUnitId() { } */
    get_BattleUnitId(): int { return this._BattleUnitId; /* auto-property */ }
    /** @rva 0x738D00  public void set_BattleUnitId(int value) { } */
    set_BattleUnitId(value: int): void { this._BattleUnitId = value; /* auto-property */ }
    /** @rva 0x8869D0  public float get_GaugeValue() { } */
    get_GaugeValue(): float { return this._GaugeValue; /* auto-property */ }
    /** @rva 0x8869F0  public void set_GaugeValue(float value) { } */
    set_GaugeValue(value: float): void { this._GaugeValue = value; /* auto-property */ }
    /** @rva 0x762820  public int get_ComboActionNum() { } */
    get_ComboActionNum(): int { return this._ComboActionNum; /* auto-property */ }
    /** @rva 0x8A1240  public void set_ComboActionNum(int value) { } */
    set_ComboActionNum(value: int): void { this._ComboActionNum = value; /* auto-property */ }
    /** @rva 0x7F8800  public int get_TurnOrderPriority() { } */
    get_TurnOrderPriority(): int { return this._TurnOrderPriority; /* auto-property */ }
    /** @rva 0x7F8820  public void set_TurnOrderPriority(int value) { } */
    set_TurnOrderPriority(value: int): void { this._TurnOrderPriority = value; /* auto-property */ }
    /** @rva 0x75DD70  public BattleUnit.TeamType get_TeamType() { } */
    get_TeamType(): BattleUnit_TeamType { return this._TeamType; /* auto-property */ }
    /** @rva 0x8A1230  public void set_TeamType(BattleUnit.TeamType value) { } */
    set_TeamType(value: BattleUnit_TeamType): void { this._TeamType = value; /* auto-property */ }
    /** @rva 0x72F5E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x15E7060  public void .ctor(BattleUnit unit) { } */
    ctor$BattleUnit(unit: BattleUnit): this {
        this._BattleUnitId = unit.Id;
        this._GaugeValue = unit.TurnGauge.GaugeValue;
        this._TurnOrderPriority = unit.TurnGauge.TurnOrderPriority;
        this._TeamType = unit.Team;
        const combo = unit.Condition.GetMaximumActionNumComboUnitState(unit);
        if (combo != null) this._ComboActionNum = combo.actionNum;
        return this;
    }
    /** @rva 0x15E6F70  public static List<TurnOrderUnitInfo> CreateList(List<int> turnOrderUnitIdList, Dictionary<int, BattleUnit> battleUnitDic) { } */
    static CreateList(turnOrderUnitIdList: List<int>, battleUnitDic: Dictionary<int, BattleUnit>): List<TurnOrderUnitInfo> {
        return turnOrderUnitIdList.map(id => new TurnOrderUnitInfo().ctor$BattleUnit(dictGet(battleUnitDic, id))); // DisplayClass22_0.b__0 (ctor inlined)
    }
}
