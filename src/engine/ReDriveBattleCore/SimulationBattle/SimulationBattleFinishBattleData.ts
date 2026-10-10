// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import { CommandBattlePhase_FinishPhaseData } from "../Command/CommandBattlePhase";
import type { GameSituationData } from "../GameSituationData";

// ---- ReDriveBattleCore.SimulationBattle.SimulationBattleFinishBattleData  (TypeDefIndex 819, public class) ----
export class SimulationBattleFinishBattleData extends CommandBattlePhase_FinishPhaseData {
    /** 0x18 private int <Round>k__BackingField */
    _Round: int = 0;
    /** 0x1C private int <Turn>k__BackingField */
    _Turn: int = 0;
    /** 0x20 private GameSituationData <GameSituationData>k__BackingField */
    _GameSituationData: GameSituationData = null!;
    get Round(): int { return this.get_Round(); }
    set Round(v: int) { this.set_Round(v); }
    get Turn(): int { return this.get_Turn(); }
    set Turn(v: int) { this.set_Turn(v); }
    get GameSituationData(): GameSituationData { return this.get_GameSituationData(); }
    set GameSituationData(v: GameSituationData) { this.set_GameSituationData(v); }
    /** @rva 0x763820  public int get_Round() { } */
    get_Round(): int { return this._Round; /* auto-property */ }
    /** @rva 0x8A2240  public void set_Round(int value) { } */
    set_Round(value: int): void { this._Round = value; /* auto-property */ }
    /** @rva 0x7F9800  public int get_Turn() { } */
    get_Turn(): int { return this._Turn; /* auto-property */ }
    /** @rva 0x7F9820  public void set_Turn(int value) { } */
    set_Turn(value: int): void { this._Turn = value; /* auto-property */ }
    /** @rva 0x7369E0  public GameSituationData get_GameSituationData() { } */
    get_GameSituationData(): GameSituationData { return this._GameSituationData; /* auto-property */ }
    /** @rva 0x736A50  public void set_GameSituationData(GameSituationData value) { } */
    set_GameSituationData(value: GameSituationData): void { this._GameSituationData = value; /* auto-property */ }
    /** @rva 0x7450E0  public void .ctor() { } */
    ctor(): this { return notPorted("SimulationBattleFinishBattleData..ctor", 0x7450E0); }
}
