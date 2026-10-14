// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { BattleUnitSituationData } from "./BattleUnitSituationData";

// ---- ReDriveBattleCore.GameSituationData  (TypeDefIndex 406, public class) ----
export class GameSituationData {
    /** 0x10 private BattleUnitSituationData[] <BattleUnitSituationDatas>k__BackingField */
    _BattleUnitSituationDatas: BattleUnitSituationData[] = null!;
    get BattleUnitSituationDatas(): BattleUnitSituationData[] { return this.get_BattleUnitSituationDatas(); }
    set BattleUnitSituationDatas(v: BattleUnitSituationData[]) { this.set_BattleUnitSituationDatas(v); }
    /** @rva 0x730C50  public BattleUnitSituationData[] get_BattleUnitSituationDatas() { } */
    get_BattleUnitSituationDatas(): BattleUnitSituationData[] { return this._BattleUnitSituationDatas; /* auto-property */ }
    /** @rva 0x730C60  public void set_BattleUnitSituationDatas(BattleUnitSituationData[] value) { } */
    set_BattleUnitSituationDatas(value: BattleUnitSituationData[]): void { this._BattleUnitSituationDatas = value; /* auto-property */ }
    /** @rva 0x149CF30  public void .ctor() { } */
    ctor(): this {
        this._BattleUnitSituationDatas = []; // Array.Empty<BattleUnitSituationData>()
        return this;
    }
}
