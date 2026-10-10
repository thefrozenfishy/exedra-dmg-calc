// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { BattleUnit } from "../BattleUnit";

// ---- ReDriveBattleCore.UnitState.ILvUp  (TypeDefIndex 741, public interface) ----
export interface ILvUp {
    readonly TargetLvUpType: ILvUp_LvUpType;
    /** @rva -1 slot 1  public abstract void LvUpProcess(BattleUnit userUnit, BattleUnit targetUnit); */
    LvUpProcess(userUnit: BattleUnit, targetUnit: BattleUnit): void;
}

// ---- ReDriveBattleCore.UnitState.ILvUp.LvUpType  (TypeDefIndex 740, public enum) ----
export const ILvUp_LvUpType = {
    AfterAttack: 1,
} as const;
export type ILvUp_LvUpType = (typeof ILvUp_LvUpType)[keyof typeof ILvUp_LvUpType];
