// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.


// ---- ReDriveBattleCore.Command.CommandType  (TypeDefIndex 1040, public enum) ----
export const CommandType = {
    None: 0,
    BattlePhase: 1,
    Target: 2,
    Skill: 3,
    BeginTurn: 4,
    SituationSync: 5,
    AddEnemy: 6,
    AddEndlessEnemy: 7,
    EndWave: 8,
    BeginWave: 9,
    UnitCondition: 10,
    Reproduction: 11,
    Debug: 12,
    Initialize: 13,
    Finalize: 14,
    GveSyncHpDirection: 15,
    ExecuteCommonAct: 16,
    DecideSkillContent: 17,
    RefreshTurnActUnitOrder: 18,
    RefreshBattleUnitStatus: 19,
    GveMainTargetBreakCount: 20,
    ExecuteUnitHpGaugeRevive: 21,
    ExecuteModeChange: 22,
    Resend: 23,
    MultiRaidSyncHpScore: 24,
    MultiRaidSyncTotalDamage: 25,
    MultiRaidSyncHpResultForServer: 26,
    Error: 27,
    SoloRaidSyncBattleInfo: 28,
    SoloRaidSyncCountdown: 29,
    SoloRaidBuffActivate: 30,
    SoloRaidBuffFinish: 31,
    SyncLinkHp: 32,
    SyncModeChange: 33,
    StepUpSkill: 34,
} as const;
export type CommandType = (typeof CommandType)[keyof typeof CommandType];
