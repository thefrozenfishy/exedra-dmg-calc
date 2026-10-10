// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.


// ---- ReDriveBattleCore.VisualEffectType  (TypeDefIndex 485, public static class) ----
export class VisualEffectType {
    /** public const string None */
    static readonly None: string = "";
    /** public const string ReceiveDamage */
    static readonly ReceiveDamage: string = "eff_cmn_rcv_dmg_character_001";
    /** public const string ReceiveSpAttackDamage */
    static readonly ReceiveSpAttackDamage: string = "eff_cmn_rcv_dmg_sp_001";
    /** public const string Buff */
    static readonly Buff: string = "eff_cmn_act_buff_appear_001";
    /** public const string Debuff */
    static readonly Debuff: string = "eff_cmn_act_debuff_appear_001";
    /** public const string Burn */
    static readonly Burn: string = "eff_cmn_act_state_burn_001";
    /** public const string Weakness */
    static readonly Weakness: string = "eff_cmn_act_state_weakness_001";
    /** public const string Poison */
    static readonly Poison: string = "eff_cmn_act_state_poison_001";
    /** public const string Stun */
    static readonly Stun: string = "eff_cmn_act_state_stun_002";
    /** public const string Curse */
    static readonly Curse: string = "eff_cmn_act_state_curse_001";
    /** public const string Bleed */
    static readonly Bleed: string = "eff_cmn_act_state_lacerate_001";
    /** public const string Vortex */
    static readonly Vortex: string = "eff_cmn_act_state_whirlpool_001";
    /** public const string Recovery */
    static readonly Recovery: string = "eff_cmn_act_recovery_appear_001";
    /** public const string Revival */
    static readonly Revival: string = "revival_temp";
    /** public const string CharacterBarrier */
    static readonly CharacterBarrier: string = "eff_cmn_act_barrier_appear_001";
    /** public const string NonCharacterBarrier */
    static readonly NonCharacterBarrier: string = "eff_cmn_act_barrier_appear_002";
    /** public const string CharacterBarrierHit */
    static readonly CharacterBarrierHit: string = "eff_cmn_act_barrier_active_001";
    /** public const string NonCharacterBarrierHit */
    static readonly NonCharacterBarrierHit: string = "eff_cmn_act_barrier_active_002";
    /** public const string Reflection */
    static readonly Reflection: string = "eff_cmn_act_reflection_active_001";
    /** public const string Cutout */
    static readonly Cutout: string = "eff_cmn_act_cutout_appear_001";
    /** public const string Invisible */
    static readonly Invisible: string = "eff_100702_act_invisible_001";
    /** public const string FireDamage */
    static readonly FireDamage: string = "eff_cmn_act_statehit_001";
    /** public const string AquaDamage */
    static readonly AquaDamage: string = "eff_cmn_act_statehit_002";
    /** public const string ForestDamage */
    static readonly ForestDamage: string = "eff_cmn_act_statehit_003";
    /** public const string LightDamage */
    static readonly LightDamage: string = "eff_cmn_act_statehit_004";
    /** public const string DarkDamage */
    static readonly DarkDamage: string = "eff_cmn_act_statehit_005";
    /** public const string NeutralDamage */
    static readonly NeutralDamage: string = "eff_cmn_act_statehit_006";
    /** public const string RecoveryBreak */
    static readonly RecoveryBreak: string = "eff_cmn_act_recovery_break_001";
    /** public const string DisabledDamageHit */
    static readonly DisabledDamageHit: string = "eff_639002_smoke_001";
    /** public const string SoloRaidDemonstrationBuffDirectionSingle */
    static readonly SoloRaidDemonstrationBuffDirectionSingle: string = "eff_SoloRaidDemonstrationBuffDirection_single";
    /** public const string SoloRaidDemonstrationBuffDirectionWhole */
    static readonly SoloRaidDemonstrationBuffDirectionWhole: string = "eff_SoloRaidDemonstrationBuffDirection_whole";
    /** public const string SoloRaidEndlessEnemySummon */
    static readonly SoloRaidEndlessEnemySummon: string = "eff_cmn_act_summon_001";
}
