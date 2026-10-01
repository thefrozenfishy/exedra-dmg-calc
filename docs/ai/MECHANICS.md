# Confirmed game mechanics (3.19.0) - the cache

Every line is from the decompile unless tagged. **[C]** confirmed in code, **[D]** from master data,
**[G]** confirmed by an in-game fixture, **[?]** inferred/unverified. RVAs are for 3.19.0 (`xq rva`, `xq fn`).
"TS:" = where the engine implements it. When you confirm something new, add it here in the same style.
Longer derivations: `src/models/PVE_PARAMS_3.19.md`, `PVE_ENEMY_AI_3.19.md`, `MISSING_AND_UNCERTAIN.md` (R5-R9).

---------------------------------------------------------------------------------------------------------
## 1. Number types (the source of most off-by-one bugs)

- **System.Decimal**: ATK, DEF, SPD processing and the whole damage pipeline (give/receive/element resist/...).
  `(decimal)float` rounds to 7 significant digits, `(decimal)double` to 15 (.NET Core DecCalc,
  VarDecFromR4 0x4b07020). TS: `BattleMath.ts` `CsDecimal`, `dec.float(f32(x))`. [C]
- **float32**: crit (Ctr/Ctd/RcvCtr/RcvCtd), weak-element ratio `1.2f + Σup/100`, shield product, turn gauge,
  barrier amount, `GetDamageBase` `stat*power`, state-add probability. TS: `f32 = Math.fround` at each step. [C]
- Decompile idioms: `func_0x1807029f0` Math.Ceiling(double), `func_0x180702d68` Math.Floor(double),
  `func_0x184a98810` Math.Pow, `func_0x184b08ae0` Decimal.Negate, `System_Decimal__op_*` decimal ops,
  `*(_System_Decimal_TypeInfo + 0xb8)` +0 Zero / +0x10 One. `xq fn` renames the first four.
- Check: `scripts/sim/compareFormula.ts` 2981/3000 identical to the old double formula, 19 off by 1 (decimal wins).

## 2. Damage pipeline

`BattleDamageCalculator.GetAttackDamageResult` 0x137cb10, TS `DamageCalculator.getAttackDamageResult`: [C]
1. base = `GetDamageBase(stat, power)` 0x137d8a0: `(decimal)f32(stat * power)`; power = value1/1000
   (splash: non-main targets of range 2 use value2/1000, `damagePower`).
2. break: × (1 + BreakedDamageReceiveRate/100) while broken (`GetAppliedDamageOfBreakSituation`).
3. defense: × `min((10+atk)/(10+def) * 0.12, 2)` (DEF-based types swap stats).
4. give variations (attacker, Up pass then Down pass) -> receive variations (defender, Up then Down).
5. element resist: `rate/10` + resist states, clamp ±100, × (1 - r/100) (`GetElementResistDamage` 0x137e130).
6. × weak ratio if attack element ∈ defender.WeakElements and attacker is a character (only quest enemies have
   weak elements -> never in PvP).
7. crit: roll `f32(rand*100) < RcvCtr + Ctr`; × `(1 + Ctd/100)(1 + RcvCtd/100)` (RcvCtd = defender stat, 3.x).
8. difficulty ("Aim", PvE only): enemy attacker vs character: × (1 + aimRate/1000) for the defender's element.
9. final-give (GvE) -> **PvP/GvG suppression × (1 - 750/1000) = ×0.25** (CalculationPointPolicyMst, `PVP_POLICY`).
10. shield (f32 product) -> `Max(1, d)` -> `Ceiling` -> barrier absorbs (`damageCutByBarrier`).
- ADDITIONAL_DAMAGE / TSUBAME_LINK (IAdditionalDamage): **once per skill launch, not per damage row**.
  `AbilityEffectLauncher.Triggering` 0x1373550, only for an active-skill launch (basic, battle skill, ultimate,
  follow-up, Ether Blow, enemy skills), after all the skill's effects and before regain / final damage, still in the
  skill's condition context (section 6): for each of the user's states that is IAdditionalDamage and IsActive(user)
  (b__1 0x138eb70), in state-list order, `GetAdditionalDamageResult(user, skill, notices)` (0x15b4840 / 0x16d9970):
  targets = units of this skill's notices with IsReceivedAttack whose team != the user's; base = `GetDamageBase(giver's
  initial ATK, DamagePower/100)` (DamagePower = v1/10, link: v3/10); one AdditionalDamageAbilityEffect (range all,
  DamageCategory 7 Additional, element = the user's CharacterParameter element; NotSpecified (0) for a non-character
  user such as an enemy, disassembly 0x1815b4bc2-0x1815b4c88) hits them via
  DamageAbilityEffectBase.Triggering with the **user as attacker** (its give/crit states, crit roll, ActorSkillType =
  the launching skill): reflection, pipeline, vortex, Attack, unique Lv-up; **no** break damage, no broken-rate
  growth, no consume-on-attack (those three getters return false). [C] TS `KiokuState.additionalDamageAfterLaunch`,
  `getAdditionalDamageBase`; MaxDamage adds one per state per enemy hit. Check: `scripts/sim/checkMechanics.ts`.
  No giver check anywhere (b__1 IsActive only, b__2 team != user's, AdditionalDamageUnitState has no CanAddTo
  override): an all-allies ADDITIONAL_DAMAGE also sits on its giver and fires on her own skills. Only
  TsubameLinkUnitState.CanAddTo (0x16d9950) refuses its caster. [C]
- RCV_FINAL_DAMAGE: extra `ceil(total × ratio)` hit, role/element gated (`CalcFinalDamageNoticeBundle` 0x137b110).
- DOT (`GetSlipDamageValue` 0x1380f20): same pipeline minus crit and shield. TS `getSlipDamageResult`.
- DMG_RATIO: `floor(HP × v1/1000)` (or MaxHP × v2/1000), capped at HP-1, no modifiers.
- DMG_RANDOM (0x18f08b0): v2 hits of v1/1000, each on a uniformly random target from the initial target list
  (repeats, dead may be picked); per hit crit, break-rate growth (base v4/10), break `-(v3||1)`, damage.
- IsDamageDisabled 0x1381490: a unit holding UNIQUE_ENEMY_639002 takes 0 damage.
- Break bonus damage `GetBreakDamage` 0x137d340 is **not** implemented: needs `LevelReactionBreakDamageValue`
  (client-side, not in our data). Formula in MISSING_AND_UNCERTAIN R6.3. UP_BREAK_EFFECT feeds it.

## 3. Stats (GetProcessedX)

- Every GetProcessedX: **one pass over Up states, then one over Down states** on the running value. [C]
- Ratio states: `base × (v/10)/100` (Up uses the base value, Down the running value); Fixed: `v`.
- Accum states multiply by the **current** AccumCount (+0x94, starts 1, +1 per re-application up to value2 =
  AccumCountMax), not the max. [C] TS `accumCount`, `mergeAccumEffect`.
- `UP/DWN_CTR_RATIO` / `_CTD_RATIO` map to the *Fixed* classes (same formula). *_CONSUME_* count only while
  RemainCount > 0. [C]
- SPD is decimal with the ATK shape (ratio (v/10)/100 of base, fixed v). [C]
- Crit is float32; enemy CTR/CTD data is per-mille (`/10` = percent: criticalDamageRate 100 -> +10 %). [C]
- UP_HP_RATIO: MaxHP bonus `Ceiling(Σ baseHP × (v1/10)/100)`; HP rises by the gain; when the bonus shrinks HP is
  only clamped. [C]

## 4. Turn order, rounds, turn counter

- Gauge stores **time until acting**: `Reset` = `10000f / speed`; `TurnReferee.ShiftNextTurn` 0x15c1c20 subtracts
  the first unit's time from everyone (f32). [C]
- Speed change rescales `gauge = f32(old/new) × gauge` unless `Mathf.Approximately(old,new)`,
  **after every single state add** (`BattleUnit.UpdateTurnGaugeBySpeed` 0x1389210) - f32 order matters for ties. [C][G]
- HASTE/SLOW: ± `(10000/speed) × (v/1000)`, floor 0; do nothing while the caster holds LOCK_TURN_ORDER. [C]
- Sort (`TurnReferee.SortByTurnOrder`): gauge asc, **TurnOrderPriority desc**, team, unit id. [C][G]
- `NextTurnOrderPriority` = ++counter, fetched **once per effect application** and shared by all its targets
  (so one "advance all allies" ties -> leftmost first; separate per-unit effects -> later one first). [C][G]
  TS `nextTurnOrderPriority`, `KiokuState.effectTurnPriority`. Fixtures: heroic-grace-*.json.
- Round: `t = elapsed action time`; `round = t < 150 ? 1 : floor((t-150)/100) + 2` (0x15c18b0). [C]
- **TurnNum** (BattleUnit+0x88): 1 at construction, +1 only in `BattleUnit.PassingTurn` 0x1388790 (called once
  per turn by `ActExecutor.TurnEnd` 0x17e2160). Forward's +1 is undone by -1 after `CreateTurnActUnitOrderInfo`.
  So combo steps, ultimates, follow-ups, extra actions don't count. Read by Turn (7) / EveryNTurn (13). [C]
  EveryNTurn "N,S": true iff TurnNum >= S and (TurnNum - S) % N == 0 (S default 1).
- Battle start: every gauge is reset **before** battle-start passives run (InitializeBattle), so battle-start
  HASTE/SLOW move a real gauge. [C]
- KO'd units leave the turn order (ActiveUnitList); battle ends when a side is wiped. [C]

## 5. Turn flow and timings

```
TurnBeginAct: IsAdditionalTurnCoolTime=false; ContinuousRecovery (HoT); slip damage;
              broken & can act -> break recovered (gauge full, rate 0); not broken -> regen per BreakMst; TurnStart(3) passives
TurnUnitAct:  gauge reset; ExecuteSkill -> AttackEnd(5) passives -> follow-ups (AdditionalSkillAct)
TurnEndAct:   TurnEnd(6) passives; ITurnEndTrigger states (Cutaway); PassingTurn (durations -1, TurnNum+1)
Ultimates (SpecialAttackAct) and follow-ups: only ExecuteSkill - no TurnStart/TurnEnd, no duration tick.
```
- `PassiveSkill.Triggering` 0x14a2c20: for a timing, every living unit on **both teams** runs its passives, then
  every living unit runs AfterProcess (9). Ends with `ResetZoneStatePatternMstId` on every unit. [C] TS `fireTiming`.
- Each ExecuteSkill has its own notice bundle (tallies reset before each follow-up). Team conditions read the
  notices of units **in that team**. [C]
- Follow-ups (`AdditionalSkillActAbilityEffectBase.Triggering` 0x18ea740): none from a broken / can't-act unit,
  none while the same unit's same follow-up is queued/running. value2 AdditionalSkillTargetType 1 + enemy actor =
  counter that actor. [C]
- ActExecutor.ExecuteSkill 0x17dfec0: after the AttackEnd pass of a normal/skill/ultimate, every living unit that
  took a damaging hit from it gets +1 count point (COUNT). [C]
- **Passives are triggers, not states**: a passive detail fires at its timing if its START conditions hold and adds
  a timed or permanent state; the state is then gated by its ACTIVE conditions (`UnitStateBase.IsActive` checks
  only the active set). Nothing is active before it fires. [C] TS `KiokuState.passiveSkills` (triggers) vs
  `activeEffectDetails` / `passiveEffectDetails` (states).
- **Battle-start order**: `TriggeringOnBattleStart` 0x14a1df0 stable-sorts by `IBattleStartTriggerPriority`
  (AddTurn states 200, effect-value variation 100, DWN_BARRIER_VALUE 90, others 0 = Define.DefaultPriority),
  highest first; ties keep the unit's PassiveSkills list order. TS order: ability -> crystalis ->
  ascension/portrait/support (`PvPKioku.triggerOrderEffects`): the kit's CHARGE must run before an EX crys
  GAIN_CHARGE_POINT (Tenebrous Arcana) and crys SPD states before others (fixture mirrored-thunder-torrent). [C][G]
- Battle-start follow-ups (e.g. Splashin' Kyubey Blast) run before the first turn. [C][G]

## 6. Conditions

- csv of sets = OR (`IsMatchConditionSets` 0x17e3150 = Any); conditions in a set = AND (0x17ec2d0). Applies to
  skills, passives and enemy AI. [C]
- Adding a state checks only its START conditions; ACTIVE conditions gate it afterwards. [C]
- "Has state" contents see permanent states too. 302 BreakedUnitCount = notices with BreakDamageInfo (broke in
  this skill), not "currently broken". 26 UniqueAbilityEffect = list of the unit's unique states' pattern ids. [C]
- 27 UniqueAbilityEffectAccumCount "pid,n": sum of AccumCount of unique accum states of that pattern;
  31 UniqueAbilityEffectLv "pid,n": Lv of the first unique Lv state of that pattern (none -> false);
  29 IsExpandingZone "pid,BOOL" (pid 0 = any UNIQUE_ZONE); 113/114 IsExpand/ReleaseZone flags (cleared after
  each passive pass); team 209 sum of CountPoint, 210 units holding pattern pid, 211 total AccumCount of pid;
  1001 IsAlly; 1101 vanguard phase active. [C] (implemented in stash, STATUS.md)
- HPRatio = `HP * 100f / MaxHP` (float). [C]
- **EachTargetUnit** is set by every effect's Triggering in the **user's** bundle only (`userUnit+0x90` +0x30 = the
  target being processed, cleared to null after it): DamageAbilityEffectBase 0x18ef650 (before ReflectionProcess /
  GetAttackDamageResult), DmgRandom, RecoveryHp, State 0x1901cb0, Haste, GainEp, ... (~28 classes, scan of `+0x90`
  then `+0x30` writes). Skills and passives alike; additional hits too (GetAdditionalDamageResult runs its effect's
  Triggering with the attacker as user). The launcher never sets it. Every other bundle (the defender's included)
  has it null. `Condition.IsMatchCondition` 0x17eca80 case 8: null EachTarget -> **true** for ConditionUseType
  SkillStart (1), otherwise a checker on a null unit -> **false** (state activity = SkillActive 2). So "DMG dealt to
  cursed enemies" (set 345) counts on the user's hits on cursed targets only; a defender's EachTarget-conditioned
  states never hold. In data only attacker-side states use EachTarget active conditions (UP_GIV_DMG_RATIO 101,
  UP_HEAL_RATE_RATIO 22, UP_CTR_RATIO 10, UP_CTD_FIXED 10). [C] TS: `eachTargetCtx` / `withEachTarget(user, target)`
  (set in `KiokuState.applyEffect` per real target, per heal target, per additional hit),
  `BattleState.eachTargetUnset`. Check: checkMechanics #4.
- Start conditions are checked **per selected target** for every effect: `AbilityEffectBase.SelectTargetsConditionCheck`
  0x18e7bb0 (launcher, after SelectTargets): EachTarget = each target, `IsMatchConditionSets(start, bundle,
  SkillStart)`, keeps the targets that pass; Triggering then loops over them (StateAbilityEffect 0x1901cb0 has no
  check of its own). TS: friendly effects arrive with the caster as placeholder and are checked per widened target
  (`applyEffectToTarget`), opponent effects per real target. E.g. Scorchin' Summer Spike's Beachball's Boon "to self
  and Attacker allies", condition 2831. [C]
- 19 IsElementType / 20 IsRoleType: CompareValue is the enum NAME ("Fire" = Flame, "Neutral" = Void, "Attacker",
  ..., parsed with `Enum.Parse<TargetElementType|TargetRoleType>`), never an id. Check 0x17e3f10:
  `BoolValueComparer(unit.IsMatch(v), true).Compare(op)` (0x17e8240): Equal -> IsMatch, **NotEqual -> !IsMatch**,
  other ops false. IsMatch (0x1388540 / 0x13884b0): NotSpecified -> true; non-CharacterParameter unit (enemy) ->
  false; else element/role equality. Only NotEqual rows in use: set 349 (EachTarget neither Buffer nor Debuffer, skill
  detail 200600401 DMG_RANDOM). TS `conditionElement` / `conditionRole`. [C] Check: checkMechanics #5.
- 304 TotalDamage (team) = Σ over the team's notices of `AffectedUnitNotice.GetTotalDamageValue(true)` 0x1379240 =
  Σ `Damages` (HP damage after the barrier) + BreakDamage. `BarrierDamages` are a separate list, so a hit fully
  absorbed by a barrier counts 0 (e.g. Time Stop Strike's "+1 Magic on DMG dealt" doesn't fire). [C]
  TS: notice `totalDamageValue` = damage after `damageCutByBarrier`. Fixture time-stop-strike-magic.json.
- **A state's ACTIVE condition is checked against its holder's own bundle** (`BattleUnit+0x90`, created by
  `SetActiveConditionCheckDataBundle` 0x1388820 with GameDirector + SelfUnit; `UnitStateBase.IsActive(BattleUnit)`
  0x16dfba0, used by every GetProcessedX / give / receive / crit lookup). `AbilityEffectLauncher.Triggering` 0x1373550
  with a triggering skill (`ActiveSkillBase.Triggering` 0x1375430: every normal/skill/ultimate/follow-up and enemy
  skill) first sets, in **every unit's** bundle on both teams, ActorUnit = user, MainTargetUnit = selected target,
  ActorActiveSkill = the skill; per effect ActorAbilityEffect (+EachTargetUnit per hit); at the end
  `RemoveTransientData` 0x17ec1f0 clears all five (checked in the disassembly). Passive launches pass no skill. So
  between skills and during passives IsActor (8) and ActorSkillType (401) are false, and during a skill they hold
  for the whole skill incl. its additional-damage hits, regain and final damage, on any unit's states (an enemy's
  "takes more DMG from ultimates" works too). [C] TS: `activeLaunch` in PvPTeam.ts (`launchSkill`,
  `KiokuState.unitStateCheckState`). ~1000 rows depend on it (660 UP_GIV_DMG_RATIO, 350
  UP_BREAK_DAMAGE_RECEIVE_RATIO, crit, weak-element...); before 2026-10-01 the TS never activated them.
- 401 ActorSkillType (`BattleOtherConditionChecker.Check` 0x17e3850): NormalAttack 3, ActiveSkill 1, SpecialAttack
  2, AdditionalSkill -> its SkillMst type (4 AdditionalSkill, **5 EtherBlow**); no skill -> false; int compare with
  CompareValue parsed as SkillType (EQUAL / NOT_EQUAL in data). Start conditions of passives use the passive pass's
  own bundle (actorActiveSkill passed to `PassiveSkill.Triggering` 0x14a2c20). [C] TS `BattleState.actorSkillType`.
- 12 AbilityEffect "TYPE[,TYPE]" contains/not-contains: **prefix match** (`AbilityEffectListComparer` 0x17df400) over
  `UnitCondition.StateList` mapped to `UnitStateBase.EffectType` (b__8_0 0xe0f070): every state held, timed and
  permanent, active or not (e.g. "TSUBAME" matches TSUBAME_CORE, "CURSE" matches CURSE_ATK/DEF/HP/BREAK). State
  names are the ability effect types: "STUN", "WEAKNESS", "VORTEX_ATK". [C] TS `compareAbilityEffectList`,
  `unitStateTypes`.

## 7. Targeting

- `AbilityEffectBase.SelectTargets` 0x18e7e60 never filters by element/role: candidates = the effect side's
  units minus dead ones. Range -1 user, 1 chosen, 2 chosen + nearest alive above and below by position, 3 all. [C]
- For DMG_* a detail's `element` is the attack element. For states the filter is the class's `CanAddTo`
  (generated `StateAddFilter.ts`): role AND element / role only / always, by class. Non-state effects never
  filter. [C]
- Target side = state Direction (StateAbilityEffect 0x19023d0) - generated `EffectTargetSide.ts`. [C]
- `UnitBrain.TargetingUnits` 0x17f2ea0: **one** opponent and **one** friendly target per skill; every single /
  splash effect on that side uses it (TS `actionPrimaryTargets`). [C]
- AI targets are decided before the turn unit's gauge reset (`GameDirectorBase.Forward`: CommandDecideSkillContent,
  then `ResetTurnGaugeBeforeTurnUnitActExecute` 0x17e1a70, then ExecuteSkill), so the turn unit's gauge is 0 at
  decision time. HASTE (`GetAIFilteredTargets` 0x18f4140) keeps only living units with GaugeValue > 0 (no fallback),
  so a battle-skill haste never targets its user. TS: `setAIDecisionGauge`. [C]
- Character auto damage targeting order: break, main target, weak element, weighted role+hate roll; enemy
  damage targeting: only the weighted roll. Role weights: Defender 15, Healer/Buffer/Debuffer 10,
  Attacker/Breaker 5, + hate states. [C] TS `AITargetSelector.ts`.
- Cutaway targeting (0x15b7520): MainTarget, RoleAttacker, MaxAtk (processed ATK). [C]

## 8. States: adding, roll, removal

- State-add roll (`UnitStateBase.GetProcessedProbability` 0x16dfa50): fixed probability as is; else
  `p = clamp(Floor2(prob × hit × parry × secondary), 0, 100)`, fails when `p*10 <= Next(1000)`.
  hit = `max((neg ? clamp((baseHit/10 + Σup)/100, 0, 1) : 0) + (ailment ? AllAbnormalHit/100 : 0) + 1, 0)`;
  parry = `clamp(1 - (neg ? clamp((baseParry/10 + Σ)/100, 0, 1) : 0), 0, 1)`;
  secondary = `clamp(1 - [(stun ? RepeatStunParry/100) + (ailment ? clamp(perType/10/100,0,1) + AllAbnormalParry/100)], 0, 1)`.
  **Hit/parry only apply to Negative-direction states** (buffs never get parried). Per-type enemy columns are
  per-mille (1000 = immune). RepeatStunParry +25 per stun removal, max 80, quest enemies only. [C]
- PREVENT_ABNORMAL: after a successful roll a NEW ailment (Burn/Poison/Curse/Bleed/Vortex/Weakness/Stun) is
  blocked by the first active PREVENT_ABNORMAL with RemainCount >= 1, which loses one count. Debuffs aren't. [C]
- Ailments are neither IBuff nor IDebuff (REMOVE_ALL_DEBUFF doesn't clear them). [C]
- Effect-value scaling (`StateAbilityEffect.ChangeGiveUnitState` 0x19013a0): for states given by a unit
  (AbilitySource == Unit, not card/support), an IHasUpdateableEffectValue state's value × `Max(1 + s, 0)`,
  s = Σ over the **giver's** active UP/DWN_BUFF_EFFECT_VALUE (Positive states) or UP/DWN_DEBUFF_EFFECT_VALUE
  (Negative) of ±v1/1000. A live state, applied at give time (the old TS pre-scaled the kit once). [C]
- **Duration countdown**: `UnitStateBase.PassingTurn` 0x16dfd50 runs at the HOLDER's TurnEnd:
  `if (IsExemptPassingTurnOnce) { n--; flag = false }; RemainingTurn = max(0, RemainingTurn - n)`.
  `SetTriggeringInfo` 0x16dfd70 sets IsExemptPassingTurnOnce (+0x71) only when `isOwnSkill` and the state is not
  permanent; `StateAbilityEffect.Triggering` 0x1901cb0 passes isOwnSkill = (origin ActiveSkill && target == user)
  || (origin PassiveSkill && target == user && the current act's unit is the user && IsConditionActivation [?]).
  So a self-buff from your own skill survives the TurnEnd of the turn it was cast in; a buff on an ally is counted
  down at that ally's next TurnEnd. [C] TS: `isOwnSkillState` in PvPTeam.ts (fixed 2026-09-30).
- ADD_BUFF_TURN / ADD_DEBUFF_TURN: states on the caster giving +v1 turns to every IBuff/IDebuff state it gives.
  DEC/ADD_BUFF/DEBUFF_TURN_IMM: ±value2 turns now, value1 = state id filter, ailments/Cutaway/AddTurn excluded,
  a state below 1 turn is removed. [C]
- Consume-on-attack states (`Collect/ConsumeAttackHitConsumableStates` 0x18ee590/0x18ee7b0): the attacker's
  IConsumeRemainCountOnAttack states active at the start of a damage row lose 1 RemainCount after the row (hit or
  not); removed at 0. [C]
- Cutaway (CutoutUnitState, ITurnEndTrigger, 0x15b7840): at the holder's TurnEnd after TurnEnd passives: if
  another Cutaway already fired this turn end, just removed; removes the newest `v2` (0 = all) skill-origin
  IDebuffs; unless the holder had LockTurnOrder when it was added, `SubtractGaugeValue(v1/1000)` with a new
  priority; removes itself. [C][G]
- SWITCH_SKILL (`SwitchSkillUnitState`): v1 = skill unique id to switch to, v3 = SkillType replaced, same level. [C]
- Unique states: accum ones blend (same class, pattern v1, giver, AccumCountMax v2: AccumCount = min(+1, max),
  turn overwritten; `UniqueAccumUnitStateBase.Blend` 0x16ddaf0); Lv ones blend by pattern (turn = max, Lv and
  HitCounter kept, 0x16de420) and level up by hits (`TryCountUp` 0x16de5f0, thresholds UniqueStateLevelMst
  group = v2; `UniqueStateLvUpProcess` 0x18eff70: UNIQUE_ELEMENT_STACK counts attackers of its element, _BREAK
  counts its giver). All unique states a unit gave go when it dies (IRemoveByUserUnitDeath).
  RESET_UNIQUE_BUFF/DEBUFF (0x1900190) remove every unique state of pattern v1 even if unremovable. [C]

## 9. Break

- Per hit (`DamageAbilityEffectBase.Triggering` 0x18ef650): damage first, then broken-rate growth if already
  broken, then `BreakPoint.Decrease`. [C]
- Break value = (v3, v4) if v3 != 0 else `BreakPoint.GetDecreaseValue` 0x14928a0 by skill type, range and attacker
  role (Breakers bigger); item 2 for splash side targets; follow-ups use the normal-attack table. TS `BreakPoint.ts`.
- Processed break damage 0x14914c0: attacker give-break Up then Down (floor 0), ×1.2 on weak element, defender
  receive-break Up then Down, Ceiling. Ratio = (Up ? base : running) × v1/1000, Fixed v1. [C]
- Decrease 0x1492530: none while broken or max < 1; clamp [0,max]; at 0: BreakCount++, gauge +slowRatio/1000,
  BreakedDamageReceiveRate = initial/10. Growth while broken (0x18eecd0, character attackers only):
  `floor((inc/1000) × (1 + attackerRatio/100) × base)`, base = v5/10 (v4/10 for DMG_RANDOM) or role default
  {Attacker 5, Breaker 20, Defender/Healer 10, Buffer/Debuffer 12}; cap max/10. [C]
- TurnBegin of a broken unit that can act: gauge full, rate 0 - and it **acts normally that turn**; broken +
  can't act stays broken. Not broken: regen `(int)(max × perTurn/1000)`. [C]
- PvP characters: gauge = 100 × rarity × role factors (policy 3), slow 250, rate 100 %/max 200 %. **Outside
  PvP/GvG characters have no break gauge.** Enemies: BreakMst. [C]

## 10. Heal, barrier, EP, SP

- Heal (`HpRecoveryCalculator.GetProcessedRecoveryValue` 0x149de70): healer ratio R = HealRate/10 (+v1/10 per
  UP_HEAL_RATE_RATIO; then each DWN: `R += (v1/10 × -R)/100`) f32; value × (1 + R/100); receiver
  DWN_RCV_RECOVERY_RATIO `p -= p × v1/1000` each; PvP/GvG ×0.5; Max(0); caller Ceiling. [C]
  RECOVERY_HP = healer MaxHP×v1/1000+v2; RECOVERY_HP_ATK = processed ATK×v1/1000+v2; CONTINUOUS_RECOVERY (HoT) =
  holder MaxHP×(v1/10)/100+v2 at the holder's TurnBegin, never suppressed; REVIVAL_RATIO = Ceiling(f32 MaxHP×v1/100).
  Every living RECOVERY_HP(_ATK) target gets IsReceivedRecovery = true (CreateByRecovery 0x1378df0), even at full HP
  (healed 0): IS_RECOVERY (104) conditions fire on full-HP heals. [C]
- REGAIN_ATK/DEF/HP (0x16d7320 via 0x1372f70): once per skill launch that hit an opponent, the holder heals
  Ceiling(Σ GetProcessedRecoveryValue(holder, holder, caster's processed ATK (DEF/MaxHP) × v1/1000 + v2)). [C]
- Barrier (`BarrierUnitState` 0x15b5ed0): v1, v3 per-mille; endurance `ceil(f)`; PvP ×0.5; DWN_BARRIER_VALUE on
  the caster scales barriers it gives by Π max(1 - v1/1000, 0). [C]
- EP ("MP" in the UI) (`EpCharger.GetProcessedRecoveryEp` 0x1497980): rate = 100 + style rate, +v1/10 per UP,
  each DWN `rate -= rate×(v1/10)/100`; gain = floor(max(0, (rate-100)×ep/100 + ep)); clamp [0, MaxEP].
  Base: normal 15, skill 30, ultimate 5, kill 10, DOT tick received 2, hit received by HP% after the hit
  (<10 -> 15, <40 -> 10, else 5). Enemies: no EP. LOSE_EP_RATIO `(int)(f32(v1×MaxEP)/1000)`. [C]
  [?] per hit vs per act for hit-received EP.
- SP: team resource (`SpReferee`, TS `PvPTeam.currentSp` / `addSp`): Init 0x15c07a0 = 5 per team; **AddSp 0x15c04b0
  = Clamp(sp + n, 0, 6)** (SP above 6 is lost); `GetCalculationSp` 0x15c05e0: normal attack +1, else -ConsumeSP;
  GAIN_SP_FIXED adds through the same clamp. [C] Check: checkMechanics #6.
- BP (ultimate gauge of units with StyleMst.bp > 0: Vinctio☆Magica 12, Metallicized Projectile 15; their ep = 0):
  `BattleUnit.IsSpecialAttackPointMax` 0x13885d0 = MaxBP > 0 ? BP >= MaxBP : (MaxEP > 0 && EP >= MaxEP), used by every
  ultimate gate. BP starts 0; clamp [0, MaxBP] everywhere. Sources: GAIN/LOSE_BP_FIXED (`AddBP` 0x1382c30) and
  `BpCharger` (cctor 0x1491450): own basic attack +1 (NormalAttack.Execute 0x138b560), own battle skill +2
  (ActiveSkill.Execute, both before the effects), +1 per GAIN_EP_* effect received whatever the EP amount
  (GainEpAbilityEffectBase.Triggering 0x18f3300, e.g. Pluvia☆Magica ult, Cherry Ballad support turn-start MP). `SpecialAttack.Execute` 0x138c4f0 sets EP = 0 (if MaxEP > 0) and BP = 0 (if MaxBP > 0) before
  the effects run (so an ult's own +BP lands on 0). `OnBattleUnitDeath` 0x149a9a0 zeroes EP and BP. [C]
  TS: `KiokuState.maxBp/currentBp/isSpecialAttackPointMax/addBp`. (Before 2026-10-01 BP was ignored: these two never ulted.)

## 11. PvE specifics

- Enemy unit (`QuestEnemyAppearanceParameter` 0x138b650): raw atk/def/hp/speed, no element/role/EP; passive =
  passiveSkillMstId at level 1. Element/role-gated effects never apply to enemies. Full field map: PVE_PARAMS_3.19.md. [C]
- HP gauges: dead only at HP 0 with < 2 gauges left; revive after the act (full HP, break reset, debuffs removed,
  gauge count -1). [C] [?] the revive's turn-gauge effect.
- **Enemy AI** (`UnitBrain.AutoSelectActiveSkillOrNormalAttack` 0x17f1060): dead/can't act/broken -> nothing;
  condition rows first (`EnemyConditionAndActionController.GetAction` 0x1495fa0: priority asc, OR over sets,
  one-shot rows consumed when picked, uniform pick among the row's skill ids, no SP/target check); else weighted
  random over skills with a valid target (`RandomSelectActiveSkill` 0x17f1cb0: weight -1 excluded, all-0 ->
  uniform). Combo enemies: N acts per turn told apart by ComboActionStep (402). Start-timing rows
  (content 2001/2002) run once as StartTimingActs at battle/wave start, main target first then turn order. [C]
  Worked examples (Dessert / Sandbox / Mermaid Witch): PVE_ENEMY_AI_3.19.md section 6.
- Waves: rows conditionType 0, ordered by id, only step-1 forms of mode-change bosses, main target moved to the
  middle (index count/2); positions `3 - n/2 + i`. [C]
- Summon: positions tried 3,2,4,1,5; occupied skipped; next summon id dequeued (unknown id consumed); new unit's
  gauge reset + its battle-start passives. [C]
- Form change (QuestEnemyModeChangeMst): a hit on the current form stops HP at `(int)(threshold × MaxHP/1000)`;
  at/under it (`(float)HP/MaxHP×1000 <= threshold`) the unit is replaced by the next form: same id/position,
  **raw HP** and TurnGauge object kept, fresh states/controller, TurnNum 1, battle-start passives run. [C]
- Judge: RoundLimit 100 (loss); victoryRound > 0 -> win when the next act's round exceeds it. [C]
- Score formulas (Score Attack / PvP points / Solo Raid) are **not** in the battle core (client UI + server). [C]

## 12. Solo Raid (BattleType 9, SoloRaidGameDirector)

- Link HP type 1 (endless minions): pool 100, each dead enemy -linkHpWeight (10); empty positions 1-5 refilled
  round-robin before time moves on; wave won when pool < 1. Type 2: pool = main target HP; each act subtracts
  damage to the wave (minus healing, form-change capped), every enemy synced to clamp(pool, 0, own MaxHP). [C]
- Countdown (CountdownReferee): COUNTDOWN_START state (countdown = turn-1, cancel threshold = v1), damage to the
  holder accumulates (uncut), COUNTDOWN_DECREASE -1, COUNTDOWN_CANCEL no-op, contents 1201/1202;
  ADDITIONAL_COUNTDOWN_ZERO/CANCEL_SKILL_ACT queue skill v1 then end the countdown. Reset on form change. [C]
- Round limit = SoloRaidStageMst.limitRoundCount (3/4/5): an act that would start past it ends the attempt as a
  loss, damage kept (`CheckBattleFinishBeforeAct` 0x14a4410). [C]
- Attempts carry over (`SyncBattleInfo` 0x14a8220 / `ApplyEnemyInfo` 0x14a6db0 / `InitializeCountdownForRestart`
  0x14a7530): alive enemies (current forms) with HP, break gauge, broken bonus and turn gauge, link pool, endless
  index, running countdown. Enemy buffs/debuffs are not kept; round restarts at 1. [C]
- Labyrinth Vanguard: GAIN_SOLO_RAID_BUFF_POINT (0x18f35f0) adds v1 × targets; points clamp [0, active ? 30 : 100]
  (0x15bfd20). Between acts (`Request(TimeForward)` 0x14a4f60 -> `SoloRaidBuffReferee.CheckActive` 0x15c0190):
  at 100 points and inactive -> active, points 0, phase gauge = enhancedSkillTurnGaugeValue (runs down with the
  same dt as turns), SeasonBuffActive (10) passives fire. Party/season buff passives from SoloRaid*BuffMst. [C]

## 13. Kit mechanics (3.x classes)

- CHARGE / GAIN_CHARGE_POINT / CONSUME_CHARGE_POINT: the "Magic" gauge (ChargePoint, content 17). See
  MISSING_AND_UNCERTAIN A-3.1.
- TSUBAME (Luce della Speranza's Swallow's Providence): TSUBAME_CORE on the caster only (Down: `-running ×
  (v1/10)/100` SPD); TSUBAME_LINK on everyone but the caster: +SPD `base × (v1/10 × updateable)/100`, +ATK
  `base × (v2/10 × updateable)/100`, and an ADDITIONAL_DAMAGE-like extra hit (once per launch, section 2) at power
  v3/10 % from the caster (not effect-value scaled). Removing the CORE removes every LINK the same caster gave. (0x16d92f0, 0x16d9e90,
  0x16da100, 0x16d9970, 0x16d95a0) [C]
- ZONE: ZONE_STACK (0x1906d60) Max = clamp(v2,0,3), Stack = clamp(v1,0,Max); ZONE_EXPAND (0x1905ff0) on the user
  sets "field started" and fills the stack, on others with an active zone releases it; GAIN/CONSUME_ZONE_STACK
  (0x18f3e60/0x18ed9e0) active-skill origin only, only while a zone is up, consuming the last releases the zone
  ("field ended", every UNIQUE_ZONE removed); UNIQUE_ZONE is a team marker state (v2 = 1: every living ally incl.
  the user), removed on the user's death. UnitCondition zone fields 0x5C..0x6C. [C]
- COUNT ("sigils"): CountUnitState (one per unit) sets MaxCountPoint 20; GAIN/CONSUME_COUNT_POINT (0x18ee190)
  `TryModifyCountPointBy(±v1)` (0x15cae00, only while holding COUNT, clamp [0,max]); +1 per damaging hit taken
  (section 5); team content 209. [C]
- REFLECTION_RATIO (0x16d6520 / 0x16d6c50, `ReflectionProcess` 0x18eefb0 before every hit's damage calc): when the
  holder is hit with barrier endurance X > 0, each reflection state deals `ratio/100 × X × ((X/124)^1.2 + 12)/20`
  (ratio = v1/10) through the pipeline without crit (0x1380070) to every living opponent (v2 > 0) or the
  attacker (v2 = 0); cannot kill (HP-1 at most). [C]
- VORTEX_ATK (0x15d1ed0, `VortexProcess` 0x18f0260): an ailment allowing duplicates, never ticks at turn start,
  RemainAttackCount = v2; damage base fixed at give time = caster's unbuffed ATK × v1/1000 (after effect-value
  scaling); after each hit's damage calc every vortex on the target counts the hit, the ones reaching 0 pop and
  add their damage to this hit: the GetSlipDamageResult notice (0x13806d0) is op_Addition'ed into the hit's notice,
  so it counts in that hit's GetTotalDamageValue (DMG 101, team 304) and the popping skill's notice bundle.
  DamageInfo has no giver field: the vortex's owner gets no credit. [C] TS: added to `notice.totalDamageValue`; the
  owner's `dot` event is display/attribution only. Check: checkMechanics #7.

## 14. PvP specifics

- policyType 3: damage ×0.25, heal ×0.5, barrier ×0.5, break gauge from rarity/role, slow 250. [C][D]
- No weak elements, no Aim, no enemy AI - both teams use the character auto logic (UnitBrain). [C]
- Turn-order ties are decided by f32 gauge values and priorities (sections 4, fixtures). [G]
