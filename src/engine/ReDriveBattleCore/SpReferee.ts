// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { SkillMstRecord } from "../Network/Definition/Skill/SkillMstRecord";
import { SkillMstModel } from "./Model/SkillMstModel";
import { BattleMstReaderBase } from "./Reader/BattleMstReaderBase";
import { notPorted } from "../runtime";
import type { int } from "../runtime";
import { BattleUnit_TeamType } from "./BattleUnit";

// ---- ReDriveBattleCore.SpReferee  (TypeDefIndex 460, public class) ----
export class SpReferee {
    /** 0x10 private int allySp */
    allySp: int = 0;
    /** 0x14 private int enemySp */
    enemySp: int = 0;
    get AllySp(): int { return this.get_AllySp(); }
    get EnemySp(): int { return this.get_EnemySp(); }
    /** @rva 0x7354F0  public int get_AllySp() { } */
    get_AllySp(): int { return this.allySp; /* asm: mov eax, dword ptr [rcx + 0x10]; ret */ }
    /** @rva 0x802350  public int get_EnemySp() { } */
    get_EnemySp(): int { return this.enemySp; /* asm: mov eax, dword ptr [rcx + 0x14]; ret */ }
    /** @rva 0x15E4850  public void Init() { } */
    Init(): void {
        this.allySp = 5;
        this.enemySp = 5;
    }
    /** @rva 0x15E4670  public void AddSp(BattleUnit.TeamType targetTeam, int sp) { } */
    AddSp(targetTeam: BattleUnit_TeamType, sp: int): void {
        if (targetTeam === BattleUnit_TeamType.Ally) {
            const v = this.allySp + sp;
            this.allySp = v < 0 ? 0 : (v < 7 ? v : 6);
            return;
        }
        if (targetTeam === BattleUnit_TeamType.Enemy) {
            const v = this.enemySp + sp;
            this.enemySp = v < 0 ? 0 : (v < 7 ? v : 6);
        }
    }
    /** @rva 0x15E47A0  public int GetSp(BattleUnit.TeamType targetTeam) { } */
    GetSp(targetTeam: BattleUnit_TeamType): int {
        if (targetTeam === BattleUnit_TeamType.Ally) return this.allySp;
        if (targetTeam === BattleUnit_TeamType.Enemy) return this.enemySp;
        throw new RangeError(`ArgumentOutOfRangeException: targetTeam ${targetTeam}`);
    }
    /** @rva 0x72F5E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
}
