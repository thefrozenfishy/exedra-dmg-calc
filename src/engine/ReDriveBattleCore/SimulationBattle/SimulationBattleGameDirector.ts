// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { int } from "../../runtime";
import type { BattleType } from "../../Network/Definition/Battle/BattleType";
import type { AdditionalEnemyReferee } from "../AdditionalEnemyReferee";
import { GameDirectorBase } from "../GameDirectorBase";
import type { IBattleUnitProvider } from "../IBattleUnitProvider";
import type { SimulationDataForMultiRaid } from "./SimulationDataForMultiRaid";
import type { WaveReferee } from "../WaveReferee";

// ---- ReDriveBattleCore.SimulationBattle.SimulationBattleGameDirector  (TypeDefIndex 821, public class) ----
export class SimulationBattleGameDirector extends GameDirectorBase {
    /** 0x80 private readonly WaveReferee waveReferee */
    waveReferee: WaveReferee = null!;
    /** 0x88 private readonly AdditionalEnemyReferee additionalEnemyReferee */
    additionalEnemyReferee: AdditionalEnemyReferee = null!;
    /** @rva 0x100E6E0 slot 4  public override BattleType get_BattleType() { } */
    get_BattleType(): BattleType { return 7 as BattleType; /* asm: mov eax, 7; ret */ }
    /** @rva 0x730170  public void SetupBattleStage(int questStageMstId, int repeatNum, IBattleUnitProvider unitProvider, SimulationDataForMultiRaid simulationDataForMultiRaid, int campUpDmg = 0, int campUpBreakPointDmg = 0) { } */
    SetupBattleStage(questStageMstId: int, repeatNum: int, unitProvider: IBattleUnitProvider, simulationDataForMultiRaid: SimulationDataForMultiRaid, campUpDmg?: int /* = 0 */, campUpBreakPointDmg?: int /* = 0 */): void { /* asm: ret 0 */ }
    /** @rva 0x730170 slot 5  protected override void StoreBattlePhaseCommand() { } */
    StoreBattlePhaseCommand(): void { /* asm: ret 0 */ }
    /** @rva 0x16D7E50  public void .ctor() { } */
    ctor(): this { return notPorted("SimulationBattleGameDirector..ctor", 0x16D7E50); }
}
