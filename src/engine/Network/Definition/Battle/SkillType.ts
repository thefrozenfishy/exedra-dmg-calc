// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.


// ---- Network.Definition.Battle.SkillType  (TypeDefIndex 1292, public enum) ----
export const SkillType = {
    ActiveSkill: 1,
    SpecialAttack: 2,
    NormalAttack: 3,
    AdditionalSkill: 4,
    EtherBlow: 5,
} as const;
export type SkillType = (typeof SkillType)[keyof typeof SkillType];
