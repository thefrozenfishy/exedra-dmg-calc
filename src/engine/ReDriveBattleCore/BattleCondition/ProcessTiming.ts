// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.


// ---- ReDriveBattleCore.BattleCondition.ProcessTiming  (TypeDefIndex 1076, public enum) ----
export const ProcessTiming = {
    None: 0,
    BattleStart: 1,
    WaveStart: 2,
    TurnStart: 3,
    AttackStart: 4,
    AttackEnd: 5,
    TurnEnd: 6,
    WaveEnd: 7,
    BattleEnd: 8,
    AfterProcess: 9,
    SeasonBuffActive: 10,
} as const;
export type ProcessTiming = (typeof ProcessTiming)[keyof typeof ProcessTiming];
