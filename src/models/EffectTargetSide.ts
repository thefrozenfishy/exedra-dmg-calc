// GENERATED from the 3.19.0 decompilation - do not edit by hand.
// Which side each ability effect type targets (AbilityEffectBase.TargetSide):
//  - UnitStateFactory types are wrapped in StateAbilityEffect, whose .ctor (RVA 0x19023d0)
//    sets TargetSide = (state.Direction != Positive) - i.e. buffs target your own side,
//    debuffs the opponent; Neutral states use INeutralState.TargetSide.
//  - AbilityEffectFactory types set TargetSide in their own .ctor.
// Covers every effect type string in UnitStateFactory$$.cctor and AbilityEffectFactory$$.cctor.
export type TargetSide = "Friend" | "Opponent";
export const EFFECT_TARGET_SIDE: Record<string, TargetSide> = {
    ADDITIONAL_DAMAGE: "Friend", // AdditionalDamageUnitState Direction=Positive
    ADD_BUFF_TURN: "Friend", // AddBuffTurnUnitState Direction=Positive
    ADD_DEBUFF_TURN: "Friend", // AddDebuffTurnUnitState Direction=Positive
    BARRIER: "Friend", // BarrierUnitState Direction=Positive
    BLEED_ATK: "Opponent", // BleedAtkUnitState Direction=Negative
    BLEED_DEF: "Opponent", // BleedDefUnitState Direction=Negative
    BLEED_HP: "Opponent", // BleedHpUnitState Direction=Negative
    BURN_ATK: "Opponent", // BurnAtkUnitState Direction=Negative
    BURN_DEF: "Opponent", // BurnDefUnitState Direction=Negative
    BURN_HP: "Opponent", // BurnHpUnitState Direction=Negative
    COMBO: "Friend", // ComboUnitState Direction=Positive
    CONTINUOUS_RECOVERY: "Friend", // ContinuousRecoveryUnitState Direction=Positive
    COUNT: "Opponent", // CountUnitState Direction=Neutral
    COUNTDOWN_START: "Friend", // CountdownStartUnitState Direction=Positive
    CPN_UP_GIV_BREAK_POINT_DMG_RATIO: "Friend", // CpnUpGivBreakPointDmgRatioUnitState Direction=Positive
    CPN_UP_GIV_DMG_RATIO: "Friend", // CpnUpGivDmgRatioUnitState Direction=Positive
    CURSE_ATK: "Opponent", // CurseAtkUnitState Direction=Negative
    CURSE_DEF: "Opponent", // CurseDefUnitState Direction=Negative
    CURSE_HP: "Opponent", // CurseHpUnitState Direction=Negative
    CUTOUT: "Friend", // CutoutUnitState Direction=Positive
    DWN_AIM_GIV_DMG_RATIO: "Opponent", // DwnAimGivDmgRatioUnitState Direction=Negative
    DWN_AIM_RCV_DMG_RATIO: "Friend", // DwnAimRcvDmgRatioUnitState Direction=Positive
    DWN_ATK_ACCUM_RATIO: "Opponent", // DwnAtkAccumRatioUnitState Direction=Negative
    DWN_ATK_CONSUME_RATIO: "Opponent", // DwnAtkConsumeRatioUnitState Direction=Negative
    DWN_ATK_RATIO: "Opponent", // DwnAtkRatioUnitState Direction=Negative
    DWN_BARRIER_VALUE: "Opponent", // DwnBarrierValueUnitState Direction=Negative
    DWN_BREAKED_DAMAGE_RECEIVE_RATIO: "Opponent", // DwnBreakedDamageReceiveRatioUnitState Direction=Negative
    DWN_BREAK_DAMAGE_RECEIVE_RATIO: "Opponent", // DwnBreakedDamageReceiveRatioUnitState Direction=Negative
    DWN_BUFF_EFFECT_VALUE: "Opponent", // DwnBuffEffectValueUnitState Direction=Negative
    DWN_CTD_ACCUM_RATIO: "Opponent", // DwnCtdAccumRatioUnitState Direction=Negative
    DWN_CTD_CONSUME_FIXED: "Opponent", // DwnCtdConsumeFixedUnitState Direction=Negative
    DWN_CTD_FIXED: "Opponent", // DwnCtdFixedUnitState Direction=Negative
    DWN_CTD_RATIO: "Opponent", // DwnCtdFixedUnitState Direction=Negative
    DWN_CTR_ACCUM_RATIO: "Opponent", // DwnCtrAccumRatioUnitState Direction=Negative
    DWN_CTR_CONSUME_FIXED: "Opponent", // DwnCtrConsumeFixedUnitState Direction=Negative
    DWN_CTR_FIXED: "Opponent", // DwnCtrFixedUnitState Direction=Negative
    DWN_CTR_RATIO: "Opponent", // DwnCtrFixedUnitState Direction=Negative
    DWN_DEBUFF_EFFECT_VALUE: "Opponent", // DwnDebuffEffectValueUnitState Direction=Negative
    DWN_DEF_ACCUM_RATIO: "Opponent", // DwnDefAccumRatioUnitState Direction=Negative
    DWN_DEF_RATIO: "Opponent", // DwnDefRatioUnitState Direction=Negative
    DWN_ELEMENT_DMG_RATE_RATIO: "Opponent", // DwnElementDmgRateRatioUnitState Direction=Negative
    DWN_ELEMENT_RESIST_ACCUM_RATIO: "Opponent", // DwnElementResistRatioAccumUnitState Direction=Negative
    DWN_EP_RECOVER_RATE_RATIO: "Opponent", // DwnRecoveryEpRateRatioRatioUnitState Direction=Negative
    DWN_GIV_BLEED_DMG_RATIO: "Opponent", // DwnGivBleedDmgRatioUnitState Direction=Negative
    DWN_GIV_BREAK_POINT_DMG_FIXED: "Opponent", // DwnGivBreakPointDmgFixedUnitState Direction=Negative
    DWN_GIV_BURN_DMG_RATIO: "Opponent", // DwnGivBurnDmgRatioUnitState Direction=Negative
    DWN_GIV_CURSE_DMG_RATIO: "Opponent", // DwnGivCurseDmgRatioUnitState Direction=Negative
    DWN_GIV_DMG_ACCUM_RATIO: "Opponent", // DwnGivDmgAccumRatioUnitState Direction=Negative
    DWN_GIV_DMG_CONSUME_RATIO: "Opponent", // DwnGivDmgConsumeRatioUnitState Direction=Negative
    DWN_GIV_DMG_RATIO: "Opponent", // DwnGivDmgRatioUnitState Direction=Negative
    DWN_GIV_POISON_DMG_RATIO: "Opponent", // DwnGivPoisonDmgRatioUnitState Direction=Negative
    DWN_GIV_SLIP_DMG_RATIO: "Opponent", // DwnGivSlipDmgRatioUnitState Direction=Negative
    DWN_GIV_VORTEX_DMG_RATIO: "Opponent", // DwnGivVortexDmgRatioUnitState Direction=Negative
    DWN_HATE: "Friend", // DwnHateUnitState Direction=Positive
    DWN_HEAL_RATE_RATIO: "Opponent", // DwnHealRateRatioUnitState Direction=Negative
    DWN_RCV_BREAK_POINT_DMG_RATIO: "Friend", // DwnRcvBreakPointDmgRatioUnitState Direction=Positive
    DWN_RCV_DMG_RATIO: "Friend", // DwnRcvDmgRatioUnitState Direction=Positive
    DWN_RCV_RECOVERY_RATIO: "Opponent", // DwnRcvRecoveryRatioUnitState Direction=Negative
    DWN_RECOVERY_EP_RATE_RATIO: "Opponent", // DwnRecoveryEpRateRatioRatioUnitState Direction=Negative
    DWN_SPD_ACCUM_RATIO: "Opponent", // DwnSpdAccumRatioUnitState Direction=Negative
    DWN_SPD_FIXED: "Opponent", // DwnSpdFixedUnitState Direction=Negative
    DWN_SPD_RATIO: "Opponent", // DwnSpdRatioUnitState Direction=Negative
    GVE_UP_FINAL_GAIN_EP_RATIO: "Friend", // GveUpFinalGainEpRatioUnitState Direction=Positive
    GVE_UP_SPECIAL_ATTACK_FINAL_GIV_DMG_RATIO: "Friend", // GveUpSpecialAttackFinalGiveDamageRatioUnitState Direction=Positive
    LOCK_SPECIAL_ATTACK: "Opponent", // LockSpecialAttackUnitState Direction=Neutral
    LOCK_TURN_ORDER: "Opponent", // LockTurnOrderUnitState Direction=Negative
    POISON_ATK: "Opponent", // PoisonAtkUnitState Direction=Negative
    POISON_DEF: "Opponent", // PoisonDefUnitState Direction=Negative
    POISON_HP: "Opponent", // PoisonHpUnitState Direction=Negative
    PREVENT_ABNORMAL: "Friend", // PreventAbnormalUnitState Direction=Positive
    RCV_FINAL_DAMAGE: "Opponent", // RcvFinalDamageUnitState Direction=Negative
    REFLECTION_RATIO: "Friend", // ReflectionRatioUnitState Direction=Positive
    REGAIN_ATK: "Friend", // RegainAtkUnitState Direction=Positive
    REGAIN_DEF: "Friend", // RegainDefUnitState Direction=Positive
    REGAIN_HP: "Friend", // RegainHpUnitState Direction=Positive
    SHIELD: "Friend", // ShieldUnitState Direction=Positive
    STUN: "Opponent", // StunUnitState Direction=Negative
    SWITCH_SKILL: "Friend", // SwitchSkillUnitState Direction=Positive
    TSUBAME_CORE: "Friend", // TsubameCoreUnitState Direction=Positive
    TSUBAME_LINK: "Friend", // TsubameLinkUnitState Direction=Positive
    UNIQUE_10030301: "Friend", // Unique10030301UnitState Direction=Positive
    UNIQUE_10070201: "Friend", // Unique10070201UnitState Direction=Positive
    UNIQUE_BUFF: "Friend", // UniqueBuffUnitState Direction=Positive
    UNIQUE_BUFF_ACCUM: "Friend", // UniqueBuffAccumUnitState Direction=Positive
    UNIQUE_DEBUFF: "Opponent", // UniqueDebuffUnitState Direction=Negative
    UNIQUE_DEBUFF_ACCUM: "Opponent", // UniqueDebuffAccumUnitState Direction=Negative
    UNIQUE_ELEMENT_BREAK: "Opponent", // UniqueElementBreakUnitState Direction=Negative
    UNIQUE_ELEMENT_STACK: "Opponent", // UniqueElementStackUnitState Direction=Negative
    UNIQUE_ENEMY_639002: "Friend", // UniqueEnemy639002UnitState Direction=Positive
    UNIQUE_ZONE: "Opponent", // UniqueZoneUnitState Direction=Neutral
    UP_ABNORMAL_HIT_RATE_RATIO: "Friend", // UpAbnormalHitRateRatioUnitState Direction=Positive
    UP_ABNORMAL_PARRY_RATE_RATIO: "Friend", // UpAbnormalParryRateRatioUnitState Direction=Positive
    UP_AIM_GIV_DMG_RATIO: "Friend", // UpAimGivDmgRatioUnitState Direction=Positive
    UP_AIM_RCV_DMG_RATIO: "Opponent", // UpAimRcvDmgRatioUnitState Direction=Negative
    UP_ATK_ACCUM_RATIO: "Friend", // UpAtkAccumRatioUnitState Direction=Positive
    UP_ATK_CONSUME_FIXED: "Friend", // UpAtkConsumeFixedUnitState Direction=Positive
    UP_ATK_CONSUME_RATIO: "Friend", // UpAtkConsumeRatioUnitState Direction=Positive
    UP_ATK_FIXED: "Friend", // UpAtkFixedUnitState Direction=Positive
    UP_ATK_RATIO: "Friend", // UpAtkRatioUnitState Direction=Positive
    UP_BREAKED_DAMAGE_RECEIVE_RATIO: "Friend", // UpBreakedDamageReceiveRatioUnitState Direction=Positive
    UP_BREAK_DAMAGE_RECEIVE_RATIO: "Friend", // UpBreakedDamageReceiveRatioUnitState Direction=Positive
    UP_BREAK_EFFECT: "Friend", // UpBreakEffectRatioUnitState Direction=Positive
    UP_BUFF_EFFECT_VALUE: "Friend", // UpBuffEffectValueUnitState Direction=Positive
    UP_CTD_ACCUM_RATIO: "Friend", // UpCtdAccumRatioUnitState Direction=Positive
    UP_CTD_CONSUME_FIXED: "Friend", // UpCtdConsumeFixedUnitState Direction=Positive
    UP_CTD_FIXED: "Friend", // UpCtdFixedUnitState Direction=Positive
    UP_CTD_RATIO: "Friend", // UpCtdFixedUnitState Direction=Positive
    UP_CTR_ACCUM_RATIO: "Friend", // UpCtrAccumRatioUnitState Direction=Positive
    UP_CTR_CONSUME_FIXED: "Friend", // UpCtrConsumeFixedUnitState Direction=Positive
    UP_CTR_FIXED: "Friend", // UpCtrFixedUnitState Direction=Positive
    UP_CTR_RATIO: "Friend", // UpCtrFixedUnitState Direction=Positive
    UP_DEBUFF_EFFECT_VALUE: "Friend", // UpDebuffEffectValueUnitState Direction=Positive
    UP_DEF_ACCUM_RATIO: "Friend", // UpDefAccumRatioUnitState Direction=Positive
    UP_DEF_FIXED: "Friend", // UpDefFixedUnitState Direction=Positive
    UP_DEF_RATIO: "Friend", // UpDefRatioUnitState Direction=Positive
    UP_EFFECT_HIT_RATE_RATIO: "Friend", // UpEffectHitRateRatioUnitState Direction=Positive
    UP_EFFECT_PARRY_RATE_RATIO: "Friend", // UpEffectParryRateRatioUnitState Direction=Positive
    UP_ELEMENT_DMG_RATE_RATIO: "Friend", // UpElementDmgRateRatioUnitState Direction=Positive
    UP_ELEMENT_RESIST_ACCUM_RATIO: "Friend", // UpElementResistRatioAccumUnitState Direction=Positive
    UP_ELEMENT_RESIST_RATIO: "Friend", // UpElementResistRatioUnitState Direction=Positive
    UP_EP_RECOVER_RATE_RATIO: "Friend", // UpRecoveryEpRateRatioRatioUnitState Direction=Positive
    UP_GIV_BLEED_DMG_RATIO: "Friend", // UpGivBleedDmgRatioUnitState Direction=Positive
    UP_GIV_BREAK_POINT_DMG_FIXED: "Friend", // UpGivBreakPointDmgFixedUnitState Direction=Positive
    UP_GIV_BREAK_POINT_DMG_RATIO: "Friend", // UpGivBreakPointDmgRatioUnitState Direction=Positive
    UP_GIV_BURN_DMG_RATIO: "Friend", // UpGivBurnDmgRatioUnitState Direction=Positive
    UP_GIV_CURSE_DMG_RATIO: "Friend", // UpGivCurseDmgRatioUnitState Direction=Positive
    UP_GIV_DMG_ACCUM_RATIO: "Friend", // UpGivDmgAccumRatioUnitState Direction=Positive
    UP_GIV_DMG_CONSUME_RATIO: "Friend", // UpGivDmgConsumeRatioUnitState Direction=Positive
    UP_GIV_DMG_RATIO: "Friend", // UpGivDmgRatioUnitState Direction=Positive
    UP_GIV_POISON_DMG_RATIO: "Friend", // UpGivPoisonDmgRatioUnitState Direction=Positive
    UP_GIV_SLIP_DMG_RATIO: "Friend", // UpGivSlipDmgRatioUnitState Direction=Positive
    UP_GIV_VORTEX_DMG_RATIO: "Friend", // UpGivVortexDmgRatioUnitState Direction=Positive
    UP_HATE: "Friend", // UpHateUnitState Direction=Positive
    UP_HEAL_RATE_RATIO: "Friend", // UpHealRateRatioUnitState Direction=Positive
    UP_HP_FIXED: "Friend", // UpHpFixedUnitState Direction=Positive
    UP_HP_RATIO: "Friend", // UpHpRatioUnitState Direction=Positive
    UP_RCV_BREAK_POINT_DMG_RATIO: "Opponent", // UpRcvBreakPointDmgRatioUnitState Direction=Negative
    UP_RCV_CTD_RATIO: "Opponent", // UpRcvCtdRatioUnitState Direction=Negative
    UP_RCV_CTR_RATIO: "Opponent", // UpRcvCtrRatioUnitState Direction=Negative
    UP_RCV_DMG_RATIO: "Opponent", // UpRcvDmgRatioUnitState Direction=Negative
    UP_RECOVERY_EP_RATE_RATIO: "Friend", // UpRecoveryEpRateRatioRatioUnitState Direction=Positive
    UP_SPD_ACCUM_RATIO: "Friend", // UpSpdAccumRatioUnitState Direction=Positive
    UP_SPD_FIXED: "Friend", // UpSpdFixedUnitState Direction=Positive
    UP_SPD_RATIO: "Friend", // UpSpdRatioUnitState Direction=Positive
    UP_WEAK_ELEMENT_DMG_ACCUM_RATIO: "Friend", // UpWeakElementDmgAccumRatioUnitState Direction=Positive
    UP_WEAK_ELEMENT_DMG_CONSUME_RATIO: "Friend", // UpWeakElementDmgConsumeRatioUnitState Direction=Positive
    UP_WEAK_ELEMENT_DMG_RATIO: "Friend", // UpWeakElementDmgRatioUnitState Direction=Positive
    VORTEX_ATK: "Opponent", // VortexAtkUnitState Direction=Negative
    WEAKNESS: "Opponent", // WeaknessUnitState Direction=Negative
    ADDITIONAL_COUNTDOWN_CANCEL_SKILL_ACT: "Opponent", // AdditionalCountdownCancelSkillActAbilityEffect
    ADDITIONAL_COUNTDOWN_ZERO_SKILL_ACT: "Opponent", // AdditionalCountdownZeroSkillActAbilityEffect
    ADDITIONAL_SKILL_ACT: "Opponent", // AdditionalSkillActAbilityEffect
    ADDITIONAL_TURN_UNIT_ACT: "Opponent", // AdditionalTurnUnitActAbilityEffect
    ADD_BUFF_TURN_IMM: "Friend", // AddBuffTurnImmAbilityEffect
    ADD_DEBUFF_TURN_IMM: "Opponent", // AddDebuffTurnImmAbilityEffect
    CHARGE: "Friend", // ChargeAbilityEffect
    CONSUME_CHARGE_POINT: "Friend", // ConsumeChargePointAbilityEffect
    CONSUME_COUNT_POINT: "Opponent", // ConsumeCountPointAbilityEffect
    CONSUME_ZONE_STACK: "Friend", // ConsumeZoneStackAbilityEffect
    COUNTDOWN_CANCEL: "Opponent", // CountdownCancelAbilityEffect
    COUNTDOWN_DECREASE: "Opponent", // CountdownDecreaseAbilityEffect
    DEC_BUFF_TURN_IMM: "Opponent", // DecBuffTurnImmAbilityEffect
    DEC_DEBUFF_TURN_IMM: "Friend", // DecDebuffTurnImmAbilityEffect
    DMG_ATK: "Opponent", // DmgAtkAbilityEffect
    DMG_DEF: "Opponent", // DmgDefAbilityEffect
    DMG_HP: "Opponent", // DmgHpAbilityEffect
    DMG_RANDOM: "Opponent", // DmgRandomAbilityEffect
    DMG_RATIO: "Opponent", // DmgRatioAbilityEffect
    GAIN_BP_FIXED: "Friend", // GainBpFixedAbilityEffect
    GAIN_CHARGE_POINT: "Friend", // GainChargePointAbilityEffect
    GAIN_COUNT_POINT: "Opponent", // GainCountPointAbilityEffect
    GAIN_EP_FIXED: "Friend", // GainEpFixedAbilityEffect
    GAIN_EP_RATIO: "Friend", // GainEpRatioAbilityEffect
    GAIN_SOLO_RAID_BUFF_POINT: "Friend", // GainSoloRaidBuffPointAbilityEffect
    GAIN_SP_FIXED: "Friend", // GainSpFixedAbilityEffect
    GAIN_ZONE_STACK: "Friend", // GainZoneStackAbilityEffect
    HASTE: "Friend", // HasteAbilityEffect
    IMM_SLIP_DMG: "Opponent", // ImmSlipDmgAbilityEffect
    LOSE_BP_FIXED: "Opponent", // LoseBpFixedAbilityEffect
    LOSE_EP_FIXED: "Opponent", // LoseEpFixedAbilityEffect
    LOSE_EP_RATIO: "Opponent", // LoseEpRatioAbilityEffect
    RECOVERY_HP: "Friend", // RecoveryHpAbilityEffect
    RECOVERY_HP_ATK: "Friend", // RecoveryHpAtkAbilityEffect
    REMOVE_ALL_ABNORMAL: "Friend", // RemoveAllAbnormalAbilityEffect
    REMOVE_ALL_BUFF: "Opponent", // RemoveAllBuffAbilityEffect
    REMOVE_ALL_DEBUFF: "Friend", // RemoveAllDebuffAbilityEffect
    REMOVE_ALL_UNABLE_ACTION: "Friend", // RemoveAllUnableActionAbilityEffect
    RESET_UNIQUE_BUFF: "Friend", // ResetUniqueBuffAbilityEffect
    RESET_UNIQUE_DEBUFF: "Opponent", // ResetUniqueDebuffAbilityEffect
    REVIVAL_RATIO: "Friend", // RevivalRatioAbilityEffect
    RE_ACTION_TURN_UNIT_ACT: "Friend", // ReActionTurnUnitActAbilityEffect
    SLOW: "Opponent", // SlowAbilityEffect
    SUMMON: "Friend", // SummonAbilityEffect
    ZONE_EXPAND: "Opponent", // ZoneExpandAbilityEffect
    ZONE_RELEASE: "Opponent", // ZoneReleaseAbilityEffect
    ZONE_STACK: "Friend", // ZoneStackAbilityEffect
};
