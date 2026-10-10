// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.


// ---- Network.Definition.QuestBattle.EnemyType  (TypeDefIndex 3223, public enum) ----
export const EnemyType = {
    None: 0,
    Minion: 1,
    Witch: 2,
    Beast: 3,
    Magica: 4,
    Uwasa: 5,
    Nightmare: 6,
    NormalBeast: 7,
} as const;
export type EnemyType = (typeof EnemyType)[keyof typeof EnemyType];
