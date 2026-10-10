// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.


// ---- Network.Definition.QuestBattle.SizeType  (TypeDefIndex 3224, public enum) ----
export const SizeType = {
    ExtraSmall: 0,
    Small: 1,
    Medium: 2,
    Large: 3,
    ExtraLarge: 4,
} as const;
export type SizeType = (typeof SizeType)[keyof typeof SizeType];
