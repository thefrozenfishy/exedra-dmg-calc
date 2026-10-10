// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { List } from "../../runtime";
import type { BattleUnit } from "../BattleUnit";
import type { AddEnemyInfo } from "./AddEnemyInfo";
import { CommandBase } from "./CommandBase";
import type { CommandType } from "./CommandType";

// ---- ReDriveBattleCore.Command.CommandAddEndlessEnemy  (TypeDefIndex 970, public class) ----
export class CommandAddEndlessEnemy extends CommandBase {
    /** 0x18 private AddEnemyInfo[] <AddEnemyInfos>k__BackingField */
    _AddEnemyInfos: AddEnemyInfo[] = null!;
    get AddEnemyInfos(): AddEnemyInfo[] { return this.get_AddEnemyInfos(); }
    set AddEnemyInfos(v: AddEnemyInfo[]) { this.set_AddEnemyInfos(v); }
    /** @rva 0x100E6E0 slot 4  public override CommandType GetCommandType() { } */
    GetCommandType(): CommandType { return 7 as CommandType; /* asm: mov eax, 7; ret */ }
    /** @rva 0x733E90  public AddEnemyInfo[] get_AddEnemyInfos() { } */
    get_AddEnemyInfos(): AddEnemyInfo[] { return this._AddEnemyInfos; /* auto-property */ }
    /** @rva 0x736AB0  public void set_AddEnemyInfos(AddEnemyInfo[] value) { } */
    set_AddEnemyInfos(value: AddEnemyInfo[]): void { this._AddEnemyInfos = value; /* auto-property */ }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x17E82D0  public void .ctor(in List<BattleUnit> enemyUnitList) { } */
    ctor$ListBattleUnit(enemyUnitList: List<BattleUnit>): this { return notPorted("CommandAddEndlessEnemy..ctor", 0x17E82D0); }
}
