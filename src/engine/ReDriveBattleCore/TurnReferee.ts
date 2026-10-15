// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { BattleUnit_TeamType } from "./BattleUnit";
import { TurnOrderUnitInfo } from "./TurnOrderUnitInfo";
import { CommandSoloRaidBuffFinish } from "./Command/CommandSoloRaidBuffFinish";
import { SoloRaidGameDirector } from "./SoloRaidGameDirector";
import { f32, notPorted } from "../runtime";
import type { IEnumerable, List, Ref, float, int } from "../runtime";
import type { BattleUnit } from "./BattleUnit";
import type { GameDirectorBase } from "./GameDirectorBase";

// ---- ReDriveBattleCore.TurnReferee  (TypeDefIndex 471, public class) ----
export class TurnReferee {
    /** 0x0 private static readonly int AddValueToEnemySequence */
    static AddValueToEnemySequence: int = 0;
    /** 0x4 public static readonly float FirstRoundTime */
    static FirstRoundTime: float = 0;
    /** 0x8 public static readonly float DefaultRoundTime */
    static DefaultRoundTime: float = 0;
    /** 0x10 private int <CurrentTurnUnitId>k__BackingField */
    _CurrentTurnUnitId: int = 0;
    /** 0x14 private int <CurrentTurn>k__BackingField */
    _CurrentTurn: int = 0;
    /** 0x18 private int turnOrderPriority */
    turnOrderPriority: int = 0;
    /** 0x1C private float elapsedActionTime */
    elapsedActionTime: float = 0;
    /** 0x20 private float deltaActionTime */
    deltaActionTime: float = 0;
    get CurrentTurnUnitId(): int { return this.get_CurrentTurnUnitId(); }
    set CurrentTurnUnitId(v: int) { this.set_CurrentTurnUnitId(v); }
    get CurrentTurn(): int { return this.get_CurrentTurn(); }
    set CurrentTurn(v: int) { this.set_CurrentTurn(v); }
    get NextTurnOrderPriority(): int { return this.get_NextTurnOrderPriority(); }
    get DeltaActionTime(): float { return this.get_DeltaActionTime(); }
    get CurrentRound(): int { return this.get_CurrentRound(); }
    /** @rva 0x7354F0  public int get_CurrentTurnUnitId() { } */
    get_CurrentTurnUnitId(): int { return this._CurrentTurnUnitId; /* auto-property */ }
    /** @rva 0x738D00  public void set_CurrentTurnUnitId(int value) { } */
    set_CurrentTurnUnitId(value: int): void { this._CurrentTurnUnitId = value; /* auto-property */ }
    /** @rva 0x802350  public int get_CurrentTurn() { } */
    get_CurrentTurn(): int { return this._CurrentTurn; /* auto-property */ }
    /** @rva 0x802540  public void set_CurrentTurn(int value) { } */
    set_CurrentTurn(value: int): void { this._CurrentTurn = value; /* auto-property */ }
    /** @rva 0x15E80B0  public int get_NextTurnOrderPriority() { } */
    get_NextTurnOrderPriority(): int {
        return ++this.turnOrderPriority;
    }
    /** @rva 0x96C430  public float get_DeltaActionTime() { } */
    get_DeltaActionTime(): float { return this.deltaActionTime; /* asm: movss xmm0, dword ptr [rcx + 0x20]; ret */ }
    /** @rva 0x15E8050  public int get_CurrentRound() { } */
    get_CurrentRound(): int {
        return TurnReferee.CalculateCurrentRound(this.elapsedActionTime);
    }
    /** @rva 0x15E70E0  private static int CalculateCurrentRound(float totalActionTime) { } */
    static CalculateCurrentRound(totalActionTime: float): int {
        if (totalActionTime < TurnReferee.FirstRoundTime) return 1;
        return Math.trunc(f32(f32(totalActionTime - TurnReferee.FirstRoundTime) / TurnReferee.DefaultRoundTime)) + 2;
    }
    /** @rva 0x15E7180  public int CalculateNextRound(List<BattleUnit> activeUnitList) { } */
    CalculateNextRound(activeUnitList: List<BattleUnit>): int {
        const list = [...activeUnitList];
        let time: float;
        if (list.length === 0) {
            time = this.elapsedActionTime;
        } else {
            const first = TurnReferee.SortByTurnOrder(list)[0];
            time = f32(first.TurnGauge.GaugeValue + this.elapsedActionTime);
        }
        return TurnReferee.CalculateCurrentRound(time); // inlined in the game
    }
    /** @rva 0x15E74F0  public List<int> ShiftNextTurn(List<BattleUnit> activeUnitList, GameDirectorBase gameDirector) { } */
    ShiftNextTurn(activeUnitList: List<BattleUnit>, gameDirector: GameDirectorBase): List<int> {
        this._CurrentTurn = this._CurrentTurn + 1;
        const list = [...activeUnitList];
        if (list.length === 0) {
            this._CurrentTurnUnitId = 0;
            return [];
        }
        const sorted = [...TurnReferee.SortByTurnOrder(list)];
        const next = sorted[0];
        this._CurrentTurnUnitId = next.Id;
        const elapsed = next.TurnGauge.GaugeValue;
        for (const unit of list) {
            unit.TurnGauge.DecreaseGaugeValue(elapsed, this.NextTurnOrderPriority, true); // inlined in the game
        }
        if (gameDirector instanceof SoloRaidGameDirector) {
            const buff = gameDirector.soloRaidBuffReferee;
            if (buff.isSeasonBuffActive) {
                buff.activeCurrentSeasonBuffTurnGaugeValue = Math.max(f32(buff.activeCurrentSeasonBuffTurnGaugeValue - elapsed), 0);
                if (buff.activeCurrentSeasonBuffTurnGaugeValue <= 0) {
                    buff.isSeasonBuffActive = false;
                    buff.activeCurrentSeasonBuffTurnGaugeValue = 0;
                    gameDirector.StoreCommand(new CommandSoloRaidBuffFinish().ctor$SoloRaidBuffReferee(gameDirector.soloRaidBuffReferee));
                }
            }
        }
        this.elapsedActionTime = f32(elapsed + this.elapsedActionTime);
        this.deltaActionTime = elapsed;
        return sorted.map(u => u.Id); // <ShiftNextTurn>b__22_0
    }
    /** @rva 0x15E7EE0  public void UpdateTurnOrder(List<BattleUnit> activeUnitList) { } */
    UpdateTurnOrder(activeUnitList: List<BattleUnit>): void {
        for (const unit of activeUnitList) unit.UpdateTurnGaugeBySpeed();
    }
    /** @rva 0x15E7390  public List<TurnOrderUnitInfo> GetTurnOrderUnitInfoList(List<BattleUnit> activeUnitList) { } */
    GetTurnOrderUnitInfoList(activeUnitList: List<BattleUnit>): List<TurnOrderUnitInfo> {
        return TurnReferee.SortByTurnOrder(activeUnitList).map(u => new TurnOrderUnitInfo().ctor$BattleUnit(u)); // b__24_0 (ctor inlined)
    }
    /** @rva 0x15E7D40  public static bool TryGetNextAllyTurnUnitId(List<BattleUnit> candidateUnitList, out int nextAllyTurnUnitId) { } */
    static TryGetNextAllyTurnUnitId(candidateUnitList: List<BattleUnit>, nextAllyTurnUnitId: Ref<int>): boolean {
        nextAllyTurnUnitId.v = 0;
        const allies = candidateUnitList.filter(u => u.Team === BattleUnit_TeamType.Ally); // b__25_0
        if (allies.length === 0) return false;
        nextAllyTurnUnitId.v = TurnReferee.SortByTurnOrder(allies)[0].Id;
        return true;
    }
    /** @rva 0x15E72B0  public float GetGaugeValueToNextRound() { } */
    GetGaugeValueToNextRound(): float {
        if (this.elapsedActionTime < TurnReferee.FirstRoundTime) return f32(TurnReferee.FirstRoundTime - this.elapsedActionTime);
        return f32(TurnReferee.DefaultRoundTime - fmodf(f32(this.elapsedActionTime - TurnReferee.FirstRoundTime), TurnReferee.DefaultRoundTime));
    }
    /** @rva 0x15E79C0  public static IEnumerable<BattleUnit> SortByTurnOrder(IEnumerable<BattleUnit> candidateUnits) { } */
    static SortByTurnOrder(candidateUnits: IEnumerable<BattleUnit>): IEnumerable<BattleUnit> {
        // OrderBy(gauge) ThenByDescending(TurnOrderPriority) ThenBy(Team == Enemy) ThenBy(Id); LINQ ordering is stable
        return [...candidateUnits].sort((a, b) =>
            (a.TurnGauge.GaugeValue - b.TurnGauge.GaugeValue)
            || (b.TurnGauge.TurnOrderPriority - a.TurnGauge.TurnOrderPriority)
            || ((a.Team === BattleUnit_TeamType.Enemy ? 1 : 0) - (b.Team === BattleUnit_TeamType.Enemy ? 1 : 0))
            || (a.Id - b.Id));
    }
    /** @rva 0x72F5E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x15E7FE0  private static void .cctor() { } */
    static cctor(): void {
        TurnReferee.AddValueToEnemySequence = 1000;
        TurnReferee.FirstRoundTime = 150;
        TurnReferee.DefaultRoundTime = 100;
    }
}

TurnReferee.cctor(); // C# static constructor

/** C fmodf (FUN_180702e18): remainder with the sign of the dividend, in float32. */
function fmodf(x: number, y: number): number {
    return f32(x % y);
}