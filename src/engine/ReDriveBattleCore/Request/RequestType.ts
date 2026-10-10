// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.


// ---- ReDriveBattleCore.Request.RequestType  (TypeDefIndex 838, public enum) ----
export const RequestType = {
    None: 0,
    Skill: 1,
    Phase: 2,
    EndWave: 3,
    BeginWave: 4,
    UnitCondition: 5,
    SwitchDebug: 6,
    ChangeAutoControl: 7,
    ClientReady: 8,
    ChangeBattleSpeedType: 9,
    ChangePauseState: 10,
    TimeForward: 11,
    RegisterSpecialAttack: 12,
    GveMainTargetBreakCount: 13,
    SkipForcedAutomaticBattle: 14,
    MultiRaidSyncHpScore: 15,
    DebugFastEndBattle: 1000,
    DebugStatusEdit: 1001,
    DebugTurnGaugeEdit: 1002,
    DebugBreakEdit: 1003,
    DebugSkipWave: 1004,
} as const;
export type RequestType = (typeof RequestType)[keyof typeof RequestType];
