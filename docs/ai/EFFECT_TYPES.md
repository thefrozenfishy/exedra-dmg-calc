# Effect types: data usage vs engine coverage (GENERATED - do not edit)

Built from `main @ 571f2d6b 2026-10-30`. Regenerate after switching branches or changing the engine: `python3 scripts/ai/xq.py build`. Details for one type: `python3 scripts/ai/xq.py effect <TYPE>`.

- **kiokus** = collectable kiokus (getStyleMstList) whose kit uses it (all levels, id*100+lvl keys, follow-ups followed).
- **stages** = quest stages whose enemies use it (skill sets + enemy passives).
- **TS** = `yes` if the engine (src/models + src/utils, not the generated tables or the old ScoreAttack calculator) compares/cases on it; `prefix/template?` = only matched by a template literal like `UP_${stat}_FIXED` or a `startsWith`/`endsWith` test (may over-match); `**LISTED ONLY**` = only appears in a type list (e.g. target-side tables); `**MISSING**` = never mentioned. A reference is not proof of a full implementation: check with `xq effect <TYPE>` (it lists each reference with its kind).

| effect type | game class | kiokus | stages | TS | TS files | example kiokus |
|---|---|---|---|---|---|---|
| ADDITIONAL_COUNTDOWN_CANCEL_SKILL_ACT | AdditionalCountdownCancelSkillActAbilityEffect | 0 | 48 | prefix/template? | KiokuArchetypes.ts |  |
| ADDITIONAL_COUNTDOWN_ZERO_SKILL_ACT | AdditionalCountdownZeroSkillActAbilityEffect | 0 | 48 | prefix/template? | KiokuArchetypes.ts |  |
| ADDITIONAL_DAMAGE | AdditionalDamageUnitState | 4 | 0 | yes | EffectSide.ts, KiokuArchetypes.ts, effectText.ts | Aqua Tempest, Luminous Tenet, Pluvia☆Neujahr |
| ADDITIONAL_SKILL_ACT | AdditionalSkillActAbilityEffect | 35 | 629 | yes | KiokuArchetypes.ts, LuxBench.ts | A Tale of Cherry Blossoms, Absolute Venus, Aqua Tempest |
| ADDITIONAL_TURN_UNIT_ACT | AdditionalTurnUnitActAbilityEffect | 17 | 99 | yes | EffectSide.ts, KiokuArchetypes.ts | A Tale of Cherry Blossoms, Absolute Rain, Concentrated Missile Fire |
| ADD_BUFF_TURN | AddBuffTurnUnitState | 24 | 0 | yes | EffectSide.ts, KiokuArchetypes.ts, effectText.ts | Aqua Tempest, Baldamente Fortissimo, Buon Natale Grazioso |
| ADD_BUFF_TURN_IMM | AddBuffTurnImmAbilityEffect | 2 | 16 | yes | EffectSide.ts, KiokuArchetypes.ts | Absolute Venus, Scorchin' Summer Spike |
| ADD_DEBUFF_TURN | AddDebuffTurnUnitState | 16 | 3 | yes | EffectSide.ts, KiokuArchetypes.ts, effectText.ts | Assault Paranoia, Atomo Arrabbiato, Bebe-O'-Lantern |
| ADD_DEBUFF_TURN_IMM | AddDebuffTurnImmAbilityEffect | 2 | 74 | yes | EffectSide.ts, KiokuArchetypes.ts | Pumpkin Death Squall, Splashin' Kyubey Blast |
| ADD_DMG_ATK_BLEED |  | 0 | 0 | prefix/template? | KiokuArchetypes.ts |  |
| ADD_DMG_ATK_BLEED_ALL |  | 0 | 0 | prefix/template? | KiokuArchetypes.ts |  |
| ADD_DMG_ATK_BURN |  | 0 | 0 | prefix/template? | KiokuArchetypes.ts |  |
| ADD_DMG_ATK_BURN_ALL |  | 0 | 0 | prefix/template? | KiokuArchetypes.ts |  |
| ADD_DMG_ATK_CURSE |  | 0 | 0 | prefix/template? | KiokuArchetypes.ts |  |
| ADD_DMG_ATK_CURSE_ALL |  | 0 | 0 | prefix/template? | KiokuArchetypes.ts |  |
| ADD_DMG_ATK_POISON |  | 0 | 0 | prefix/template? | KiokuArchetypes.ts |  |
| ADD_DMG_ATK_POISON_ALL |  | 0 | 0 | prefix/template? | KiokuArchetypes.ts |  |
| ADD_DMG_ATK_STUN |  | 0 | 0 | prefix/template? | KiokuArchetypes.ts |  |
| ADD_DMG_ATK_STUN_ALL |  | 0 | 0 | prefix/template? | KiokuArchetypes.ts |  |
| ADD_DMG_ATK_WEAKNESS |  | 0 | 0 | prefix/template? | KiokuArchetypes.ts |  |
| ADD_DMG_ATK_WEAKNESS_ALL |  | 0 | 0 | prefix/template? | KiokuArchetypes.ts |  |
| ADD_DMG_DEF_BLEED |  | 0 | 0 | prefix/template? | KiokuArchetypes.ts |  |
| ADD_DMG_DEF_BLEED_ALL |  | 0 | 0 | prefix/template? | KiokuArchetypes.ts |  |
| ADD_DMG_DEF_BURN |  | 0 | 0 | prefix/template? | KiokuArchetypes.ts |  |
| ADD_DMG_DEF_BURN_ALL |  | 0 | 0 | prefix/template? | KiokuArchetypes.ts |  |
| ADD_DMG_DEF_CURSE |  | 0 | 0 | prefix/template? | KiokuArchetypes.ts |  |
| ADD_DMG_DEF_CURSE_ALL |  | 0 | 0 | prefix/template? | KiokuArchetypes.ts |  |
| ADD_DMG_DEF_POISON |  | 0 | 0 | prefix/template? | KiokuArchetypes.ts |  |
| ADD_DMG_DEF_POISON_ALL |  | 0 | 0 | prefix/template? | KiokuArchetypes.ts |  |
| ADD_DMG_DEF_STUN |  | 0 | 0 | prefix/template? | KiokuArchetypes.ts |  |
| ADD_DMG_DEF_STUN_ALL |  | 0 | 0 | prefix/template? | KiokuArchetypes.ts |  |
| ADD_DMG_DEF_WEAKNESS |  | 0 | 0 | prefix/template? | KiokuArchetypes.ts |  |
| ADD_DMG_DEF_WEAKNESS_ALL |  | 0 | 0 | prefix/template? | KiokuArchetypes.ts |  |
| ADD_DMG_HP_BLEED |  | 0 | 0 | prefix/template? | KiokuArchetypes.ts |  |
| ADD_DMG_HP_BLEED_ALL |  | 0 | 0 | prefix/template? | KiokuArchetypes.ts |  |
| ADD_DMG_HP_BURN |  | 0 | 0 | prefix/template? | KiokuArchetypes.ts |  |
| ADD_DMG_HP_BURN_ALL |  | 0 | 0 | prefix/template? | KiokuArchetypes.ts |  |
| ADD_DMG_HP_CURSE |  | 0 | 0 | prefix/template? | KiokuArchetypes.ts |  |
| ADD_DMG_HP_CURSE_ALL |  | 0 | 0 | prefix/template? | KiokuArchetypes.ts |  |
| ADD_DMG_HP_POISON |  | 0 | 0 | prefix/template? | KiokuArchetypes.ts |  |
| ADD_DMG_HP_POISON_ALL |  | 0 | 0 | prefix/template? | KiokuArchetypes.ts |  |
| ADD_DMG_HP_STUN |  | 0 | 0 | prefix/template? | KiokuArchetypes.ts |  |
| ADD_DMG_HP_STUN_ALL |  | 0 | 0 | prefix/template? | KiokuArchetypes.ts |  |
| ADD_DMG_HP_WEAKNESS |  | 0 | 0 | prefix/template? | KiokuArchetypes.ts |  |
| ADD_DMG_HP_WEAKNESS_ALL |  | 0 | 0 | prefix/template? | KiokuArchetypes.ts |  |
| BARRIER | BarrierUnitState | 9 | 281 | yes | EffectSide.ts, effectText.ts | Baldamente Fortissimo, Folter Gefängnis, La Lumière |
| BLEED_ATK | BleedAtkUnitState | 1 | 276 | **LISTED ONLY** |  | Soul Salvation |
| BLEED_BREAK |  | 0 | 0 | - |  |  |
| BLEED_DEF | BleedDefUnitState | 0 | 60 | **LISTED ONLY** |  |  |
| BLEED_HP | BleedHpUnitState | 0 | 0 | listed |  |  |
| BURN_ATK | BurnAtkUnitState | 4 | 418 | **LISTED ONLY** |  | Marigold Dadaism, Meteor Punch, My Gigantic Heart |
| BURN_BREAK |  | 0 | 0 | - |  |  |
| BURN_DEF | BurnDefUnitState | 0 | 20 | **LISTED ONLY** |  |  |
| BURN_HP | BurnHpUnitState | 0 | 0 | listed |  |  |
| CHANGE_SKILL |  | 0 | 0 | - |  |  |
| CHARGE | ChargeAbilityEffect | 43 | 1323 | yes | EffectSide.ts, helpers.ts | A Tale of Cherry Blossoms, Absolute Venus, Aqua Tempest |
| COMBO | ComboUnitState | 0 | 2265 | yes | EffectSide.ts |  |
| CONSUME_CHARGE_POINT | ConsumeChargePointAbilityEffect | 37 | 1013 | yes | EffectSide.ts | A Tale of Cherry Blossoms, Absolute Venus, Assault Paranoia |
| CONSUME_COUNT_POINT | ConsumeCountPointAbilityEffect | 1 | 0 | **LISTED ONLY** |  | Dark Art Dominion |
| CONSUME_SELF_HP | ConsumeSelfHpAbilityEffect | 1 | 50 | **MISSING** |  | Venusta Dissonanza |
| CONSUME_ZONE_STACK | ConsumeZoneStackAbilityEffect | 5 | 0 | **LISTED ONLY** |  | Evoluzione Presente, Falsified Phenomena, Floral Ironspike |
| CONTINUOUS_RECOVERY | ContinuousRecoveryUnitState | 2 | 0 | yes | EffectSide.ts, effectText.ts | Doppel of Silence, Magic Cake Dish |
| COUNT | CountUnitState | 1 | 0 | yes | effectText.ts | Dark Art Dominion |
| COUNTDOWN_CANCEL | CountdownCancelAbilityEffect | 0 | 48 | **MISSING** |  |  |
| COUNTDOWN_DECREASE | CountdownDecreaseAbilityEffect | 0 | 48 | **MISSING** |  |  |
| COUNTDOWN_START | CountdownStartUnitState | 0 | 48 | **MISSING** |  |  |
| CPN_UP_GIV_BREAK_POINT_DMG_RATIO | CpnUpGivBreakPointDmgRatioUnitState | 0 | 0 | - |  |  |
| CPN_UP_GIV_DMG_RATIO | CpnUpGivDmgRatioUnitState | 0 | 0 | - |  |  |
| CURSE_ATK | CurseAtkUnitState | 4 | 590 | **LISTED ONLY** |  | All Souls' Repose, Assault Paranoia, Bebe-O'-Lantern |
| CURSE_BREAK |  | 0 | 0 | - |  |  |
| CURSE_DEF | CurseDefUnitState | 0 | 0 | listed |  |  |
| CURSE_HP | CurseHpUnitState | 0 | 0 | listed |  |  |
| CUTOUT | CutoutUnitState | 1 | 0 | yes | EffectSide.ts, KiokuArchetypes.ts, effectText.ts | Hollow Woman |
| DEC_BUFF_TURN_IMM | DecBuffTurnImmAbilityEffect | 0 | 8 | **MISSING** |  |  |
| DEC_DEBUFF_TURN_IMM | DecDebuffTurnImmAbilityEffect | 0 | 6 | **MISSING** |  |  |
| DMG_ATK | DmgAtkAbilityEffect | 116 | 4637 | yes | EffectSide.ts | A Tale of Cherry Blossoms, Absolute Rain, Absolute Venus |
| DMG_DEF | DmgDefAbilityEffect | 3 | 215 | yes | EffectSide.ts, LuxBench.ts | Baldamente Fortissimo, Soaring Storyteller, Vampire Fang |
| DMG_HP | DmgHpAbilityEffect | 0 | 0 | yes | EffectSide.ts |  |
| DMG_MAGIC |  | 0 | 0 | - |  |  |
| DMG_NMAGIC |  | 0 | 0 | - |  |  |
| DMG_RANDOM | DmgRandomAbilityEffect | 4 | 620 | **LISTED ONLY** |  | Falsified Phenomena, Metallicized Projectile, Tiro Finale Liberation |
| DMG_RATIO | DmgRatioAbilityEffect | 0 | 489 | yes | BattleConditionParser.ts |  |
| DMG_SMAGIC |  | 0 | 0 | - |  |  |
| DRAIN |  | 0 | 0 | - |  |  |
| DWN_AIM_GIV_DMG_FIXED |  | 0 | 0 | - |  |  |
| DWN_AIM_GIV_DMG_RATIO | DwnAimGivDmgRatioUnitState | 0 | 0 | - |  |  |
| DWN_AIM_RCV_DMG_FIXED |  | 0 | 0 | - |  |  |
| DWN_AIM_RCV_DMG_RATIO | DwnAimRcvDmgRatioUnitState | 0 | 0 | - |  |  |
| DWN_ATK_ACCUM_RATIO | DwnAtkAccumRatioUnitState | 0 | 80 | **MISSING** |  |  |
| DWN_ATK_CONSUME_RATIO | DwnAtkConsumeRatioUnitState | 0 | 0 | - |  |  |
| DWN_ATK_FIXED |  | 0 | 0 | - |  |  |
| DWN_ATK_RATIO | DwnAtkRatioUnitState | 6 | 825 | yes | EffectSide.ts, effectText.ts | All Souls' Repose, Pumpkin Death Squall, Structure Destruction |
| DWN_BARRIER_VALUE | DwnBarrierValueUnitState | 0 | 184 | **MISSING** |  |  |
| DWN_BREAKED_DAMAGE_RECEIVE_RATIO | DwnBreakedDamageReceiveRatioUnitState | 0 | 0 | - |  |  |
| DWN_BREAK_DAMAGE_RECEIVE_RATIO | DwnBreakedDamageReceiveRatioUnitState | 0 | 0 | - |  |  |
| DWN_BUFF_EFFECT_VALUE | DwnBuffEffectValueUnitState | 0 | 132 | yes | EffectSide.ts, PvPKioku.ts |  |
| DWN_CTD_ACCUM_RATIO | DwnCtdAccumRatioUnitState | 0 | 5 | **MISSING** |  |  |
| DWN_CTD_CONSUME_FIXED | DwnCtdConsumeFixedUnitState | 0 | 0 | - |  |  |
| DWN_CTD_FIXED | DwnCtdFixedUnitState | 0 | 0 | - |  |  |
| DWN_CTD_RATIO | DwnCtdFixedUnitState | 0 | 1 | **MISSING** |  |  |
| DWN_CTR_ACCUM_RATIO | DwnCtrAccumRatioUnitState | 0 | 5 | **MISSING** |  |  |
| DWN_CTR_CONSUME_FIXED | DwnCtrConsumeFixedUnitState | 0 | 0 | - |  |  |
| DWN_CTR_FIXED | DwnCtrFixedUnitState | 0 | 0 | - |  |  |
| DWN_CTR_RATIO | DwnCtrFixedUnitState | 0 | 287 | **MISSING** |  |  |
| DWN_DEBUFF_EFFECT_VALUE | DwnDebuffEffectValueUnitState | 0 | 68 | yes | EffectSide.ts, PvPKioku.ts |  |
| DWN_DEF_ACCUM_RATIO | DwnDefAccumRatioUnitState | 5 | 258 | yes | effectText.ts | Désintégration, La Danse Macabre, Soul Salvation |
| DWN_DEF_FIXED |  | 0 | 0 | - |  |  |
| DWN_DEF_RATIO | DwnDefRatioUnitState | 17 | 682 | yes | EffectSide.ts, effectText.ts | Atomo Arrabbiato, Bebe-O'-Lantern, Cherry Ballad |
| DWN_ELEMENT_DMG_RATE_RATIO | DwnElementDmgRateRatioUnitState | 0 | 0 | - |  |  |
| DWN_ELEMENT_RESIST_ACCUM_RATIO | DwnElementResistRatioAccumUnitState | 12 | 730 | yes | EffectSide.ts, LuxBench.ts, effectText.ts | Absolute Venus, All Souls' Repose, Atomo Arrabbiato |
| DWN_EP_RECOVER_RATE_RATIO | DwnRecoveryEpRateRatioRatioUnitState | 0 | 651 | **MISSING** |  |  |
| DWN_GIV_BLEED_DMG_RATIO | DwnGivBleedDmgRatioUnitState | 0 | 0 | - |  |  |
| DWN_GIV_BREAK_POINT_DMG_FIXED | DwnGivBreakPointDmgFixedUnitState | 0 | 0 | - |  |  |
| DWN_GIV_BURN_DMG_RATIO | DwnGivBurnDmgRatioUnitState | 0 | 0 | - |  |  |
| DWN_GIV_CURSE_DMG_RATIO | DwnGivCurseDmgRatioUnitState | 0 | 0 | - |  |  |
| DWN_GIV_DMG_ACCUM_RATIO | DwnGivDmgAccumRatioUnitState | 0 | 0 | - |  |  |
| DWN_GIV_DMG_CONSUME_RATIO | DwnGivDmgConsumeRatioUnitState | 1 | 0 | yes | effectText.ts | Thunderous Waltz |
| DWN_GIV_DMG_FIXED |  | 0 | 0 | - |  |  |
| DWN_GIV_DMG_RATIO | DwnGivDmgRatioUnitState | 0 | 497 | **MISSING** |  |  |
| DWN_GIV_NMDMG_FIXED |  | 0 | 0 | - |  |  |
| DWN_GIV_NMDMG_RATIO |  | 0 | 0 | - |  |  |
| DWN_GIV_POISON_DMG_RATIO | DwnGivPoisonDmgRatioUnitState | 0 | 0 | - |  |  |
| DWN_GIV_RECOVERY_FIXED |  | 0 | 0 | - |  |  |
| DWN_GIV_SLIP_DMG_RATIO | DwnGivSlipDmgRatioUnitState | 0 | 0 | - |  |  |
| DWN_GIV_SMDMG_FIXED |  | 0 | 0 | - |  |  |
| DWN_GIV_SMDMG_RATIO |  | 0 | 0 | - |  |  |
| DWN_GIV_VORTEX_DMG_RATIO | DwnGivVortexDmgRatioUnitState | 0 | 0 | - |  |  |
| DWN_HATE | DwnHateUnitState | 0 | 0 | yes | EffectSide.ts |  |
| DWN_HEAL_RATE_RATIO | DwnHealRateRatioUnitState | 0 | 121 | **MISSING** |  |  |
| DWN_NMATK_FIXED |  | 0 | 0 | - |  |  |
| DWN_NMATK_RATIO |  | 0 | 0 | - |  |  |
| DWN_NMDEF_FIXED |  | 0 | 0 | - |  |  |
| DWN_NMDEF_RATIO |  | 0 | 0 | - |  |  |
| DWN_RCV_BREAK_POINT_DMG_RATIO | DwnRcvBreakPointDmgRatioUnitState | 0 | 1065 | **MISSING** |  |  |
| DWN_RCV_DMG_FIXED |  | 0 | 0 | - |  |  |
| DWN_RCV_DMG_RATIO | DwnRcvDmgRatioUnitState | 44 | 1644 | yes | EffectSide.ts, effectText.ts | Absolute Venus, Aqua Tempest, Baldamente Fortissimo |
| DWN_RCV_NMDMG_FIXED |  | 0 | 0 | - |  |  |
| DWN_RCV_NMDMG_RATIO |  | 0 | 0 | - |  |  |
| DWN_RCV_RECOVERY_FIXED |  | 0 | 0 | - |  |  |
| DWN_RCV_RECOVERY_RATIO | DwnRcvRecoveryRatioUnitState | 0 | 106 | **MISSING** |  |  |
| DWN_RCV_SMDMG_FIXED |  | 0 | 0 | - |  |  |
| DWN_RCV_SMDMG_RATIO |  | 0 | 0 | - |  |  |
| DWN_RECOVERY_EP_RATE_RATIO | DwnRecoveryEpRateRatioRatioUnitState | 0 | 0 | - |  |  |
| DWN_SMATK_FIXED |  | 0 | 0 | - |  |  |
| DWN_SMATK_RATIO |  | 0 | 0 | - |  |  |
| DWN_SMDEF_FIXED |  | 0 | 0 | - |  |  |
| DWN_SMDEF_RATIO |  | 0 | 0 | - |  |  |
| DWN_SPD_ACCUM_RATIO | DwnSpdAccumRatioUnitState | 1 | 171 | yes | effectText.ts | Bebe-O'-Lantern |
| DWN_SPD_FIXED | DwnSpdFixedUnitState | 0 | 0 | - |  |  |
| DWN_SPD_RATIO | DwnSpdRatioUnitState | 6 | 1011 | yes | EffectSide.ts, effectText.ts | All Souls' Repose, La Danse Macabre, Pumpkin Death Squall |
| GAIN_BP_FIXED | GainBpFixedAbilityEffect | 2 | 0 | **MISSING** |  | Metallicized Projectile, Vinctio☆Magica |
| GAIN_CHARGE_POINT | GainChargePointAbilityEffect | 43 | 1033 | yes | EffectSide.ts | A Tale of Cherry Blossoms, Absolute Venus, Aqua Tempest |
| GAIN_COUNT_POINT | GainCountPointAbilityEffect | 1 | 0 | **LISTED ONLY** |  | Dark Art Dominion |
| GAIN_EP_FIXED | GainEpFixedAbilityEffect | 67 | 0 | yes | EffectSide.ts, KiokuArchetypes.ts | A Tale of Cherry Blossoms, Absolute Rain, Absolute Venus |
| GAIN_EP_RATIO | GainEpRatioAbilityEffect | 30 | 0 | yes | EffectSide.ts, KiokuArchetypes.ts | A Tale of Cherry Blossoms, Absolute Rain, Brilliant Beam |
| GAIN_SOLO_RAID_BUFF_POINT | GainSoloRaidBuffPointAbilityEffect | 0 | 0 | - |  |  |
| GAIN_SP_FIXED | GainSpFixedAbilityEffect | 30 | 0 | yes | EffectSide.ts, KiokuArchetypes.ts | All Souls' Repose, Aqua Tempest, Buon Natale Grazioso |
| GAIN_ZONE_STACK | GainZoneStackAbilityEffect | 2 | 0 | **LISTED ONLY** |  | Evoluzione Presente, Venusta Dissonanza |
| GVE_UP_FINAL_GAIN_EP_RATIO | GveUpFinalGainEpRatioUnitState | 0 | 0 | - |  |  |
| GVE_UP_SPECIAL_ATTACK_FINAL_GIV_DMG_RATIO | GveUpSpecialAttackFinalGiveDamageRatioUnitState | 0 | 0 | - |  |  |
| HASTE | HasteAbilityEffect | 85 | 1069 | yes | EffectSide.ts, KiokuArchetypes.ts | Absolute Venus, All Souls' Repose, Aqua Tempest |
| IMM_SLIP_DMG | ImmSlipDmgAbilityEffect | 3 | 36 | yes | BestTeamCalculator.ts, EffectSide.ts, EngineBestTeam.ts, luxBenchCache.ts | Marigold Dadaism, My Creations, Nightmare Stinger |
| LOCK_SPECIAL_ATTACK | LockSpecialAttackUnitState | 0 | 4 | **MISSING** |  |  |
| LOCK_TURN_ORDER | LockTurnOrderUnitState | 0 | 45 | **MISSING** |  |  |
| LOSE_BP_FIXED | LoseBpFixedAbilityEffect | 0 | 0 | - |  |  |
| LOSE_EP_FIXED | LoseEpFixedAbilityEffect | 0 | 11 | **MISSING** |  |  |
| LOSE_EP_RATIO | LoseEpRatioAbilityEffect | 0 | 454 | **MISSING** |  |  |
| POISON_ATK | PoisonAtkUnitState | 2 | 201 | **LISTED ONLY** |  | Atomo Arrabbiato, My Creations |
| POISON_BREAK |  | 0 | 0 | - |  |  |
| POISON_DEF | PoisonDefUnitState | 0 | 1 | **LISTED ONLY** |  |  |
| POISON_HP | PoisonHpUnitState | 0 | 0 | listed |  |  |
| PREVENT_ABNORMAL | PreventAbnormalUnitState | 0 | 183 | **MISSING** |  |  |
| RCV_FINAL_DAMAGE | RcvFinalDamageUnitState | 2 | 0 | yes | effectText.ts | Pumpkin Death Squall, Vinctio☆Magica |
| RECOVERY_HP | RecoveryHpAbilityEffect | 20 | 1520 | yes | EffectSide.ts | Baldamente Fortissimo, Circle Of Fire, Folter Gefängnis |
| RECOVERY_HP_ATK | RecoveryHpAtkAbilityEffect | 5 | 0 | yes | EffectSide.ts | All Souls' Repose, Doppel of Silence, Grandioso Sinfonia |
| REFLECTION_RATIO | ReflectionRatioUnitState | 1 | 0 | yes | EffectSide.ts, effectText.ts | Vampire Fang |
| REGAIN_ATK | RegainAtkUnitState | 2 | 0 | yes | effectText.ts | Grandioso Sinfonia, Panna Vorticosa |
| REGAIN_DEF | RegainDefUnitState | 0 | 0 | - |  |  |
| REGAIN_HP | RegainHpUnitState | 0 | 0 | - |  |  |
| REMOVE_ALL_ABNORMAL | RemoveAllAbnormalAbilityEffect | 5 | 476 | yes | EffectSide.ts, KiokuArchetypes.ts | Circle Of Fire, Glitterjoy Snow Globe, Grandioso Sinfonia |
| REMOVE_ALL_BUFF | RemoveAllBuffAbilityEffect | 9 | 470 | yes | EffectSide.ts, KiokuArchetypes.ts | Atomo Arrabbiato, Cherry Ballad, Dark Art Dominion |
| REMOVE_ALL_DEBUFF | RemoveAllDebuffAbilityEffect | 7 | 462 | yes | EffectSide.ts, KiokuArchetypes.ts | All Souls' Repose, Aqua Tempest, My Gigantic Heart |
| REMOVE_ALL_UNABLE_ACTION | RemoveAllUnableActionAbilityEffect | 0 | 50 | yes | EffectSide.ts |  |
| RESET_UNIQUE_BUFF | ResetUniqueBuffAbilityEffect | 3 | 0 | yes | EffectSide.ts | Désintégration, Metallicized Projectile, Venusta Dissonanza |
| RESET_UNIQUE_DEBUFF | ResetUniqueDebuffAbilityEffect | 0 | 0 | listed |  |  |
| REVIVAL_RATIO | RevivalRatioAbilityEffect | 0 | 0 | yes | EffectSide.ts |  |
| RE_ACTION_TURN_UNIT_ACT | ReActionTurnUnitActAbilityEffect | 6 | 0 | yes | EffectSide.ts | Dark Art Dominion, Falsified Phenomena, Final Fatebloom |
| SHIELD | ShieldUnitState | 13 | 559 | yes | EffectSide.ts, effectText.ts | Baldamente Fortissimo, Fiore Finale, Folter Gefängnis |
| SLOW | SlowAbilityEffect | 6 | 905 | yes | EffectSide.ts | Infinite Poseidon, Meteor Punch, Nightmare Stinger |
| STEP_UP_SKILL | StepUpSkillUnitState | 1 | 0 | yes | KiokuArchetypes.ts | Venusta Dissonanza |
| STUN | StunUnitState | 1 | 403 | yes | EffectSide.ts | Ultra Great Big Hammer |
| SUMMON | SummonAbilityEffect | 0 | 411 | **MISSING** |  |  |
| SWITCH_SKILL | SwitchSkillUnitState | 10 | 0 | yes | KiokuArchetypes.ts | Absolute Venus, Falsified Phenomena, Final Fatebloom |
| TRIG_COUNTER_ATTACK |  | 0 | 0 | - |  |  |
| TSUBAME_CORE | TsubameCoreUnitState | 1 | 0 | yes | effectText.ts | Luce della Speranza |
| TSUBAME_LINK | TsubameLinkUnitState | 1 | 0 | yes | KiokuArchetypes.ts, effectText.ts | Luce della Speranza |
| UNIQUE_10030301 | Unique10030301UnitState | 1 | 0 | prefix/template? | effectText.ts | Fiore Finale |
| UNIQUE_10070201 | Unique10070201UnitState | 1 | 0 | prefix/template? | effectText.ts | Groundhog Daze |
| UNIQUE_BUFF | UniqueBuffUnitState | 24 | 0 | prefix/template? | effectText.ts | Absolute Venus, Aqua Tempest, Buon Natale Grazioso |
| UNIQUE_BUFF_ACCUM | UniqueBuffAccumUnitState | 4 | 0 | prefix/template? | effectText.ts | Doppel of Agitation, Falsified Phenomena, Luminous Tenet |
| UNIQUE_DEBUFF | UniqueDebuffUnitState | 4 | 0 | prefix/template? | effectText.ts | Bebe-O'-Lantern, Pumpkin Death Squall, Splashin' Kyubey Blast |
| UNIQUE_DEBUFF_ACCUM | UniqueDebuffAccumUnitState | 3 | 0 | prefix/template? | effectText.ts | All Souls' Repose, Luminous Tenet, Yuletide Gift |
| UNIQUE_ELEMENT_BREAK | UniqueElementBreakUnitState | 0 | 0 | prefix/template? | effectText.ts |  |
| UNIQUE_ELEMENT_STACK | UniqueElementStackUnitState | 2 | 0 | yes | effectText.ts | Pumpkin Death Squall, Vinctio☆Magica |
| UNIQUE_ENEMY_639002 | UniqueEnemy639002UnitState | 0 | 1 | prefix/template? | effectText.ts |  |
| UNIQUE_ZONE | UniqueZoneUnitState | 5 | 0 | yes | effectText.ts | Evoluzione Presente, Falsified Phenomena, Floral Ironspike |
| UP_ABNORMAL_HIT_RATE_RATIO | UpAbnormalHitRateRatioUnitState | 9 | 274 | yes | EffectSide.ts, effectText.ts | All Souls' Repose, Atomo Arrabbiato, Marigold Dadaism |
| UP_ABNORMAL_PARRY_RATE_RATIO | UpAbnormalParryRateRatioUnitState | 0 | 164 | yes | EffectSide.ts |  |
| UP_AIM_GIV_DMG_FIXED |  | 0 | 0 | - |  |  |
| UP_AIM_GIV_DMG_RATIO | UpAimGivDmgRatioUnitState | 0 | 358 | **MISSING** |  |  |
| UP_AIM_RCV_DMG_FIXED |  | 0 | 0 | - |  |  |
| UP_AIM_RCV_DMG_RATIO | UpAimRcvDmgRatioUnitState | 11 | 0 | yes | effectText.ts | Absolute Venus, Cherry Ballad, Cherry Blizzard |
| UP_ATK_ACCUM_RATIO | UpAtkAccumRatioUnitState | 22 | 1352 | yes | effectText.ts | Bebe-O'-Lantern, Buon Natale Grazioso, Evoluzione Presente |
| UP_ATK_CONSUME_FIXED | UpAtkConsumeFixedUnitState | 0 | 0 | - |  |  |
| UP_ATK_CONSUME_RATIO | UpAtkConsumeRatioUnitState | 2 | 0 | yes | effectText.ts | L'Ombre, Pluvia☆Neujahr |
| UP_ATK_FIXED | UpAtkFixedUnitState | 0 | 0 | yes | effectText.ts |  |
| UP_ATK_RATIO | UpAtkRatioUnitState | 61 | 1613 | yes | EffectSide.ts, KiokuArchetypes.ts, effectText.ts | A Tale of Cherry Blossoms, Absolute Rain, All Souls' Repose |
| UP_BREAKED_DAMAGE_RECEIVE_RATIO | UpBreakedDamageReceiveRatioUnitState | 0 | 0 | - |  |  |
| UP_BREAK_DAMAGE_RECEIVE_RATIO | UpBreakedDamageReceiveRatioUnitState | 18 | 0 | yes | EffectSide.ts, effectText.ts | Absolute Venus, Assault Paranoia, Cherry Blizzard |
| UP_BREAK_EFFECT | UpBreakEffectRatioUnitState | 15 | 0 | yes | effectText.ts | Cherry Blizzard, Diamond Splash, Doppel of Agitation |
| UP_BUFF_EFFECT_VALUE | UpBuffEffectValueUnitState | 14 | 251 | yes | EffectSide.ts, PvPKioku.ts, effectText.ts | Aqua Tempest, Brilliant Beam, Buon Natale Grazioso |
| UP_COUNTER_ATTACK_RATIO |  | 0 | 0 | - |  |  |
| UP_CTD_ACCUM_RATIO | UpCtdAccumRatioUnitState | 8 | 0 | yes | effectText.ts | A Tale of Cherry Blossoms, Dark Art Dominion, Evoluzione Presente |
| UP_CTD_CONSUME_FIXED | UpCtdConsumeFixedUnitState | 0 | 0 | - |  |  |
| UP_CTD_FIXED | UpCtdFixedUnitState | 25 | 0 | yes | effectText.ts | Absolute Rain, Absolute Venus, Ayame's Kioku |
| UP_CTD_RATIO | UpCtdFixedUnitState | 5 | 0 | yes | effectText.ts | A Tale of Cherry Blossoms, Absolute Rain, Dark Art Dominion |
| UP_CTR_ACCUM_RATIO | UpCtrAccumRatioUnitState | 6 | 0 | yes | effectText.ts | A Tale of Cherry Blossoms, Dark Art Dominion, Grandioso Sinfonia |
| UP_CTR_CONSUME_FIXED | UpCtrConsumeFixedUnitState | 0 | 0 | - |  |  |
| UP_CTR_FIXED | UpCtrFixedUnitState | 31 | 0 | yes | effectText.ts | Absolute Rain, Absolute Venus, Ayame's Kioku |
| UP_CTR_RATIO | UpCtrFixedUnitState | 5 | 0 | yes | effectText.ts | A Tale of Cherry Blossoms, Assault Paranoia, Crimson Confectioner |
| UP_DEBUFF_EFFECT_VALUE | UpDebuffEffectValueUnitState | 18 | 230 | yes | EffectSide.ts, PvPKioku.ts, effectText.ts | Atomo Arrabbiato, Bebe-O'-Lantern, Cherry Ballad |
| UP_DEF_ACCUM_RATIO | UpDefAccumRatioUnitState | 5 | 655 | yes | effectText.ts | Baldamente Fortissimo, Folter Gefängnis, Kokoro's Kioku |
| UP_DEF_FIXED | UpDefFixedUnitState | 0 | 0 | - |  |  |
| UP_DEF_RATIO | UpDefRatioUnitState | 21 | 1151 | yes | effectText.ts | Baldamente Fortissimo, Evoluzione Presente, Folter Gefängnis |
| UP_EFFECT_HIT_RATE_RATIO | UpEffectHitRateRatioUnitState | 4 | 1 | yes | EffectSide.ts, effectText.ts | Désintégration, Hazuki's Kioku, Mito's Kioku |
| UP_EFFECT_PARRY_RATE_RATIO | UpEffectParryRateRatioUnitState | 0 | 112 | yes | EffectSide.ts |  |
| UP_ELEMENT_DMG_RATE_RATIO | UpElementDmgRateRatioUnitState | 8 | 130 | yes | EffectSide.ts, LuxBench.ts, effectText.ts | Evoluzione Presente, Falsified Phenomena, Fiore Finale |
| UP_ELEMENT_RESIST_ACCUM_RATIO | UpElementResistRatioAccumUnitState | 0 | 23 | **MISSING** |  |  |
| UP_ELEMENT_RESIST_RATIO | UpElementResistRatioUnitState | 0 | 173 | **MISSING** |  |  |
| UP_EP_RECOVER_RATE_RATIO | UpRecoveryEpRateRatioRatioUnitState | 28 | 0 | yes | EffectSide.ts, KiokuArchetypes.ts, LuxBench.ts, effectText.ts | All Souls' Repose, Brilliant Beam, Circle Of Fire |
| UP_GIV_BLEED_DMG_RATIO | UpGivBleedDmgRatioUnitState | 0 | 0 | - |  |  |
| UP_GIV_BREAK_POINT_DMG_FIXED | UpGivBreakPointDmgFixedUnitState | 26 | 0 | yes | EffectSide.ts, effectText.ts, helpers.ts | Absolute Venus, Assault Paranoia, Baldamente Fortissimo |
| UP_GIV_BREAK_POINT_DMG_RATIO | UpGivBreakPointDmgRatioUnitState | 0 | 0 | - |  |  |
| UP_GIV_BURN_DMG_RATIO | UpGivBurnDmgRatioUnitState | 0 | 0 | - |  |  |
| UP_GIV_CURSE_DMG_RATIO | UpGivCurseDmgRatioUnitState | 0 | 0 | - |  |  |
| UP_GIV_DMG_ACCUM_RATIO | UpGivDmgAccumRatioUnitState | 6 | 0 | yes | EffectSide.ts, effectText.ts | Kiss-shot, Light of Reckoning, Metallicized Projectile |
| UP_GIV_DMG_CONSUME_RATIO | UpGivDmgConsumeRatioUnitState | 0 | 0 | - |  |  |
| UP_GIV_DMG_FIXED |  | 0 | 0 | - |  |  |
| UP_GIV_DMG_RATIO | UpGivDmgRatioUnitState | 69 | 1258 | yes | EffectSide.ts, effectText.ts | A Tale of Cherry Blossoms, Absolute Rain, Absolute Venus |
| UP_GIV_NMDMG_FIXED |  | 0 | 0 | - |  |  |
| UP_GIV_NMDMG_RATIO |  | 0 | 0 | - |  |  |
| UP_GIV_POISON_DMG_RATIO | UpGivPoisonDmgRatioUnitState | 0 | 0 | - |  |  |
| UP_GIV_SLIP_DMG_RATIO | UpGivSlipDmgRatioUnitState | 7 | 0 | yes | EffectSide.ts, effectText.ts | All Souls' Repose, Atomo Arrabbiato, Bebe-O'-Lantern |
| UP_GIV_SMDMG_FIXED |  | 0 | 0 | - |  |  |
| UP_GIV_SMDMG_RATIO |  | 0 | 0 | - |  |  |
| UP_GIV_VORTEX_DMG_RATIO | UpGivVortexDmgRatioUnitState | 1 | 0 | yes | EffectSide.ts | Melodia Appassionata |
| UP_HATE | UpHateUnitState | 5 | 0 | yes | EffectSide.ts, effectText.ts, helpers.ts | Folter Gefängnis, La Lumière, Screw Zone |
| UP_HEAL_RATE_RATIO | UpHealRateRatioUnitState | 16 | 124 | yes | effectText.ts | Circle Of Fire, Doppel of Silence, Glitterjoy Snow Globe |
| UP_HP_ATK_DEF_RATIO |  | 0 | 0 | - |  |  |
| UP_HP_FIXED | UpHpFixedUnitState | 0 | 0 | yes | EffectSide.ts |  |
| UP_HP_RATIO | UpHpRatioUnitState | 19 | 0 | yes | EffectSide.ts, effectText.ts | All Souls' Repose, Ayame's Kioku, Circle Of Fire |
| UP_NMATK_FIXED |  | 0 | 0 | - |  |  |
| UP_NMATK_RATIO |  | 0 | 0 | - |  |  |
| UP_NMDEF_FIXED |  | 0 | 0 | - |  |  |
| UP_NMDEF_RATIO |  | 0 | 0 | - |  |  |
| UP_RCV_BREAK_POINT_DMG_RATIO | UpRcvBreakPointDmgRatioUnitState | 4 | 0 | yes | EffectSide.ts, effectText.ts | Atomo Arrabbiato, La Danse Macabre, Melodia Appassionata |
| UP_RCV_CTD_RATIO | UpRcvCtdRatioUnitState | 1 | 0 | **MISSING** |  | Pumpkin Death Squall |
| UP_RCV_CTR_RATIO | UpRcvCtrRatioUnitState | 8 | 0 | yes | effectText.ts | Assault Paranoia, Atomo Arrabbiato, Final Fatebloom |
| UP_RCV_DMG_FIXED |  | 0 | 0 | - |  |  |
| UP_RCV_DMG_RATIO | UpRcvDmgRatioUnitState | 19 | 511 | yes | EffectSide.ts, effectText.ts | All Souls' Repose, Atomo Arrabbiato, Bebe-O'-Lantern |
| UP_RCV_NMDMG_FIXED |  | 0 | 0 | - |  |  |
| UP_RCV_NMDMG_RATIO |  | 0 | 0 | - |  |  |
| UP_RCV_SMDMG_FIXED |  | 0 | 0 | - |  |  |
| UP_RCV_SMDMG_RATIO |  | 0 | 0 | - |  |  |
| UP_RECOVERY_EP_RATE_RATIO | UpRecoveryEpRateRatioRatioUnitState | 0 | 0 | - |  |  |
| UP_SMATK_FIXED |  | 0 | 0 | - |  |  |
| UP_SMATK_RATIO |  | 0 | 0 | - |  |  |
| UP_SMDEF_FIXED |  | 0 | 0 | - |  |  |
| UP_SMDEF_RATIO |  | 0 | 0 | - |  |  |
| UP_SPD_ACCUM_RATIO | UpSpdAccumRatioUnitState | 20 | 815 | yes | effectText.ts | Ayame's Kioku, Doppel of Invitations, Floral Ironspike |
| UP_SPD_FIXED | UpSpdFixedUnitState | 31 | 0 | yes | EffectSide.ts, effectText.ts | Ashley's Kioku, Asuka's Kioku, Ayame's Kioku |
| UP_SPD_RATIO | UpSpdRatioUnitState | 89 | 1482 | yes | EffectSide.ts, KiokuArchetypes.ts, effectText.ts | Absolute Rain, Absolute Venus, All Souls' Repose |
| UP_WEAK_ELEMENT_DMG_ACCUM_RATIO | UpWeakElementDmgAccumRatioUnitState | 1 | 0 | yes | effectText.ts | Evoluzione Presente |
| UP_WEAK_ELEMENT_DMG_CONSUME_RATIO | UpWeakElementDmgConsumeRatioUnitState | 0 | 0 | - |  |  |
| UP_WEAK_ELEMENT_DMG_RATIO | UpWeakElementDmgRatioUnitState | 34 | 0 | yes | EffectSide.ts, effectText.ts | A Tale of Cherry Blossoms, Aqua Tempest, Buon Natale Grazioso |
| VORTEX_ATK | VortexAtkUnitState | 1 | 0 | yes | EffectSide.ts, EngineBestTeam.ts, effectText.ts | Melodia Appassionata |
| WEAKNESS | WeaknessUnitState | 2 | 515 | yes | EffectSide.ts, effectText.ts | Nine Phases, Sacred Gift |
| ZONE_EXPAND | ZoneExpandAbilityEffect | 5 | 0 | **LISTED ONLY** |  | Evoluzione Presente, Falsified Phenomena, Floral Ironspike |
| ZONE_RELEASE | ZoneReleaseAbilityEffect | 0 | 0 | - |  |  |
| ZONE_STACK | ZoneStackAbilityEffect | 5 | 0 | **LISTED ONLY** |  | Evoluzione Presente, Falsified Phenomena, Floral Ironspike |

290 types; 42 are used by data but have no logic reference in the engine: BLEED_ATK, BLEED_DEF, BURN_ATK, BURN_DEF, CONSUME_COUNT_POINT, CONSUME_SELF_HP, CONSUME_ZONE_STACK, COUNTDOWN_CANCEL, COUNTDOWN_DECREASE, COUNTDOWN_START, CURSE_ATK, DEC_BUFF_TURN_IMM, DEC_DEBUFF_TURN_IMM, DMG_RANDOM, DWN_ATK_ACCUM_RATIO, DWN_BARRIER_VALUE, DWN_CTD_ACCUM_RATIO, DWN_CTD_RATIO, DWN_CTR_ACCUM_RATIO, DWN_CTR_RATIO, DWN_EP_RECOVER_RATE_RATIO, DWN_GIV_DMG_RATIO, DWN_HEAL_RATE_RATIO, DWN_RCV_BREAK_POINT_DMG_RATIO, DWN_RCV_RECOVERY_RATIO, GAIN_BP_FIXED, GAIN_COUNT_POINT, GAIN_ZONE_STACK, LOCK_SPECIAL_ATTACK, LOCK_TURN_ORDER, LOSE_EP_FIXED, LOSE_EP_RATIO, POISON_ATK, POISON_DEF, PREVENT_ABNORMAL, SUMMON, UP_AIM_GIV_DMG_RATIO, UP_ELEMENT_RESIST_ACCUM_RATIO, UP_ELEMENT_RESIST_RATIO, UP_RCV_CTD_RATIO, ZONE_EXPAND, ZONE_STACK
