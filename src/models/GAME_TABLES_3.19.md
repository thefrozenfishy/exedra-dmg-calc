# 3.19.0 effect-type tables (generated from the decompilation)

Source: `UnitStateFactory$$.cctor` and `AbilityEffectFactory$$.cctor` (the game's own string -> class dispatch), plus each class's `Direction` / `TargetSide`. Every effect type in the 3.18 skill and passive data appears here; nothing in the data is unhandled by the game.

## UnitStateFactory (buffs, debuffs, ailments; wrapped in StateAbilityEffect)

| effect type | class | direction | targets |
|---|---|---|---|
| `UP_ATK_RATIO` | UpAtkRatioUnitState | Positive | own side |
| `UP_ATK_FIXED` | UpAtkFixedUnitState | Positive | own side |
| `DWN_ATK_RATIO` | DwnAtkRatioUnitState | Negative | opponents |
| `UP_ATK_ACCUM_RATIO` | UpAtkAccumRatioUnitState | Positive | own side |
| `DWN_ATK_ACCUM_RATIO` | DwnAtkAccumRatioUnitState | Negative | opponents |
| `UP_ATK_CONSUME_RATIO` | UpAtkConsumeRatioUnitState | Positive | own side |
| `UP_ATK_CONSUME_FIXED` | UpAtkConsumeFixedUnitState | Positive | own side |
| `DWN_ATK_CONSUME_RATIO` | DwnAtkConsumeRatioUnitState | Negative | opponents |
| `UP_DEF_RATIO` | UpDefRatioUnitState | Positive | own side |
| `UP_DEF_FIXED` | UpDefFixedUnitState | Positive | own side |
| `DWN_DEF_RATIO` | DwnDefRatioUnitState | Negative | opponents |
| `UP_DEF_ACCUM_RATIO` | UpDefAccumRatioUnitState | Positive | own side |
| `DWN_DEF_ACCUM_RATIO` | DwnDefAccumRatioUnitState | Negative | opponents |
| `UP_HP_RATIO` | UpHpRatioUnitState | Positive | own side |
| `UP_HP_FIXED` | UpHpFixedUnitState | Positive | own side |
| `UP_SPD_RATIO` | UpSpdRatioUnitState | Positive | own side |
| `UP_SPD_FIXED` | UpSpdFixedUnitState | Positive | own side |
| `DWN_SPD_RATIO` | DwnSpdRatioUnitState | Negative | opponents |
| `DWN_SPD_FIXED` | DwnSpdFixedUnitState | Negative | opponents |
| `UP_SPD_ACCUM_RATIO` | UpSpdAccumRatioUnitState | Positive | own side |
| `DWN_SPD_ACCUM_RATIO` | DwnSpdAccumRatioUnitState | Negative | opponents |
| `UP_CTR_RATIO` | UpCtrFixedUnitState | Positive | own side |
| `UP_CTR_FIXED` | UpCtrFixedUnitState | Positive | own side |
| `UP_CTD_RATIO` | UpCtdFixedUnitState | Positive | own side |
| `UP_CTD_FIXED` | UpCtdFixedUnitState | Positive | own side |
| `DWN_CTR_RATIO` | DwnCtrFixedUnitState | Negative | opponents |
| `DWN_CTR_FIXED` | DwnCtrFixedUnitState | Negative | opponents |
| `DWN_CTD_RATIO` | DwnCtdFixedUnitState | Negative | opponents |
| `DWN_CTD_FIXED` | DwnCtdFixedUnitState | Negative | opponents |
| `UP_CTR_ACCUM_RATIO` | UpCtrAccumRatioUnitState | Positive | own side |
| `DWN_CTR_ACCUM_RATIO` | DwnCtrAccumRatioUnitState | Negative | opponents |
| `UP_CTD_ACCUM_RATIO` | UpCtdAccumRatioUnitState | Positive | own side |
| `DWN_CTD_ACCUM_RATIO` | DwnCtdAccumRatioUnitState | Negative | opponents |
| `UP_CTR_CONSUME_FIXED` | UpCtrConsumeFixedUnitState | Positive | own side |
| `DWN_CTR_CONSUME_FIXED` | DwnCtrConsumeFixedUnitState | Negative | opponents |
| `UP_CTD_CONSUME_FIXED` | UpCtdConsumeFixedUnitState | Positive | own side |
| `DWN_CTD_CONSUME_FIXED` | DwnCtdConsumeFixedUnitState | Negative | opponents |
| `UP_RCV_CTR_RATIO` | UpRcvCtrRatioUnitState | Negative | opponents |
| `UP_RCV_CTD_RATIO` | UpRcvCtdRatioUnitState | Negative | opponents |
| `UP_HEAL_RATE_RATIO` | UpHealRateRatioUnitState | Positive | own side |
| `DWN_HEAL_RATE_RATIO` | DwnHealRateRatioUnitState | Negative | opponents |
| `DWN_RCV_RECOVERY_RATIO` | DwnRcvRecoveryRatioUnitState | Negative | opponents |
| `UP_EFFECT_HIT_RATE_RATIO` | UpEffectHitRateRatioUnitState | Positive | own side |
| `UP_EFFECT_PARRY_RATE_RATIO` | UpEffectParryRateRatioUnitState | Positive | own side |
| `UP_ABNORMAL_HIT_RATE_RATIO` | UpAbnormalHitRateRatioUnitState | Positive | own side |
| `UP_ABNORMAL_PARRY_RATE_RATIO` | UpAbnormalParryRateRatioUnitState | Positive | own side |
| `UP_ELEMENT_DMG_RATE_RATIO` | UpElementDmgRateRatioUnitState | Positive | own side |
| `DWN_ELEMENT_DMG_RATE_RATIO` | DwnElementDmgRateRatioUnitState | Negative | opponents |
| `UP_ELEMENT_RESIST_RATIO` | UpElementResistRatioUnitState | Positive | own side |
| `UP_ELEMENT_RESIST_ACCUM_RATIO` | UpElementResistRatioAccumUnitState | Positive | own side |
| `DWN_ELEMENT_RESIST_ACCUM_RATIO` | DwnElementResistRatioAccumUnitState | Negative | opponents |
| `UP_BREAK_EFFECT` | UpBreakEffectRatioUnitState | Positive | own side |
| `UP_EP_RECOVER_RATE_RATIO` | UpRecoveryEpRateRatioRatioUnitState | Positive | own side |
| `DWN_EP_RECOVER_RATE_RATIO` | DwnRecoveryEpRateRatioRatioUnitState | Negative | opponents |
| `UP_RECOVERY_EP_RATE_RATIO` | UpRecoveryEpRateRatioRatioUnitState | Positive | own side |
| `DWN_RECOVERY_EP_RATE_RATIO` | DwnRecoveryEpRateRatioRatioUnitState | Negative | opponents |
| `UP_BREAK_DAMAGE_RECEIVE_RATIO` | UpBreakedDamageReceiveRatioUnitState | Positive | own side |
| `DWN_BREAK_DAMAGE_RECEIVE_RATIO` | DwnBreakedDamageReceiveRatioUnitState | Negative | opponents |
| `UP_BREAKED_DAMAGE_RECEIVE_RATIO` | UpBreakedDamageReceiveRatioUnitState | Positive | own side |
| `DWN_BREAKED_DAMAGE_RECEIVE_RATIO` | DwnBreakedDamageReceiveRatioUnitState | Negative | opponents |
| `DWN_RCV_DMG_RATIO` | DwnRcvDmgRatioUnitState | Positive | own side |
| `UP_GIV_DMG_RATIO` | UpGivDmgRatioUnitState | Positive | own side |
| `UP_RCV_DMG_RATIO` | UpRcvDmgRatioUnitState | Negative | opponents |
| `DWN_GIV_DMG_RATIO` | DwnGivDmgRatioUnitState | Negative | opponents |
| `DWN_AIM_RCV_DMG_RATIO` | DwnAimRcvDmgRatioUnitState | Positive | own side |
| `UP_AIM_GIV_DMG_RATIO` | UpAimGivDmgRatioUnitState | Positive | own side |
| `UP_GIV_DMG_ACCUM_RATIO` | UpGivDmgAccumRatioUnitState | Positive | own side |
| `DWN_GIV_DMG_ACCUM_RATIO` | DwnGivDmgAccumRatioUnitState | Negative | opponents |
| `UP_AIM_RCV_DMG_RATIO` | UpAimRcvDmgRatioUnitState | Negative | opponents |
| `DWN_AIM_GIV_DMG_RATIO` | DwnAimGivDmgRatioUnitState | Negative | opponents |
| `UP_GIV_DMG_CONSUME_RATIO` | UpGivDmgConsumeRatioUnitState | Positive | own side |
| `DWN_GIV_DMG_CONSUME_RATIO` | DwnGivDmgConsumeRatioUnitState | Negative | opponents |
| `UP_GIV_BREAK_POINT_DMG_FIXED` | UpGivBreakPointDmgFixedUnitState | Positive | own side |
| `UP_GIV_BREAK_POINT_DMG_RATIO` | UpGivBreakPointDmgRatioUnitState | Positive | own side |
| `UP_RCV_BREAK_POINT_DMG_RATIO` | UpRcvBreakPointDmgRatioUnitState | Negative | opponents |
| `DWN_GIV_BREAK_POINT_DMG_FIXED` | DwnGivBreakPointDmgFixedUnitState | Negative | opponents |
| `DWN_RCV_BREAK_POINT_DMG_RATIO` | DwnRcvBreakPointDmgRatioUnitState | Positive | own side |
| `UP_WEAK_ELEMENT_DMG_RATIO` | UpWeakElementDmgRatioUnitState | Positive | own side |
| `UP_WEAK_ELEMENT_DMG_ACCUM_RATIO` | UpWeakElementDmgAccumRatioUnitState | Positive | own side |
| `UP_WEAK_ELEMENT_DMG_CONSUME_RATIO` | UpWeakElementDmgConsumeRatioUnitState | Positive | own side |
| `BURN_ATK` | BurnAtkUnitState | Negative | opponents |
| `BURN_DEF` | BurnDefUnitState | Negative | opponents |
| `BURN_HP` | BurnHpUnitState | Negative | opponents |
| `WEAKNESS` | WeaknessUnitState | Negative | opponents |
| `POISON_ATK` | PoisonAtkUnitState | Negative | opponents |
| `POISON_DEF` | PoisonDefUnitState | Negative | opponents |
| `POISON_HP` | PoisonHpUnitState | Negative | opponents |
| `STUN` | StunUnitState | Negative | opponents |
| `CURSE_ATK` | CurseAtkUnitState | Negative | opponents |
| `CURSE_DEF` | CurseDefUnitState | Negative | opponents |
| `CURSE_HP` | CurseHpUnitState | Negative | opponents |
| `BLEED_ATK` | BleedAtkUnitState | Negative | opponents |
| `BLEED_DEF` | BleedDefUnitState | Negative | opponents |
| `BLEED_HP` | BleedHpUnitState | Negative | opponents |
| `VORTEX_ATK` | VortexAtkUnitState | Negative | opponents |
| `UP_GIV_SLIP_DMG_RATIO` | UpGivSlipDmgRatioUnitState | Positive | own side |
| `UP_GIV_BURN_DMG_RATIO` | UpGivBurnDmgRatioUnitState | Positive | own side |
| `UP_GIV_POISON_DMG_RATIO` | UpGivPoisonDmgRatioUnitState | Positive | own side |
| `UP_GIV_CURSE_DMG_RATIO` | UpGivCurseDmgRatioUnitState | Positive | own side |
| `UP_GIV_BLEED_DMG_RATIO` | UpGivBleedDmgRatioUnitState | Positive | own side |
| `UP_GIV_VORTEX_DMG_RATIO` | UpGivVortexDmgRatioUnitState | Positive | own side |
| `DWN_GIV_SLIP_DMG_RATIO` | DwnGivSlipDmgRatioUnitState | Negative | opponents |
| `DWN_GIV_BURN_DMG_RATIO` | DwnGivBurnDmgRatioUnitState | Negative | opponents |
| `DWN_GIV_POISON_DMG_RATIO` | DwnGivPoisonDmgRatioUnitState | Negative | opponents |
| `DWN_GIV_CURSE_DMG_RATIO` | DwnGivCurseDmgRatioUnitState | Negative | opponents |
| `DWN_GIV_BLEED_DMG_RATIO` | DwnGivBleedDmgRatioUnitState | Negative | opponents |
| `DWN_GIV_VORTEX_DMG_RATIO` | DwnGivVortexDmgRatioUnitState | Negative | opponents |
| `RCV_FINAL_DAMAGE` | RcvFinalDamageUnitState | Negative | opponents |
| `UP_HATE` | UpHateUnitState | Positive | own side |
| `DWN_HATE` | DwnHateUnitState | Positive | own side |
| `SWITCH_SKILL` | SwitchSkillUnitState | Positive | own side |
| `REFLECTION_RATIO` | ReflectionRatioUnitState | Positive | own side |
| `COMBO` | ComboUnitState | Positive | own side |
| `CUTOUT` | CutoutUnitState | Positive | own side |
| `TSUBAME_CORE` | TsubameCoreUnitState | Positive | own side |
| `TSUBAME_LINK` | TsubameLinkUnitState | Positive | own side |
| `LOCK_TURN_ORDER` | LockTurnOrderUnitState | Negative | opponents |
| `LOCK_SPECIAL_ATTACK` | LockSpecialAttackUnitState | Neutral | opponents |
| `SHIELD` | ShieldUnitState | Positive | own side |
| `BARRIER` | BarrierUnitState | Positive | own side |
| `GVE_UP_SPECIAL_ATTACK_FINAL_GIV_DMG_RATIO` | GveUpSpecialAttackFinalGiveDamageRatioUnitState | Positive | own side |
| `GVE_UP_FINAL_GAIN_EP_RATIO` | GveUpFinalGainEpRatioUnitState | Positive | own side |
| `CPN_UP_GIV_DMG_RATIO` | CpnUpGivDmgRatioUnitState | Positive | own side |
| `CPN_UP_GIV_BREAK_POINT_DMG_RATIO` | CpnUpGivBreakPointDmgRatioUnitState | Positive | own side |
| `PREVENT_ABNORMAL` | PreventAbnormalUnitState | Positive | own side |
| `ADD_BUFF_TURN` | AddBuffTurnUnitState | Positive | own side |
| `ADD_DEBUFF_TURN` | AddDebuffTurnUnitState | Positive | own side |
| `UP_BUFF_EFFECT_VALUE` | UpBuffEffectValueUnitState | Positive | own side |
| `UP_DEBUFF_EFFECT_VALUE` | UpDebuffEffectValueUnitState | Positive | own side |
| `DWN_BUFF_EFFECT_VALUE` | DwnBuffEffectValueUnitState | Negative | opponents |
| `DWN_DEBUFF_EFFECT_VALUE` | DwnDebuffEffectValueUnitState | Negative | opponents |
| `DWN_BARRIER_VALUE` | DwnBarrierValueUnitState | Negative | opponents |
| `CONTINUOUS_RECOVERY` | ContinuousRecoveryUnitState | Positive | own side |
| `REGAIN_HP` | RegainHpUnitState | Positive | own side |
| `REGAIN_ATK` | RegainAtkUnitState | Positive | own side |
| `REGAIN_DEF` | RegainDefUnitState | Positive | own side |
| `COUNT` | CountUnitState | Neutral | opponents |
| `COUNTDOWN_START` | CountdownStartUnitState | Positive | own side |
| `ADDITIONAL_DAMAGE` | AdditionalDamageUnitState | Positive | own side |
| `UNIQUE_10030301` | Unique10030301UnitState | Positive | own side |
| `UNIQUE_10070201` | Unique10070201UnitState | Positive | own side |
| `UNIQUE_BUFF` | UniqueBuffUnitState | Positive | own side |
| `UNIQUE_DEBUFF` | UniqueDebuffUnitState | Negative | opponents |
| `UNIQUE_BUFF_ACCUM` | UniqueBuffAccumUnitState | Positive | own side |
| `UNIQUE_DEBUFF_ACCUM` | UniqueDebuffAccumUnitState | Negative | opponents |
| `UNIQUE_ELEMENT_STACK` | UniqueElementStackUnitState | Negative | opponents |
| `UNIQUE_ELEMENT_BREAK` | UniqueElementBreakUnitState | Negative | opponents |
| `UNIQUE_ZONE` | UniqueZoneUnitState | Neutral | opponents |
| `UNIQUE_ENEMY_639002` | UniqueEnemy639002UnitState | Positive | own side |

## AbilityEffectFactory (special effects with their own Triggering)

| effect type | class | targets |
|---|---|---|
| `DMG_ATK` | DmgAtkAbilityEffect | opponents |
| `DMG_DEF` | DmgDefAbilityEffect | opponents |
| `DMG_HP` | DmgHpAbilityEffect | opponents |
| `DMG_RANDOM` | DmgRandomAbilityEffect | opponents |
| `IMM_SLIP_DMG` | ImmSlipDmgAbilityEffect | opponents |
| `DMG_RATIO` | DmgRatioAbilityEffect | opponents |
| `RECOVERY_HP` | RecoveryHpAbilityEffect | own side |
| `RECOVERY_HP_ATK` | RecoveryHpAtkAbilityEffect | own side |
| `REVIVAL_RATIO` | RevivalRatioAbilityEffect | own side |
| `GAIN_EP_FIXED` | GainEpFixedAbilityEffect | own side |
| `GAIN_EP_RATIO` | GainEpRatioAbilityEffect | own side |
| `LOSE_EP_FIXED` | LoseEpFixedAbilityEffect | opponents |
| `LOSE_EP_RATIO` | LoseEpRatioAbilityEffect | opponents |
| `GAIN_SP_FIXED` | GainSpFixedAbilityEffect | own side |
| `GAIN_BP_FIXED` | GainBpFixedAbilityEffect | own side |
| `LOSE_BP_FIXED` | LoseBpFixedAbilityEffect | opponents |
| `REMOVE_ALL_BUFF` | RemoveAllBuffAbilityEffect | opponents |
| `REMOVE_ALL_DEBUFF` | RemoveAllDebuffAbilityEffect | own side |
| `REMOVE_ALL_ABNORMAL` | RemoveAllAbnormalAbilityEffect | own side |
| `REMOVE_ALL_UNABLE_ACTION` | RemoveAllUnableActionAbilityEffect | own side |
| `RESET_UNIQUE_BUFF` | ResetUniqueBuffAbilityEffect | own side |
| `RESET_UNIQUE_DEBUFF` | ResetUniqueDebuffAbilityEffect | opponents |
| `HASTE` | HasteAbilityEffect | own side |
| `SLOW` | SlowAbilityEffect | opponents |
| `SUMMON` | SummonAbilityEffect | own side |
| `ADDITIONAL_SKILL_ACT` | AdditionalSkillActAbilityEffect | opponents |
| `ADDITIONAL_TURN_UNIT_ACT` | AdditionalTurnUnitActAbilityEffect | opponents |
| `RE_ACTION_TURN_UNIT_ACT` | ReActionTurnUnitActAbilityEffect | own side |
| `CHARGE` | ChargeAbilityEffect | own side |
| `GAIN_CHARGE_POINT` | GainChargePointAbilityEffect | own side |
| `CONSUME_CHARGE_POINT` | ConsumeChargePointAbilityEffect | own side |
| `GAIN_COUNT_POINT` | GainCountPointAbilityEffect | opponents |
| `CONSUME_COUNT_POINT` | ConsumeCountPointAbilityEffect | opponents |
| `COUNTDOWN_DECREASE` | CountdownDecreaseAbilityEffect | opponents |
| `COUNTDOWN_CANCEL` | CountdownCancelAbilityEffect | opponents |
| `ADDITIONAL_COUNTDOWN_CANCEL_SKILL_ACT` | AdditionalCountdownCancelSkillActAbilityEffect | opponents |
| `ADDITIONAL_COUNTDOWN_ZERO_SKILL_ACT` | AdditionalCountdownZeroSkillActAbilityEffect | opponents |
| `ADD_BUFF_TURN_IMM` | AddBuffTurnImmAbilityEffect | own side |
| `DEC_BUFF_TURN_IMM` | DecBuffTurnImmAbilityEffect | opponents |
| `ADD_DEBUFF_TURN_IMM` | AddDebuffTurnImmAbilityEffect | opponents |
| `DEC_DEBUFF_TURN_IMM` | DecDebuffTurnImmAbilityEffect | own side |
| `ZONE_EXPAND` | ZoneExpandAbilityEffect | opponents |
| `ZONE_RELEASE` | ZoneReleaseAbilityEffect | opponents |
| `ZONE_STACK` | ZoneStackAbilityEffect | own side |
| `GAIN_ZONE_STACK` | GainZoneStackAbilityEffect | own side |
| `CONSUME_ZONE_STACK` | ConsumeZoneStackAbilityEffect | own side |
| `GAIN_SOLO_RAID_BUFF_POINT` | GainSoloRaidBuffPointAbilityEffect | own side |
