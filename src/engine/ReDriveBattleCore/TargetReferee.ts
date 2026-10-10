// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../runtime";
import type { int } from "../runtime";
import type { BattleUnit_TeamType } from "./BattleUnit";

// ---- ReDriveBattleCore.TargetReferee  (TypeDefIndex 463, public class) ----
export class TargetReferee {
    /** 0x10 private int allyAttackTargetId */
    allyAttackTargetId: int = 0;
    /** 0x14 private int allyFriendTargetId */
    allyFriendTargetId: int = 0;
    /** 0x18 private int enemyAttackTargetId */
    enemyAttackTargetId: int = 0;
    /** 0x1C private int enemyFriendTargetId */
    enemyFriendTargetId: int = 0;
    /** 0x20 private int attackTargetIdBeforeEndlessSupply */
    attackTargetIdBeforeEndlessSupply: int = 0;
    get AllyAttackTargetId(): int { return this.get_AllyAttackTargetId(); }
    get AllyFriendTargetId(): int { return this.get_AllyFriendTargetId(); }
    get EnemyAttackTargetId(): int { return this.get_EnemyAttackTargetId(); }
    get EnemyFriendTargetId(): int { return this.get_EnemyFriendTargetId(); }
    get AttackTargetIdBeforeEndlessSupply(): int { return this.get_AttackTargetIdBeforeEndlessSupply(); }
    /** @rva 0x7364F0  public int get_AllyAttackTargetId() { } */
    get_AllyAttackTargetId(): int { return this.allyAttackTargetId; /* asm: mov eax, dword ptr [rcx + 0x10]; ret */ }
    /** @rva 0x803350  public int get_AllyFriendTargetId() { } */
    get_AllyFriendTargetId(): int { return this.allyFriendTargetId; /* asm: mov eax, dword ptr [rcx + 0x14]; ret */ }
    /** @rva 0x763820  public int get_EnemyAttackTargetId() { } */
    get_EnemyAttackTargetId(): int { return this.enemyAttackTargetId; /* asm: mov eax, dword ptr [rcx + 0x18]; ret */ }
    /** @rva 0x7F9800  public int get_EnemyFriendTargetId() { } */
    get_EnemyFriendTargetId(): int { return this.enemyFriendTargetId; /* asm: mov eax, dword ptr [rcx + 0x1c]; ret */ }
    /** @rva 0x75ED70  public int get_AttackTargetIdBeforeEndlessSupply() { } */
    get_AttackTargetIdBeforeEndlessSupply(): int { return this.attackTargetIdBeforeEndlessSupply; /* asm: mov eax, dword ptr [rcx + 0x20]; ret */ }
    /** @rva 0x15C0AB0  public void ChangeTarget(BattleUnit.TeamType targetTeam, TargetReferee.TargetType targetType, int targetUnitId) { } */
    ChangeTarget(targetTeam: BattleUnit_TeamType, targetType: TargetReferee_TargetType, targetUnitId: int): void { return notPorted("TargetReferee.ChangeTarget", 0x15C0AB0); }
    /** @rva 0x15C0AF0  public int GetAttackTargetId(BattleUnit.TeamType teamType) { } */
    GetAttackTargetId(teamType: BattleUnit_TeamType): int { return notPorted("TargetReferee.GetAttackTargetId", 0x15C0AF0); }
    /** @rva 0x15C0BA0  public int GetFriendTargetId(BattleUnit.TeamType teamType) { } */
    GetFriendTargetId(teamType: BattleUnit_TeamType): int { return notPorted("TargetReferee.GetFriendTargetId", 0x15C0BA0); }
    /** @rva 0x15C0AA0  public void CacheAttackTargetBeforeEndlessSupply() { } */
    CacheAttackTargetBeforeEndlessSupply(): void { return notPorted("TargetReferee.CacheAttackTargetBeforeEndlessSupply", 0x15C0AA0); }
    /** @rva 0x7305E0  public void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
}

// ---- ReDriveBattleCore.TargetReferee.TargetType  (TypeDefIndex 462, public enum) ----
export const TargetReferee_TargetType = {
    Attack: 0,
    Friend: 1,
} as const;
export type TargetReferee_TargetType = (typeof TargetReferee_TargetType)[keyof typeof TargetReferee_TargetType];
