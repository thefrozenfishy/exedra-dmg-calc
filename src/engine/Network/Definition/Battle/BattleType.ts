// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.


// ---- Network.Definition.Battle.BattleType  (TypeDefIndex 1293, public enum) ----
export const BattleType = {
    Solo: 1,
    Pvp: 2,
    Gve: 3,
    Gvg: 4,
    Exploration: 5,
    ScoreAttack: 6,
    Simulation: 7,
    MultiRaid: 8,
    SoloRaid: 9,
} as const;
export type BattleType = (typeof BattleType)[keyof typeof BattleType];
