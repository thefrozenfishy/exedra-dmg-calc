// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { int } from "../runtime";
import { AdditionalEnemyCondition } from "./AdditionalEnemyCondition";

// ---- ReDriveBattleCore.KnockDownAdditionalEnemyCondition  (TypeDefIndex 300, public class) ----
export class KnockDownAdditionalEnemyCondition extends AdditionalEnemyCondition {
    /** 0x10 private int targetEnemyAppearanceMstId */
    targetEnemyAppearanceMstId: int = 0;
    /** 0x14 private bool isFulfill */
    isFulfill: boolean = false;
    /** @rva 0x851290 slot 4  public override bool get_IsFulfill() { } */
    get_IsFulfill(): boolean { return this.isFulfill; /* asm: movzx eax, byte ptr [rcx + 0x14]; ret */ }
    /** @rva 0x72F5E0  protected void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x732EE0  public void .ctor(int enemyAppearanceMstId) { } */
    ctor$int(enemyAppearanceMstId: int): this {
        this.targetEnemyAppearanceMstId = enemyAppearanceMstId;
        return this;
    }
    /** @rva 0x13B2C00  public void CheckTargetEnemy(int enemyAppearanceMstId) { } */
    CheckTargetEnemy(enemyAppearanceMstId: int): void {
        if (this.targetEnemyAppearanceMstId === enemyAppearanceMstId) {
            this.isFulfill = true;
        }
    }
}
