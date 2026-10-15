// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.


// ---- Network.Definition.QuestOutGame.LinkHpType  (TypeDefIndex 2923, public enum) ----
export const LinkHpType = {
    None: 0,
    NormalLink: 1,
    BossLink: 2,
} as const;
export type LinkHpType = (typeof LinkHpType)[keyof typeof LinkHpType];
