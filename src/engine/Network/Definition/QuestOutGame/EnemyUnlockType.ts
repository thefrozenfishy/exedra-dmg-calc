// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.


// ---- Network.Definition.QuestOutGame.EnemyUnlockType  (TypeDefIndex 2926, public enum) ----
export const EnemyUnlockType = {
    None: 1,
    MiniTutorialNum: 2,
} as const;
export type EnemyUnlockType = (typeof EnemyUnlockType)[keyof typeof EnemyUnlockType];
