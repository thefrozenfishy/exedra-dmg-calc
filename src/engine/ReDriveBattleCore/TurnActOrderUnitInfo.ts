// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../runtime";
import type { List, float, int } from "../runtime";
import type { ActOrderUnitInfo } from "./ActOrderUnitInfo";
import type { TurnOrderUnitInfo } from "./TurnOrderUnitInfo";

// ---- ReDriveBattleCore.TurnActOrderUnitInfo  (TypeDefIndex 465, public class) ----
export class TurnActOrderUnitInfo {
    /** 0x10 private int <InfoId>k__BackingField */
    _InfoId: int = 0;
    /** 0x14 private int <CurrentTurnUnitId>k__BackingField */
    _CurrentTurnUnitId: int = 0;
    /** 0x18 private List<TurnOrderUnitInfo> <TurnOrderUnitInfoList>k__BackingField */
    _TurnOrderUnitInfoList: List<TurnOrderUnitInfo> = null!;
    /** 0x20 private List<ActOrderUnitInfo> <ActOrderUnitInfoList>k__BackingField */
    _ActOrderUnitInfoList: List<ActOrderUnitInfo> = null!;
    /** 0x28 private int <NextRound>k__BackingField */
    _NextRound: int = 0;
    /** 0x2C private float <GaugeValueToNextRound>k__BackingField */
    _GaugeValueToNextRound: float = 0;
    /** 0x30 private float <ActiveCurrentSeasonBuffTurnGaugeValue>k__BackingField */
    _ActiveCurrentSeasonBuffTurnGaugeValue: float = 0;
    /** 0x34 private bool <IsIgnoreInfoOrder>k__BackingField */
    _IsIgnoreInfoOrder: boolean = false;
    get InfoId(): int { return this.get_InfoId(); }
    set InfoId(v: int) { this.set_InfoId(v); }
    get CurrentTurnUnitId(): int { return this.get_CurrentTurnUnitId(); }
    set CurrentTurnUnitId(v: int) { this.set_CurrentTurnUnitId(v); }
    get TurnOrderUnitInfoList(): List<TurnOrderUnitInfo> { return this.get_TurnOrderUnitInfoList(); }
    set TurnOrderUnitInfoList(v: List<TurnOrderUnitInfo>) { this.set_TurnOrderUnitInfoList(v); }
    get ActOrderUnitInfoList(): List<ActOrderUnitInfo> { return this.get_ActOrderUnitInfoList(); }
    set ActOrderUnitInfoList(v: List<ActOrderUnitInfo>) { this.set_ActOrderUnitInfoList(v); }
    get NextRound(): int { return this.get_NextRound(); }
    set NextRound(v: int) { this.set_NextRound(v); }
    get GaugeValueToNextRound(): float { return this.get_GaugeValueToNextRound(); }
    set GaugeValueToNextRound(v: float) { this.set_GaugeValueToNextRound(v); }
    get ActiveCurrentSeasonBuffTurnGaugeValue(): float { return this.get_ActiveCurrentSeasonBuffTurnGaugeValue(); }
    set ActiveCurrentSeasonBuffTurnGaugeValue(v: float) { this.set_ActiveCurrentSeasonBuffTurnGaugeValue(v); }
    get IsIgnoreInfoOrder(): boolean { return this.get_IsIgnoreInfoOrder(); }
    set IsIgnoreInfoOrder(v: boolean) { this.set_IsIgnoreInfoOrder(v); }
    /** @rva 0x7364F0  public int get_InfoId() { } */
    get_InfoId(): int { return this._InfoId; /* auto-property */ }
    /** @rva 0x739D00  public void set_InfoId(int value) { } */
    set_InfoId(value: int): void { this._InfoId = value; /* auto-property */ }
    /** @rva 0x803350  public int get_CurrentTurnUnitId() { } */
    get_CurrentTurnUnitId(): int { return this._CurrentTurnUnitId; /* auto-property */ }
    /** @rva 0x803540  public void set_CurrentTurnUnitId(int value) { } */
    set_CurrentTurnUnitId(value: int): void { this._CurrentTurnUnitId = value; /* auto-property */ }
    /** @rva 0x733E90  public List<TurnOrderUnitInfo> get_TurnOrderUnitInfoList() { } */
    get_TurnOrderUnitInfoList(): List<TurnOrderUnitInfo> { return this._TurnOrderUnitInfoList; /* auto-property */ }
    /** @rva 0x736AB0  public void set_TurnOrderUnitInfoList(List<TurnOrderUnitInfo> value) { } */
    set_TurnOrderUnitInfoList(value: List<TurnOrderUnitInfo>): void { this._TurnOrderUnitInfoList = value; /* auto-property */ }
    /** @rva 0x7369E0  public List<ActOrderUnitInfo> get_ActOrderUnitInfoList() { } */
    get_ActOrderUnitInfoList(): List<ActOrderUnitInfo> { return this._ActOrderUnitInfoList; /* auto-property */ }
    /** @rva 0x736A50  public void set_ActOrderUnitInfoList(List<ActOrderUnitInfo> value) { } */
    set_ActOrderUnitInfoList(value: List<ActOrderUnitInfo>): void { this._ActOrderUnitInfoList = value; /* auto-property */ }
    /** @rva 0x7637A0  public int get_NextRound() { } */
    get_NextRound(): int { return this._NextRound; /* auto-property */ }
    /** @rva 0x8A2250  public void set_NextRound(int value) { } */
    set_NextRound(value: int): void { this._NextRound = value; /* auto-property */ }
    /** @rva 0x9EF0C0  public float get_GaugeValueToNextRound() { } */
    get_GaugeValueToNextRound(): float { return this._GaugeValueToNextRound; /* auto-property */ }
    /** @rva 0x9EF100  public void set_GaugeValueToNextRound(float value) { } */
    set_GaugeValueToNextRound(value: float): void { this._GaugeValueToNextRound = value; /* auto-property */ }
    /** @rva 0x951C00  public float get_ActiveCurrentSeasonBuffTurnGaugeValue() { } */
    get_ActiveCurrentSeasonBuffTurnGaugeValue(): float { return this._ActiveCurrentSeasonBuffTurnGaugeValue; /* auto-property */ }
    /** @rva 0x951C70  public void set_ActiveCurrentSeasonBuffTurnGaugeValue(float value) { } */
    set_ActiveCurrentSeasonBuffTurnGaugeValue(value: float): void { this._ActiveCurrentSeasonBuffTurnGaugeValue = value; /* auto-property */ }
    /** @rva 0x9017B0  public bool get_IsIgnoreInfoOrder() { } */
    get_IsIgnoreInfoOrder(): boolean { return this._IsIgnoreInfoOrder; /* auto-property */ }
    /** @rva 0x9017C0  public void set_IsIgnoreInfoOrder(bool value) { } */
    set_IsIgnoreInfoOrder(value: boolean): void { this._IsIgnoreInfoOrder = value; /* auto-property */ }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
}
