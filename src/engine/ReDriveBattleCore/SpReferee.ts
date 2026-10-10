// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../runtime";
import type { int } from "../runtime";
import type { BattleUnit_TeamType } from "./BattleUnit";

// ---- ReDriveBattleCore.SpReferee  (TypeDefIndex 460, public class) ----
export class SpReferee {
    /** 0x10 private int allySp */
    allySp: int = 0;
    /** 0x14 private int enemySp */
    enemySp: int = 0;
    get AllySp(): int { return this.get_AllySp(); }
    get EnemySp(): int { return this.get_EnemySp(); }
    /** @rva 0x7364F0  public int get_AllySp() { } */
    get_AllySp(): int { return this.allySp; /* asm: mov eax, dword ptr [rcx + 0x10]; ret */ }
    /** @rva 0x803350  public int get_EnemySp() { } */
    get_EnemySp(): int { return this.enemySp; /* asm: mov eax, dword ptr [rcx + 0x14]; ret */ }
    /** @rva 0x15C07A0  public void Init() { } */
    Init(): void { return notPorted("SpReferee.Init", 0x15C07A0); }
    /** @rva 0x15C04B0  public void AddSp(BattleUnit.TeamType targetTeam, int sp) { } */
    AddSp(targetTeam: BattleUnit_TeamType, sp: int): void { return notPorted("SpReferee.AddSp", 0x15C04B0); }
    /** @rva 0x15C06F0  public int GetSp(BattleUnit.TeamType targetTeam) { } */
    GetSp(targetTeam: BattleUnit_TeamType): int { return notPorted("SpReferee.GetSp", 0x15C06F0); }
    /** @rva 0x15C05E0  public static int GetCalculationSp(int skillMstId) { } */
    static GetCalculationSp(skillMstId: int): int { return notPorted("SpReferee.GetCalculationSp", 0x15C05E0); }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
}
