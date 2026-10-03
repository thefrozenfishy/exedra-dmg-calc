# Effect types: data usage vs engine coverage (GENERATED - do not edit)

Built from `main @ a03b8fb 2026-10-03` + uncommitted src/models changes. Regenerate after switching branches or changing the engine: `python3 scripts/ai/xq.py build`. Details for one type: `python3 scripts/ai/xq.py effect <TYPE>`.

- **kiokus** = collectable kiokus (getStyleMstList) whose kit uses it (all levels, id*100+lvl keys, follow-ups followed).
- **stages** = quest stages whose enemies use it (skill sets + enemy passives).
- **TS** = `yes` if the engine (src/models + src/utils, not the generated tables or the old ScoreAttack calculator) compares/cases on it; `prefix/template?` = only matched by a template literal like `UP_${stat}_FIXED` or a `startsWith`/`endsWith` test (may over-match); `**LISTED ONLY**` = only appears in a type list (e.g. target-side tables); `**MISSING**` = never mentioned. A reference is not proof of a full implementation: check with `xq effect <TYPE>` (it lists each reference with its kind).

| effect type | game class | kiokus | stages | TS | TS files | example kiokus |
|---|---|---|---|---|---|---|
| ADDITIONAL_COUNTDOWN_CANCEL_SKILL_ACT | AdditionalCountdownCancelSkillActAbilityEffect | 0 | 42 | yes | PvPTeam.ts |  |
| ADDITIONAL_COUNTDOWN_ZERO_SKILL_ACT | AdditionalCountdownZeroSkillActAbilityEffect | 0 | 42 | yes | PvPTeam.ts |  |
| ADDITIONAL_DAMAGE | AdditionalDamageUnitState | 4 | 0 | yes | DamageCalculator.ts, PvPTeam.ts, effectText.ts | Aqua Tempest, Luminous Tenet, Pluvia☆Neujahr |
| ADDITIONAL_SKILL_ACT | AdditionalSkillActAbilityEffect | 32 | 605 | yes | LuxBench.ts, PvPTeam.ts | A Tale of Cherry Blossoms, Absolute Venus, Aqua Tempest |
| ADDITIONAL_TURN_UNIT_ACT | AdditionalTurnUnitActAbilityEffect | 17 | 99 | yes | PvPTeam.ts | A Tale of Cherry Blossoms, Absolute Rain, Concentrated Missile Fire |
| ADD_BUFF_TURN | AddBuffTurnUnitState | 24 | 0 | yes | PvPTeam.ts, effectText.ts | Aqua Tempest, Baldamente Fortissimo, Buon Natale Grazioso |
| ADD_BUFF_TURN_IMM | AddBuffTurnImmAbilityEffect | 2 | 16 | yes | PvPTeam.ts | Absolute Venus, Scorchin' Summer Spike |
| ADD_DEBUFF_TURN | AddDebuffTurnUnitState | 15 | 3 | yes | PvPTeam.ts, effectText.ts | Assault Paranoia, Atomo Arrabbiato, Bebe-O'-Lantern |
| ADD_DEBUFF_TURN_IMM | AddDebuffTurnImmAbilityEffect | 1 | 74 | yes | PvPTeam.ts | Splashin' Kyubey Blast |
| ADD_DMG_ATK_BLEED |  | 0 | 0 | - |  |  |
| ADD_DMG_ATK_BLEED_ALL |  | 0 | 0 | - |  |  |
| ADD_DMG_ATK_BURN |  | 0 | 0 | - |  |  |
| ADD_DMG_ATK_BURN_ALL |  | 0 | 0 | - |  |  |
| ADD_DMG_ATK_CURSE |  | 0 | 0 | - |  |  |
| ADD_DMG_ATK_CURSE_ALL |  | 0 | 0 | - |  |  |
| ADD_DMG_ATK_POISON |  | 0 | 0 | - |  |  |
| ADD_DMG_ATK_POISON_ALL |  | 0 | 0 | - |  |  |
| ADD_DMG_ATK_STUN |  | 0 | 0 | - |  |  |
| ADD_DMG_ATK_STUN_ALL |  | 0 | 0 | - |  |  |
| ADD_DMG_ATK_WEAKNESS |  | 0 | 0 | - |  |  |
| ADD_DMG_ATK_WEAKNESS_ALL |  | 0 | 0 | - |  |  |
| ADD_DMG_DEF_BLEED |  | 0 | 0 | - |  |  |
| ADD_DMG_DEF_BLEED_ALL |  | 0 | 0 | - |  |  |
| ADD_DMG_DEF_BURN |  | 0 | 0 | - |  |  |
| ADD_DMG_DEF_BURN_ALL |  | 0 | 0 | - |  |  |
| ADD_DMG_DEF_CURSE |  | 0 | 0 | - |  |  |
| ADD_DMG_DEF_CURSE_ALL |  | 0 | 0 | - |  |  |
| ADD_DMG_DEF_POISON |  | 0 | 0 | - |  |  |
| ADD_DMG_DEF_POISON_ALL |  | 0 | 0 | - |  |  |
| ADD_DMG_DEF_STUN |  | 0 | 0 | - |  |  |
| ADD_DMG_DEF_STUN_ALL |  | 0 | 0 | - |  |  |
| ADD_DMG_DEF_WEAKNESS |  | 0 | 0 | - |  |  |
| ADD_DMG_DEF_WEAKNESS_ALL |  | 0 | 0 | - |  |  |
| ADD_DMG_HP_BLEED |  | 0 | 0 | - |  |  |
| ADD_DMG_HP_BLEED_ALL |  | 0 | 0 | - |  |  |
| ADD_DMG_HP_BURN |  | 0 | 0 | - |  |  |
| ADD_DMG_HP_BURN_ALL |  | 0 | 0 | - |  |  |
| ADD_DMG_HP_CURSE |  | 0 | 0 | - |  |  |
| ADD_DMG_HP_CURSE_ALL |  | 0 | 0 | - |  |  |
| ADD_DMG_HP_POISON |  | 0 | 0 | - |  |  |
| ADD_DMG_HP_POISON_ALL |  | 0 | 0 | - |  |  |
| ADD_DMG_HP_STUN |  | 0 | 0 | - |  |  |
| ADD_DMG_HP_STUN_ALL |  | 0 | 0 | - |  |  |
| ADD_DMG_HP_WEAKNESS |  | 0 | 0 | - |  |  |
| ADD_DMG_HP_WEAKNESS_ALL |  | 0 | 0 | - |  |  |
| BARRIER | BarrierUnitState | 9 | 281 | yes | PvPTeam.ts, effectText.ts | Baldamente Fortissimo, Folter Gefängnis, La Lumière |
| BLEED_ATK | BleedAtkUnitState | 1 | 276 | yes | AITargetSelector.ts, PvPTeam.ts | Soul Salvation |
| BLEED_BREAK |  | 0 | 0 | prefix/template? | AITargetSelector.ts |  |
| BLEED_DEF | BleedDefUnitState | 0 | 60 | yes | AITargetSelector.ts, PvPTeam.ts |  |
| BLEED_HP | BleedHpUnitState | 0 | 0 | yes | AITargetSelector.ts, PvPTeam.ts |  |
| BURN_ATK | BurnAtkUnitState | 4 | 418 | yes | AITargetSelector.ts, PvPTeam.ts | Marigold Dadaism, Meteor Punch, My Gigantic Heart |
| BURN_BREAK |  | 0 | 0 | prefix/template? | AITargetSelector.ts |  |
| BURN_DEF | BurnDefUnitState | 0 | 20 | yes | AITargetSelector.ts, PvPTeam.ts |  |
| BURN_HP | BurnHpUnitState | 0 | 0 | yes | AITargetSelector.ts, PvPTeam.ts |  |
| CHANGE_SKILL |  | 0 | 0 | - |  |  |
| CHARGE | ChargeAbilityEffect | 41 | 1236 | yes | AITargetSelector.ts, PvPBattle.ts, PvPTeam.ts, helpers.ts | A Tale of Cherry Blossoms, Absolute Venus, Aqua Tempest |
| COMBO | ComboUnitState | 0 | 2136 | yes | AITargetSelector.ts, PvPTeam.ts, UnitStateEngine.ts |  |
| CONSUME_CHARGE_POINT | ConsumeChargePointAbilityEffect | 35 | 939 | yes | AITargetSelector.ts, PvPTeam.ts | A Tale of Cherry Blossoms, Absolute Venus, Assault Paranoia |
| CONSUME_COUNT_POINT | ConsumeCountPointAbilityEffect | 1 | 0 | yes | PvPTeam.ts | Dark Art Dominion |
| CONSUME_ZONE_STACK | ConsumeZoneStackAbilityEffect | 4 | 0 | yes | PvPTeam.ts | Evoluzione Presente, Falsified Phenomena, Floral Ironspike |
| CONTINUOUS_RECOVERY | ContinuousRecoveryUnitState | 2 | 0 | yes | PvPTeam.ts, effectText.ts | Doppel of Silence, Magic Cake Dish |
| COUNT | CountUnitState | 1 | 0 | yes | PvPTeam.ts, effectText.ts | Dark Art Dominion |
| COUNTDOWN_CANCEL | CountdownCancelAbilityEffect | 0 | 42 | yes | PvPTeam.ts |  |
| COUNTDOWN_DECREASE | CountdownDecreaseAbilityEffect | 0 | 42 | yes | PvPTeam.ts |  |
| COUNTDOWN_START | CountdownStartUnitState | 0 | 42 | yes | PvPBattle.ts, PvPTeam.ts |  |
| CPN_UP_GIV_BREAK_POINT_DMG_RATIO | CpnUpGivBreakPointDmgRatioUnitState | 0 | 0 | yes | BreakPoint.ts |  |
| CPN_UP_GIV_DMG_RATIO | CpnUpGivDmgRatioUnitState | 0 | 0 | yes | UnitStateEngine.ts |  |
| CURSE_ATK | CurseAtkUnitState | 3 | 590 | yes | AITargetSelector.ts, PvPTeam.ts | Assault Paranoia, Bebe-O'-Lantern, Nightmare Stinger |
| CURSE_BREAK |  | 0 | 0 | prefix/template? | AITargetSelector.ts |  |
| CURSE_DEF | CurseDefUnitState | 0 | 0 | yes | AITargetSelector.ts, PvPTeam.ts |  |
| CURSE_HP | CurseHpUnitState | 0 | 0 | yes | AITargetSelector.ts, PvPTeam.ts |  |
| CUTOUT | CutoutUnitState | 1 | 0 | yes | AITargetSelector.ts, PvPTeam.ts | Hollow Woman |
| DEC_BUFF_TURN_IMM | DecBuffTurnImmAbilityEffect | 0 | 8 | yes | PvPTeam.ts |  |
| DEC_DEBUFF_TURN_IMM | DecDebuffTurnImmAbilityEffect | 0 | 6 | yes | PvPTeam.ts |  |
| DMG_ATK | DmgAtkAbilityEffect | 112 | 4428 | yes | DamageCalculator.ts, PvPTeam.ts | A Tale of Cherry Blossoms, Absolute Rain, Absolute Venus |
| DMG_DEF | DmgDefAbilityEffect | 3 | 215 | yes | DamageCalculator.ts, PvPTeam.ts | Baldamente Fortissimo, Soaring Storyteller, Vampire Fang |
| DMG_HP | DmgHpAbilityEffect | 0 | 0 | yes | DamageCalculator.ts, PvPTeam.ts |  |
| DMG_MAGIC |  | 0 | 0 | - |  |  |
| DMG_NMAGIC |  | 0 | 0 | - |  |  |
| DMG_RANDOM | DmgRandomAbilityEffect | 3 | 598 | yes | DamageCalculator.ts, PvPTeam.ts | Falsified Phenomena, Metallicized Projectile, Tiro Finale Liberation |
| DMG_RATIO | DmgRatioAbilityEffect | 0 | 487 | yes | BattleConditionParser.ts, PvPTeam.ts |  |
| DMG_SMAGIC |  | 0 | 0 | - |  |  |
| DRAIN |  | 0 | 0 | - |  |  |
| DWN_AIM_GIV_DMG_FIXED |  | 0 | 0 | prefix/template? | UnitStateEngine.ts |  |
| DWN_AIM_GIV_DMG_RATIO | DwnAimGivDmgRatioUnitState | 0 | 0 | yes | UnitStateEngine.ts |  |
| DWN_AIM_RCV_DMG_FIXED |  | 0 | 0 | prefix/template? | UnitStateEngine.ts |  |
| DWN_AIM_RCV_DMG_RATIO | DwnAimRcvDmgRatioUnitState | 0 | 0 | yes | UnitStateEngine.ts |  |
| DWN_ATK_ACCUM_RATIO | DwnAtkAccumRatioUnitState | 0 | 74 | yes | PvPTeam.ts, UnitStateEngine.ts |  |
| DWN_ATK_CONSUME_RATIO | DwnAtkConsumeRatioUnitState | 0 | 0 | prefix/template? | UnitStateEngine.ts |  |
| DWN_ATK_FIXED |  | 0 | 0 | prefix/template? | UnitStateEngine.ts |  |
| DWN_ATK_RATIO | DwnAtkRatioUnitState | 4 | 768 | yes | PvPTeam.ts, UnitStateEngine.ts, effectText.ts | Structure Destruction, Thunderous Waltz, Vampire Fang |
| DWN_BARRIER_VALUE | DwnBarrierValueUnitState | 0 | 184 | yes | PvPTeam.ts |  |
| DWN_BREAKED_DAMAGE_RECEIVE_RATIO | DwnBreakedDamageReceiveRatioUnitState | 0 | 0 | yes | BreakPoint.ts, UnitStateEngine.ts |  |
| DWN_BREAK_DAMAGE_RECEIVE_RATIO | DwnBreakedDamageReceiveRatioUnitState | 0 | 0 | yes | BreakPoint.ts, UnitStateEngine.ts |  |
| DWN_BUFF_EFFECT_VALUE | DwnBuffEffectValueUnitState | 0 | 132 | yes | PvPKioku.ts, PvPTeam.ts |  |
| DWN_CTD_ACCUM_RATIO | DwnCtdAccumRatioUnitState | 0 | 5 | prefix/template? | UnitStateEngine.ts |  |
| DWN_CTD_CONSUME_FIXED | DwnCtdConsumeFixedUnitState | 0 | 0 | prefix/template? | UnitStateEngine.ts |  |
| DWN_CTD_FIXED | DwnCtdFixedUnitState | 0 | 0 | prefix/template? | UnitStateEngine.ts |  |
| DWN_CTD_RATIO | DwnCtdFixedUnitState | 0 | 1 | prefix/template? | UnitStateEngine.ts |  |
| DWN_CTR_ACCUM_RATIO | DwnCtrAccumRatioUnitState | 0 | 5 | prefix/template? | UnitStateEngine.ts |  |
| DWN_CTR_CONSUME_FIXED | DwnCtrConsumeFixedUnitState | 0 | 0 | prefix/template? | UnitStateEngine.ts |  |
| DWN_CTR_FIXED | DwnCtrFixedUnitState | 0 | 0 | prefix/template? | UnitStateEngine.ts |  |
| DWN_CTR_RATIO | DwnCtrFixedUnitState | 0 | 287 | prefix/template? | UnitStateEngine.ts |  |
| DWN_DEBUFF_EFFECT_VALUE | DwnDebuffEffectValueUnitState | 0 | 68 | yes | PvPKioku.ts, PvPTeam.ts |  |
| DWN_DEF_ACCUM_RATIO | DwnDefAccumRatioUnitState | 5 | 232 | yes | PvPTeam.ts, UnitStateEngine.ts, effectText.ts | Désintégration, La Danse Macabre, Soul Salvation |
| DWN_DEF_FIXED |  | 0 | 0 | prefix/template? | UnitStateEngine.ts |  |
| DWN_DEF_RATIO | DwnDefRatioUnitState | 15 | 652 | yes | PvPTeam.ts, UnitStateEngine.ts, effectText.ts | Atomo Arrabbiato, Bebe-O'-Lantern, Cherry Ballad |
| DWN_ELEMENT_DMG_RATE_RATIO | DwnElementDmgRateRatioUnitState | 0 | 0 | yes | UnitStateEngine.ts |  |
| DWN_ELEMENT_RESIST_ACCUM_RATIO | DwnElementResistRatioAccumUnitState | 10 | 658 | yes | PvPTeam.ts, UnitStateEngine.ts, effectText.ts | Absolute Venus, Atomo Arrabbiato, Baldamente Fortissimo |
| DWN_EP_RECOVER_RATE_RATIO | DwnRecoveryEpRateRatioRatioUnitState | 0 | 650 | yes | PvPTeam.ts, UnitStateEngine.ts |  |
| DWN_GIV_BLEED_DMG_RATIO | DwnGivBleedDmgRatioUnitState | 0 | 0 | yes | UnitStateEngine.ts |  |
| DWN_GIV_BREAK_POINT_DMG_FIXED | DwnGivBreakPointDmgFixedUnitState | 0 | 0 | yes | BreakPoint.ts, UnitStateEngine.ts |  |
| DWN_GIV_BURN_DMG_RATIO | DwnGivBurnDmgRatioUnitState | 0 | 0 | yes | UnitStateEngine.ts |  |
| DWN_GIV_CURSE_DMG_RATIO | DwnGivCurseDmgRatioUnitState | 0 | 0 | yes | UnitStateEngine.ts |  |
| DWN_GIV_DMG_ACCUM_RATIO | DwnGivDmgAccumRatioUnitState | 0 | 0 | yes | UnitStateEngine.ts |  |
| DWN_GIV_DMG_CONSUME_RATIO | DwnGivDmgConsumeRatioUnitState | 1 | 0 | yes | UnitStateEngine.ts, effectText.ts | Thunderous Waltz |
| DWN_GIV_DMG_FIXED |  | 0 | 0 | prefix/template? | UnitStateEngine.ts |  |
| DWN_GIV_DMG_RATIO | DwnGivDmgRatioUnitState | 0 | 490 | yes | UnitStateEngine.ts |  |
| DWN_GIV_NMDMG_FIXED |  | 0 | 0 | prefix/template? | UnitStateEngine.ts |  |
| DWN_GIV_NMDMG_RATIO |  | 0 | 0 | prefix/template? | UnitStateEngine.ts |  |
| DWN_GIV_POISON_DMG_RATIO | DwnGivPoisonDmgRatioUnitState | 0 | 0 | yes | UnitStateEngine.ts |  |
| DWN_GIV_RECOVERY_FIXED |  | 0 | 0 | prefix/template? | UnitStateEngine.ts |  |
| DWN_GIV_SLIP_DMG_RATIO | DwnGivSlipDmgRatioUnitState | 0 | 0 | yes | UnitStateEngine.ts |  |
| DWN_GIV_SMDMG_FIXED |  | 0 | 0 | prefix/template? | UnitStateEngine.ts |  |
| DWN_GIV_SMDMG_RATIO |  | 0 | 0 | prefix/template? | UnitStateEngine.ts |  |
| DWN_GIV_VORTEX_DMG_RATIO | DwnGivVortexDmgRatioUnitState | 0 | 0 | yes | UnitStateEngine.ts |  |
| DWN_HATE | DwnHateUnitState | 0 | 0 | yes | PvPTeam.ts, UnitStateEngine.ts |  |
| DWN_HEAL_RATE_RATIO | DwnHealRateRatioUnitState | 0 | 121 | yes | UnitStateEngine.ts |  |
| DWN_NMATK_FIXED |  | 0 | 0 | prefix/template? | UnitStateEngine.ts |  |
| DWN_NMATK_RATIO |  | 0 | 0 | prefix/template? | UnitStateEngine.ts |  |
| DWN_NMDEF_FIXED |  | 0 | 0 | prefix/template? | UnitStateEngine.ts |  |
| DWN_NMDEF_RATIO |  | 0 | 0 | prefix/template? | UnitStateEngine.ts |  |
| DWN_RCV_BREAK_POINT_DMG_RATIO | DwnRcvBreakPointDmgRatioUnitState | 0 | 1037 | yes | BreakPoint.ts, UnitStateEngine.ts |  |
| DWN_RCV_DMG_FIXED |  | 0 | 0 | prefix/template? | UnitStateEngine.ts |  |
| DWN_RCV_DMG_RATIO | DwnRcvDmgRatioUnitState | 41 | 1567 | yes | PvPTeam.ts, UnitStateEngine.ts, effectText.ts | Absolute Venus, Aqua Tempest, Baldamente Fortissimo |
| DWN_RCV_NMDMG_FIXED |  | 0 | 0 | prefix/template? | UnitStateEngine.ts |  |
| DWN_RCV_NMDMG_RATIO |  | 0 | 0 | prefix/template? | UnitStateEngine.ts |  |
| DWN_RCV_RECOVERY_FIXED |  | 0 | 0 | prefix/template? | UnitStateEngine.ts |  |
| DWN_RCV_RECOVERY_RATIO | DwnRcvRecoveryRatioUnitState | 0 | 106 | yes | UnitStateEngine.ts |  |
| DWN_RCV_SMDMG_FIXED |  | 0 | 0 | prefix/template? | UnitStateEngine.ts |  |
| DWN_RCV_SMDMG_RATIO |  | 0 | 0 | prefix/template? | UnitStateEngine.ts |  |
| DWN_RECOVERY_EP_RATE_RATIO | DwnRecoveryEpRateRatioRatioUnitState | 0 | 0 | prefix/template? | UnitStateEngine.ts |  |
| DWN_SMATK_FIXED |  | 0 | 0 | prefix/template? | UnitStateEngine.ts |  |
| DWN_SMATK_RATIO |  | 0 | 0 | prefix/template? | UnitStateEngine.ts |  |
| DWN_SMDEF_FIXED |  | 0 | 0 | prefix/template? | UnitStateEngine.ts |  |
| DWN_SMDEF_RATIO |  | 0 | 0 | prefix/template? | UnitStateEngine.ts |  |
| DWN_SPD_ACCUM_RATIO | DwnSpdAccumRatioUnitState | 1 | 171 | yes | PvPTeam.ts, UnitStateEngine.ts, effectText.ts | Bebe-O'-Lantern |
| DWN_SPD_FIXED | DwnSpdFixedUnitState | 0 | 0 | yes | UnitStateEngine.ts |  |
| DWN_SPD_RATIO | DwnSpdRatioUnitState | 4 | 934 | yes | PvPTeam.ts, UnitStateEngine.ts, effectText.ts | La Danse Macabre, Splashin' Kyubey Blast, Vampire Fang |
| GAIN_BP_FIXED | GainBpFixedAbilityEffect | 2 | 0 | yes | PvPTeam.ts | Metallicized Projectile, Vinctio☆Magica |
| GAIN_CHARGE_POINT | GainChargePointAbilityEffect | 41 | 946 | yes | AITargetSelector.ts, PvPTeam.ts | A Tale of Cherry Blossoms, Absolute Venus, Aqua Tempest |
| GAIN_COUNT_POINT | GainCountPointAbilityEffect | 1 | 0 | yes | PvPTeam.ts | Dark Art Dominion |
| GAIN_EP_FIXED | GainEpFixedAbilityEffect | 63 | 0 | yes | AITargetSelector.ts, PvPTeam.ts | A Tale of Cherry Blossoms, Absolute Rain, Absolute Venus |
| GAIN_EP_RATIO | GainEpRatioAbilityEffect | 29 | 0 | yes | AITargetSelector.ts, PvPTeam.ts | A Tale of Cherry Blossoms, Absolute Rain, Brilliant Beam |
| GAIN_SOLO_RAID_BUFF_POINT | GainSoloRaidBuffPointAbilityEffect | 0 | 0 | yes | PvPTeam.ts |  |
| GAIN_SP_FIXED | GainSpFixedAbilityEffect | 28 | 0 | yes | AITargetSelector.ts, PvPTeam.ts | Aqua Tempest, Buon Natale Grazioso, Carnival Cuddleboom |
| GAIN_ZONE_STACK | GainZoneStackAbilityEffect | 1 | 0 | yes | PvPTeam.ts | Evoluzione Presente |
| GVE_UP_FINAL_GAIN_EP_RATIO | GveUpFinalGainEpRatioUnitState | 0 | 0 | prefix/template? | AITargetSelector.ts |  |
| GVE_UP_SPECIAL_ATTACK_FINAL_GIV_DMG_RATIO | GveUpSpecialAttackFinalGiveDamageRatioUnitState | 0 | 0 | prefix/template? | AITargetSelector.ts |  |
| HASTE | HasteAbilityEffect | 82 | 1016 | yes | AITargetSelector.ts, PvPTeam.ts | Absolute Venus, Aqua Tempest, Ashley's Kioku |
| IMM_SLIP_DMG | ImmSlipDmgAbilityEffect | 3 | 36 | yes | AITargetSelector.ts, BestTeamCalculator.ts, PvPTeam.ts | Marigold Dadaism, My Creations, Nightmare Stinger |
| LOCK_SPECIAL_ATTACK | LockSpecialAttackUnitState | 0 | 0 | yes | AITargetSelector.ts, PvPTeam.ts |  |
| LOCK_TURN_ORDER | LockTurnOrderUnitState | 0 | 45 | yes | PvPTeam.ts |  |
| LOSE_BP_FIXED | LoseBpFixedAbilityEffect | 0 | 0 | yes | PvPTeam.ts |  |
| LOSE_EP_FIXED | LoseEpFixedAbilityEffect | 0 | 11 | yes | AITargetSelector.ts, PvPTeam.ts |  |
| LOSE_EP_RATIO | LoseEpRatioAbilityEffect | 0 | 447 | yes | AITargetSelector.ts, PvPTeam.ts |  |
| POISON_ATK | PoisonAtkUnitState | 2 | 201 | yes | AITargetSelector.ts, PvPTeam.ts | Atomo Arrabbiato, My Creations |
| POISON_BREAK |  | 0 | 0 | prefix/template? | AITargetSelector.ts |  |
| POISON_DEF | PoisonDefUnitState | 0 | 1 | yes | AITargetSelector.ts, PvPTeam.ts |  |
| POISON_HP | PoisonHpUnitState | 0 | 0 | yes | AITargetSelector.ts, PvPTeam.ts |  |
| PREVENT_ABNORMAL | PreventAbnormalUnitState | 0 | 132 | yes | PvPTeam.ts |  |
| RCV_FINAL_DAMAGE | RcvFinalDamageUnitState | 1 | 0 | yes | UnitStateEngine.ts, effectText.ts | Vinctio☆Magica |
| RECOVERY_HP | RecoveryHpAbilityEffect | 20 | 1423 | yes | AITargetSelector.ts, PvPTeam.ts | Baldamente Fortissimo, Circle Of Fire, Folter Gefängnis |
| RECOVERY_HP_ATK | RecoveryHpAtkAbilityEffect | 3 | 0 | yes | AITargetSelector.ts, PvPTeam.ts | Doppel of Silence, Grandioso Sinfonia, Nothing to Despair, Ever |
| REFLECTION_RATIO | ReflectionRatioUnitState | 1 | 0 | yes | PvPTeam.ts, effectText.ts | Vampire Fang |
| REGAIN_ATK | RegainAtkUnitState | 2 | 0 | yes | PvPTeam.ts, effectText.ts | Grandioso Sinfonia, Panna Vorticosa |
| REGAIN_DEF | RegainDefUnitState | 0 | 0 | yes | PvPTeam.ts |  |
| REGAIN_HP | RegainHpUnitState | 0 | 0 | listed |  |  |
| REMOVE_ALL_ABNORMAL | RemoveAllAbnormalAbilityEffect | 5 | 425 | yes | AITargetSelector.ts, PvPTeam.ts | Circle Of Fire, Glitterjoy Snow Globe, Grandioso Sinfonia |
| REMOVE_ALL_BUFF | RemoveAllBuffAbilityEffect | 9 | 445 | yes | AITargetSelector.ts, PvPTeam.ts | Atomo Arrabbiato, Cherry Ballad, Dark Art Dominion |
| REMOVE_ALL_DEBUFF | RemoveAllDebuffAbilityEffect | 6 | 458 | yes | AITargetSelector.ts, PvPTeam.ts | Aqua Tempest, My Gigantic Heart, Panna Vorticosa |
| REMOVE_ALL_UNABLE_ACTION | RemoveAllUnableActionAbilityEffect | 0 | 50 | yes | AITargetSelector.ts, PvPTeam.ts |  |
| RESET_UNIQUE_BUFF | ResetUniqueBuffAbilityEffect | 2 | 0 | yes | PvPTeam.ts | Désintégration, Metallicized Projectile |
| RESET_UNIQUE_DEBUFF | ResetUniqueDebuffAbilityEffect | 0 | 0 | yes | PvPTeam.ts |  |
| REVIVAL_RATIO | RevivalRatioAbilityEffect | 0 | 0 | yes | AITargetSelector.ts, PvPTeam.ts |  |
| RE_ACTION_TURN_UNIT_ACT | ReActionTurnUnitActAbilityEffect | 5 | 0 | yes | PvPTeam.ts | Dark Art Dominion, Falsified Phenomena, Final Fatebloom |
| SHIELD | ShieldUnitState | 13 | 545 | yes | PvPBattle.ts, PvPTeam.ts, UnitStateEngine.ts, effectText.ts | Baldamente Fortissimo, Fiore Finale, Folter Gefängnis |
| SLOW | SlowAbilityEffect | 6 | 855 | yes | AITargetSelector.ts, PvPTeam.ts | Infinite Poseidon, Meteor Punch, Nightmare Stinger |
| STUN | StunUnitState | 1 | 403 | yes | PvPTeam.ts, UnitStateEngine.ts | Ultra Great Big Hammer |
| SUMMON | SummonAbilityEffect | 0 | 335 | yes | PvPTeam.ts |  |
| SWITCH_SKILL | SwitchSkillUnitState | 9 | 0 | yes | PvPTeam.ts | Absolute Venus, Falsified Phenomena, Final Fatebloom |
| TRIG_COUNTER_ATTACK |  | 0 | 0 | - |  |  |
| TSUBAME_CORE | TsubameCoreUnitState | 1 | 0 | yes | PvPTeam.ts, UnitStateEngine.ts, effectText.ts | Luce della Speranza |
| TSUBAME_LINK | TsubameLinkUnitState | 1 | 0 | yes | PvPTeam.ts, UnitStateEngine.ts, effectText.ts | Luce della Speranza |
| UNIQUE_10030301 | Unique10030301UnitState | 1 | 0 | prefix/template? | effectText.ts | Fiore Finale |
| UNIQUE_10070201 | Unique10070201UnitState | 1 | 0 | prefix/template? | effectText.ts | Groundhog Daze |
| UNIQUE_BUFF | UniqueBuffUnitState | 24 | 0 | prefix/template? | effectText.ts | Absolute Venus, Aqua Tempest, Buon Natale Grazioso |
| UNIQUE_BUFF_ACCUM | UniqueBuffAccumUnitState | 2 | 0 | yes | BattleConditionParser.ts, PvPTeam.ts, effectText.ts | Falsified Phenomena, Luminous Tenet |
| UNIQUE_DEBUFF | UniqueDebuffUnitState | 3 | 0 | prefix/template? | effectText.ts | Bebe-O'-Lantern, Splashin' Kyubey Blast, Vinctio☆Magica |
| UNIQUE_DEBUFF_ACCUM | UniqueDebuffAccumUnitState | 2 | 0 | yes | BattleConditionParser.ts, PvPTeam.ts, effectText.ts | Luminous Tenet, Yuletide Gift |
| UNIQUE_ELEMENT_BREAK | UniqueElementBreakUnitState | 0 | 0 | yes | BattleConditionParser.ts, PvPTeam.ts, effectText.ts |  |
| UNIQUE_ELEMENT_STACK | UniqueElementStackUnitState | 1 | 0 | yes | BattleConditionParser.ts, PvPTeam.ts, effectText.ts | Vinctio☆Magica |
| UNIQUE_ENEMY_639002 | UniqueEnemy639002UnitState | 0 | 1 | yes | PvPTeam.ts, effectText.ts |  |
| UNIQUE_ZONE | UniqueZoneUnitState | 4 | 0 | yes | BattleConditionParser.ts, PvPTeam.ts, effectText.ts | Evoluzione Presente, Falsified Phenomena, Floral Ironspike |
| UP_ABNORMAL_HIT_RATE_RATIO | UpAbnormalHitRateRatioUnitState | 8 | 274 | yes | PvPTeam.ts, UnitStateEngine.ts, effectText.ts | Atomo Arrabbiato, Marigold Dadaism, Meteor Punch |
| UP_ABNORMAL_PARRY_RATE_RATIO | UpAbnormalParryRateRatioUnitState | 0 | 164 | yes | PvPTeam.ts, UnitStateEngine.ts |  |
| UP_AIM_GIV_DMG_FIXED |  | 0 | 0 | prefix/template? | UnitStateEngine.ts |  |
| UP_AIM_GIV_DMG_RATIO | UpAimGivDmgRatioUnitState | 0 | 358 | yes | UnitStateEngine.ts |  |
| UP_AIM_RCV_DMG_FIXED |  | 0 | 0 | prefix/template? | UnitStateEngine.ts |  |
| UP_AIM_RCV_DMG_RATIO | UpAimRcvDmgRatioUnitState | 10 | 0 | yes | UnitStateEngine.ts, effectText.ts | Absolute Venus, Cherry Ballad, Cherry Blizzard |
| UP_ATK_ACCUM_RATIO | UpAtkAccumRatioUnitState | 21 | 1247 | yes | AITargetSelector.ts, PvPTeam.ts, UnitStateEngine.ts, effectText.ts | Bebe-O'-Lantern, Buon Natale Grazioso, Evoluzione Presente |
| UP_ATK_CONSUME_FIXED | UpAtkConsumeFixedUnitState | 0 | 0 | prefix/template? | UnitStateEngine.ts |  |
| UP_ATK_CONSUME_RATIO | UpAtkConsumeRatioUnitState | 2 | 0 | yes | UnitStateEngine.ts, effectText.ts | L'Ombre, Pluvia☆Neujahr |
| UP_ATK_FIXED | UpAtkFixedUnitState | 0 | 0 | yes | AITargetSelector.ts, UnitStateEngine.ts, effectText.ts |  |
| UP_ATK_RATIO | UpAtkRatioUnitState | 59 | 1521 | yes | AITargetSelector.ts, PvPTeam.ts, UnitStateEngine.ts, effectText.ts | A Tale of Cherry Blossoms, Absolute Rain, Aqua Tempest |
| UP_BREAKED_DAMAGE_RECEIVE_RATIO | UpBreakedDamageReceiveRatioUnitState | 0 | 0 | yes | BreakPoint.ts, UnitStateEngine.ts |  |
| UP_BREAK_DAMAGE_RECEIVE_RATIO | UpBreakedDamageReceiveRatioUnitState | 17 | 0 | yes | BreakPoint.ts, PvPTeam.ts, UnitStateEngine.ts, effectText.ts | Absolute Venus, Assault Paranoia, Cherry Blizzard |
| UP_BREAK_EFFECT | UpBreakEffectRatioUnitState | 14 | 0 | yes | effectText.ts | Cherry Blizzard, Diamond Splash, Hanna's Kioku |
| UP_BUFF_EFFECT_VALUE | UpBuffEffectValueUnitState | 14 | 251 | yes | PvPKioku.ts, PvPTeam.ts, effectText.ts | Aqua Tempest, Brilliant Beam, Buon Natale Grazioso |
| UP_COUNTER_ATTACK_RATIO |  | 0 | 0 | prefix/template? | UnitStateEngine.ts |  |
| UP_CTD_ACCUM_RATIO | UpCtdAccumRatioUnitState | 8 | 0 | yes | UnitStateEngine.ts, effectText.ts | A Tale of Cherry Blossoms, Dark Art Dominion, Evoluzione Presente |
| UP_CTD_CONSUME_FIXED | UpCtdConsumeFixedUnitState | 0 | 0 | prefix/template? | UnitStateEngine.ts |  |
| UP_CTD_FIXED | UpCtdFixedUnitState | 25 | 0 | yes | UnitStateEngine.ts, effectText.ts | Absolute Rain, Absolute Venus, Ayame's Kioku |
| UP_CTD_RATIO | UpCtdFixedUnitState | 5 | 0 | yes | UnitStateEngine.ts, effectText.ts | A Tale of Cherry Blossoms, Absolute Rain, Dark Art Dominion |
| UP_CTR_ACCUM_RATIO | UpCtrAccumRatioUnitState | 6 | 0 | yes | UnitStateEngine.ts, effectText.ts | A Tale of Cherry Blossoms, Dark Art Dominion, Grandioso Sinfonia |
| UP_CTR_CONSUME_FIXED | UpCtrConsumeFixedUnitState | 0 | 0 | prefix/template? | UnitStateEngine.ts |  |
| UP_CTR_FIXED | UpCtrFixedUnitState | 29 | 0 | yes | UnitStateEngine.ts, effectText.ts | Absolute Rain, Absolute Venus, Ayame's Kioku |
| UP_CTR_RATIO | UpCtrFixedUnitState | 5 | 0 | yes | UnitStateEngine.ts, effectText.ts | A Tale of Cherry Blossoms, Assault Paranoia, Crimson Confectioner |
| UP_DEBUFF_EFFECT_VALUE | UpDebuffEffectValueUnitState | 17 | 230 | yes | PvPKioku.ts, PvPTeam.ts, effectText.ts | Atomo Arrabbiato, Bebe-O'-Lantern, Cherry Ballad |
| UP_DEF_ACCUM_RATIO | UpDefAccumRatioUnitState | 5 | 655 | yes | AITargetSelector.ts, PvPTeam.ts, UnitStateEngine.ts, effectText.ts | Baldamente Fortissimo, Folter Gefängnis, Kokoro's Kioku |
| UP_DEF_FIXED | UpDefFixedUnitState | 0 | 0 | yes | AITargetSelector.ts, UnitStateEngine.ts |  |
| UP_DEF_RATIO | UpDefRatioUnitState | 21 | 1069 | yes | AITargetSelector.ts, UnitStateEngine.ts, effectText.ts | Baldamente Fortissimo, Evoluzione Presente, Folter Gefängnis |
| UP_EFFECT_HIT_RATE_RATIO | UpEffectHitRateRatioUnitState | 4 | 1 | yes | PvPTeam.ts, UnitStateEngine.ts, effectText.ts | Désintégration, Hazuki's Kioku, Mito's Kioku |
| UP_EFFECT_PARRY_RATE_RATIO | UpEffectParryRateRatioUnitState | 0 | 112 | yes | PvPTeam.ts, UnitStateEngine.ts |  |
| UP_ELEMENT_DMG_RATE_RATIO | UpElementDmgRateRatioUnitState | 7 | 130 | yes | PvPTeam.ts, UnitStateEngine.ts, effectText.ts | Evoluzione Presente, Falsified Phenomena, Fiore Finale |
| UP_ELEMENT_RESIST_ACCUM_RATIO | UpElementResistRatioAccumUnitState | 0 | 23 | yes | UnitStateEngine.ts |  |
| UP_ELEMENT_RESIST_RATIO | UpElementResistRatioUnitState | 0 | 173 | yes | UnitStateEngine.ts |  |
| UP_EP_RECOVER_RATE_RATIO | UpRecoveryEpRateRatioRatioUnitState | 27 | 0 | yes | PvPTeam.ts, UnitStateEngine.ts, effectText.ts | Brilliant Beam, Circle Of Fire, Doppel of Silence |
| UP_GIV_BLEED_DMG_RATIO | UpGivBleedDmgRatioUnitState | 0 | 0 | yes | UnitStateEngine.ts |  |
| UP_GIV_BREAK_POINT_DMG_FIXED | UpGivBreakPointDmgFixedUnitState | 25 | 0 | yes | BreakPoint.ts, PvPTeam.ts, UnitStateEngine.ts, effectText.ts, helpers.ts | Absolute Venus, Assault Paranoia, Baldamente Fortissimo |
| UP_GIV_BREAK_POINT_DMG_RATIO | UpGivBreakPointDmgRatioUnitState | 0 | 0 | yes | BreakPoint.ts, UnitStateEngine.ts |  |
| UP_GIV_BURN_DMG_RATIO | UpGivBurnDmgRatioUnitState | 0 | 0 | yes | UnitStateEngine.ts |  |
| UP_GIV_CURSE_DMG_RATIO | UpGivCurseDmgRatioUnitState | 0 | 0 | yes | UnitStateEngine.ts |  |
| UP_GIV_DMG_ACCUM_RATIO | UpGivDmgAccumRatioUnitState | 4 | 0 | yes | PvPTeam.ts, UnitStateEngine.ts, effectText.ts | Kiss-shot, Light of Reckoning, Metallicized Projectile |
| UP_GIV_DMG_CONSUME_RATIO | UpGivDmgConsumeRatioUnitState | 0 | 0 | yes | UnitStateEngine.ts |  |
| UP_GIV_DMG_FIXED |  | 0 | 0 | prefix/template? | UnitStateEngine.ts |  |
| UP_GIV_DMG_RATIO | UpGivDmgRatioUnitState | 68 | 1168 | yes | PvPTeam.ts, UnitStateEngine.ts, effectText.ts | A Tale of Cherry Blossoms, Absolute Rain, Absolute Venus |
| UP_GIV_NMDMG_FIXED |  | 0 | 0 | prefix/template? | UnitStateEngine.ts |  |
| UP_GIV_NMDMG_RATIO |  | 0 | 0 | prefix/template? | UnitStateEngine.ts |  |
| UP_GIV_POISON_DMG_RATIO | UpGivPoisonDmgRatioUnitState | 0 | 0 | yes | UnitStateEngine.ts |  |
| UP_GIV_SLIP_DMG_RATIO | UpGivSlipDmgRatioUnitState | 6 | 0 | yes | PvPTeam.ts, UnitStateEngine.ts, effectText.ts | Atomo Arrabbiato, Bebe-O'-Lantern, Marigold Dadaism |
| UP_GIV_SMDMG_FIXED |  | 0 | 0 | prefix/template? | UnitStateEngine.ts |  |
| UP_GIV_SMDMG_RATIO |  | 0 | 0 | prefix/template? | UnitStateEngine.ts |  |
| UP_GIV_VORTEX_DMG_RATIO | UpGivVortexDmgRatioUnitState | 1 | 0 | yes | PvPTeam.ts, UnitStateEngine.ts | Melodia Appassionata |
| UP_HATE | UpHateUnitState | 5 | 0 | yes | PvPTeam.ts, UnitStateEngine.ts, effectText.ts, helpers.ts | Folter Gefängnis, La Lumière, Screw Zone |
| UP_HEAL_RATE_RATIO | UpHealRateRatioUnitState | 15 | 124 | yes | UnitStateEngine.ts, effectText.ts | Circle Of Fire, Doppel of Silence, Glitterjoy Snow Globe |
| UP_HP_ATK_DEF_RATIO |  | 0 | 0 | prefix/template? | UnitStateEngine.ts |  |
| UP_HP_FIXED | UpHpFixedUnitState | 0 | 0 | prefix/template? | UnitStateEngine.ts |  |
| UP_HP_RATIO | UpHpRatioUnitState | 18 | 0 | yes | PvPTeam.ts, UnitStateEngine.ts, effectText.ts | Ayame's Kioku, Circle Of Fire, Doppel of Silence |
| UP_NMATK_FIXED |  | 0 | 0 | prefix/template? | UnitStateEngine.ts |  |
| UP_NMATK_RATIO |  | 0 | 0 | prefix/template? | UnitStateEngine.ts |  |
| UP_NMDEF_FIXED |  | 0 | 0 | prefix/template? | UnitStateEngine.ts |  |
| UP_NMDEF_RATIO |  | 0 | 0 | prefix/template? | UnitStateEngine.ts |  |
| UP_RCV_BREAK_POINT_DMG_RATIO | UpRcvBreakPointDmgRatioUnitState | 4 | 0 | yes | BreakPoint.ts, PvPTeam.ts, UnitStateEngine.ts, effectText.ts | Atomo Arrabbiato, La Danse Macabre, Melodia Appassionata |
| UP_RCV_CTD_RATIO | UpRcvCtdRatioUnitState | 0 | 0 | yes | UnitStateEngine.ts |  |
| UP_RCV_CTR_RATIO | UpRcvCtrRatioUnitState | 7 | 0 | yes | UnitStateEngine.ts, effectText.ts | Assault Paranoia, Atomo Arrabbiato, Final Fatebloom |
| UP_RCV_DMG_FIXED |  | 0 | 0 | prefix/template? | UnitStateEngine.ts |  |
| UP_RCV_DMG_RATIO | UpRcvDmgRatioUnitState | 17 | 511 | yes | PvPTeam.ts, UnitStateEngine.ts, effectText.ts | Atomo Arrabbiato, Bebe-O'-Lantern, Cherry Ballad |
| UP_RCV_NMDMG_FIXED |  | 0 | 0 | prefix/template? | UnitStateEngine.ts |  |
| UP_RCV_NMDMG_RATIO |  | 0 | 0 | prefix/template? | UnitStateEngine.ts |  |
| UP_RCV_SMDMG_FIXED |  | 0 | 0 | prefix/template? | UnitStateEngine.ts |  |
| UP_RCV_SMDMG_RATIO |  | 0 | 0 | prefix/template? | UnitStateEngine.ts |  |
| UP_RECOVERY_EP_RATE_RATIO | UpRecoveryEpRateRatioRatioUnitState | 0 | 0 | prefix/template? | UnitStateEngine.ts |  |
| UP_SMATK_FIXED |  | 0 | 0 | prefix/template? | UnitStateEngine.ts |  |
| UP_SMATK_RATIO |  | 0 | 0 | prefix/template? | UnitStateEngine.ts |  |
| UP_SMDEF_FIXED |  | 0 | 0 | prefix/template? | UnitStateEngine.ts |  |
| UP_SMDEF_RATIO |  | 0 | 0 | prefix/template? | UnitStateEngine.ts |  |
| UP_SPD_ACCUM_RATIO | UpSpdAccumRatioUnitState | 19 | 693 | yes | PvPTeam.ts, UnitStateEngine.ts, effectText.ts | Ayame's Kioku, Doppel of Invitations, Floral Ironspike |
| UP_SPD_FIXED | UpSpdFixedUnitState | 31 | 0 | yes | PvPTeam.ts, UnitStateEngine.ts, effectText.ts | Ashley's Kioku, Asuka's Kioku, Ayame's Kioku |
| UP_SPD_RATIO | UpSpdRatioUnitState | 85 | 1453 | yes | PvPTeam.ts, UnitStateEngine.ts, effectText.ts | Absolute Rain, Absolute Venus, Aqua Tempest |
| UP_WEAK_ELEMENT_DMG_ACCUM_RATIO | UpWeakElementDmgAccumRatioUnitState | 1 | 0 | yes | UnitStateEngine.ts, effectText.ts | Evoluzione Presente |
| UP_WEAK_ELEMENT_DMG_CONSUME_RATIO | UpWeakElementDmgConsumeRatioUnitState | 0 | 0 | yes | UnitStateEngine.ts |  |
| UP_WEAK_ELEMENT_DMG_RATIO | UpWeakElementDmgRatioUnitState | 34 | 0 | yes | PvPTeam.ts, UnitStateEngine.ts, effectText.ts | A Tale of Cherry Blossoms, Aqua Tempest, Buon Natale Grazioso |
| VORTEX_ATK | VortexAtkUnitState | 1 | 0 | yes | PvPTeam.ts, effectText.ts | Melodia Appassionata |
| WEAKNESS | WeaknessUnitState | 2 | 509 | yes | PvPTeam.ts, UnitStateEngine.ts, effectText.ts | Nine Phases, Sacred Gift |
| ZONE_EXPAND | ZoneExpandAbilityEffect | 4 | 0 | yes | PvPTeam.ts | Evoluzione Presente, Falsified Phenomena, Floral Ironspike |
| ZONE_RELEASE | ZoneReleaseAbilityEffect | 0 | 0 | - |  |  |
| ZONE_STACK | ZoneStackAbilityEffect | 4 | 0 | yes | PvPTeam.ts | Evoluzione Presente, Falsified Phenomena, Floral Ironspike |

288 types; 0 are used by data but have no logic reference in the engine: 
