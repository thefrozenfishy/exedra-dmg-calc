# Enemy AI (skill choice, targeting, break, HP gauges, mode change): porting spec, Exedra 3.19.0

Sources: Ghidra output in `/home/claude/re/decompiled/*.c`, offsets from `Il2CppDumper/dump.cs`, data from `exedra-dmg-calc/src/assets/base_data/`.
Notation: `[RVA]` is the function's RVA. **UNCERTAIN** marks a point that is inferred and not proven line by line.

Key object offsets used below:
- **BattleUnit:** `0x18` Team (0 = Ally, 1 = Enemy), `0x28` MaxHP, `0x2C` HP, `0x48` SkillSet, `0x58` UnitCondition, `0x60` TurnGauge, `0x78` BreakPoint, `0x80` BreakedDamageReceiveRate, `0x84` isCharacter, `0x88` TurnNum, `0x98` EnemyConditionAndActionController, `0xA0` InitialHpGaugeCount, `0xA4` CurrentHpGaugeCount, `0xB0` questEnemyAppearanceMstId.
- **UnitCondition:** `0x38` CanNotAction, `0x39` CanNotUseSkill.
- **ActiveSkillBase:** `0x10` Id (= skillMstId), `0x28` ConsumeSP. **ActiveSkill:** `0x38` WeightValue, `0x3C` HpGaugeValue.

---

## 0. Where enemy skill choice happens

```
GameDirectorBase.Forward [0x1499ab0]
  act = current act; unit = act's unit
  r = ActExecutor.ValidateCanExecuteAct(act) [see 2.1]
  r == 1 -> skip the act (TurnUnitAct: ResetTurnGaugeBeforeTurnUnitActExecute), no action
  r == 2 (skill not decided yet):
     if unit.Team != Enemy && autoType == 0 -> wait for player input (CommandDecideSkillContent)
     else:
        bundle = new ConditionCheckDataBundle{ GameDirector=this, SelfUnit=unit, ActorUnit=unit,
                  MainTargetUnit=null, ActorActiveSkill=null, AffectedUnitNoticeBundle=null, AffectedUnits=null }
        GameDirectorBase.AutoAction(act, bundle, unit)     [0x14985e0]
        if !act.IsDecided -> skip like r==1
  Execute act; CheckHpGaugeRevive(); ...
  if act is TurnUnitActBase|SpecialAttackAct|AdditionalSkillAct|StartTimingAct: battleUnitDic[act.unitId].TurnNum += 1
```
`AutoAction` calls `skill = UnitBrain.AutoSelectActiveSkillOrNormalAttack(bundle, unit, director, opponents, friends)` [0x17f1060]. For an enemy, opponents are the ally list and friends are the enemy list. Then `(oppTarget, friendTarget) = UnitBrain.TargetingUnits(teamTargetId, unit, skill, opponents, friends)` [0x17f2ea0]. If `oppTarget != 0 && oppTarget != current team target`, it calls `ChangeTarget(team, oppTarget)`. Finally `TurnUnitActBase.SetDecisionContent(skill.Id, friendTarget)`. If no skill comes back, the act is not decided and the turn passes with no action.

There is only **one** caller of the enemy controller: `EnemyConditionAndActionController.GetAction(bundle, 1)` is called only from AutoSelect, and always with `actionCount = 1`.

---

## 1. Skill selection

### 1.1 AutoSelectActiveSkillOrNormalAttack [0x17f1060], the enemy path
```
if unit.IsDead            return null
if cond.CanNotAction      return null          // (unit+0x58)+0x38
if BreakPoint.IsBreak     return null
skills = unit.ActiveSkills                     // (switchable-skill override ignored: enemies have none)
if cond.CanNotUseSkill or skills.empty:
    return unit.isCharacter ? NormalAttack : null     // enemies: null (no normal attack; SkillSet.NormalAttack = null)
if unit.IsEnemy:                                        // Team == 1
    id = unit.EnemyConditionAndActionController.GetAction(bundle, 1) ?? UnitBrain.InvalidSkillMstId
    s = skills.FirstOrDefault(x => x.Id == id)          // <>c__DisplayClass9_0.b__0 [0x9193f0]
    if s != null: return s                              // NO SP / hpGauge / target check on this path
candidates = []
for s in skills (array order):
    if s.ConsumeSP > SpReferee.GetSp(unit.Team): continue
    if s is ActiveSkill && s.HpGaugeValue >= 1 && s.HpGaugeValue != unit.CurrentHpGaugeCount: continue
    if !ShouldUseSkillBase(unit, s, opponents, friends, SkillType.ActiveSkill): continue
    candidates.add(s)
pick = unit.isCharacter ? candidates.OrderByDescending(ConsumeSP).First()   // character auto
                        : RandomSelectActiveSkill(candidates)               // enemies
return pick   // if null: character -> NormalAttack (if usable), enemy -> null
```
Key decompiled lines:
```c
uVar9 = ReDriveBattleCore_EnemyConditionAndActionController__GetAction(*(longlong *)(param_3 + 0x98),param_2,1);
...
if ((int)plVar1[5] <= iVar5) {                        // ConsumeSP <= GetSp(team)
  if (((!isActiveSkill) || (*(int *)(plVar1+0x3c) < 1 || *(int *)(plVar1+0x3c) == *(int *)(param_3 + 0xa4))) &&
      ShouldUseSkillBase(param_1,param_3,plVar1,param_5,param_6,1,param_4)) candidates.Add(plVar1);
if (*(char *)(param_3 + 0x84) == '\0') lVar8 = UnitBrain__RandomSelectActiveSkill(param_1,lVar8);
```

**ShouldUseSkillBase [0x17f2a60]:** `effects = skill.GetAbilityEffectList().OrderBy(e => e.DetailMstId)`. `main = effects.First()`. `list = main.GetAIFilteredTargets(unit, main.TargetSide == 1 ? opponents : friends, ...)` (vslot 0x198), cached in `aiFilteredTargetsDictionary`. The first effect whose TargetSide differs from `main` is also computed and cached. Returns `list.Any()`, so the skill counts only if the **main** effect has at least one AI-valid target.

### 1.2 Weighted random: RandomSelectActiveSkill [0x17f1cb0]
```
list = candidates.Where(s => s.WeightValue >= 0)        // b__13_0: (w >> 31) ^ 1
sum  = list.Sum(s => s.WeightValue)                      // b__13_1
if sum < 1: return list.OrderBy(_ => Guid.NewGuid()).FirstOrDefault()   // uniform among list (null if empty)
r = new System.Random().Next(sum)                        // unseeded, fresh Random each call
acc = 0
for s in list: acc += s.WeightValue; if r < acc: return s
return uniform fallback (unreachable)
```
- `weightValue = -1` (1467 of 3590 skill-set rows) means "never random": the skill is used only through condition actions. `weightValue = 0` skills are chosen only when every candidate has weight 0.
- The RNG is .NET `System.Random` with no seed, so it cannot be reproduced. Use the simulator RNG with `floor(rng() * sum)`.
- Build (enemy `BattleUnit.ctor(id, questEnemyAppearanceMstId, pos)` [0x1389760]): rows of `QuestEnemySkillSetMst` where `enemySkillSetId = appearance.enemySkillSetId`, kept in reader order.
  - SkillMst.type 1 becomes `ActiveSkill(weight = weightValue, hpGauge = hpGaugeValue)`.
  - type 2 becomes SpecialAttack.
  - Every other type is ignored. Type 4 (AdditionalSkill, 331 rows in enemy sets) is **not** an active skill; it comes from passives through `GetAdditionalSkills`.
  - NormalAttack is null. `isCharacter = false`.
- `hpGaugeValue` is 0 in all 3590 rows, so the gauge filter is dormant, but it is cheap to implement.

### 1.3 Condition actions: EnemyConditionAndActionController

**Build, ctor [0x1496f10]:**
```
rows = EnemyConditionSetsAndActionMst.Where(r => r.enemyConditionSkillSetId == id)   // questEnemyAppearanceMstId column NOT used
list = rows.Select(r => new ConditionSetsAndAction(r.id)).OrderBy(x => x.priority).ToList()   // ascending, stable
```
Ties keep reader order, which is **UNCERTAIN** but probably master-id ascending. It also runs `LoadStartTimingConditionAction` (see 1.5).

**ConditionSetsAndAction.ctor [0x1493930]:**
```
skillIds = skillMstIdCsv.Split(',').Where(nonEmpty).Select(int.Parse).ToList()
Action = isSkillBundle ? new BundleAction(skillIds, isSkillReusable) : new SingleAction(skillIds, isSkillReusable)
Action.IsAvailable = true                                   // ActionBase.ctor [0x1490430]
```

**GetAction(bundle, actionCount = 1) [0x1495fa0]:**
```
if actionCount == 1 && CachedSkillMstIds.Count > 0: return CachedSkillMstIds.Dequeue()
for row in list (priority asc):
    if !row.Action.IsAvailable: continue
    if actionCount > 1 && !row.isSkillBundle: continue
    if actionCount == 1 && row.isSkillBundle: continue        // bundles are skipped in the only real call
    if !row.CheckCondition(bundle): continue
    if !row.isSkillBundle: return SingleAction.GetAction()
    ids = BundleAction.GetActions(actionCount); Cached.Clear(); ids.ForEach(Cached.Enqueue); return Cached.Dequeue()
return null
```
```c
if (*(char *)(*(longlong *)(lVar5 + 0x20) + 0x19) != '\0') {            // Action.IsAvailable
  if (1 < param_3) { if (!IsSkillBundle) goto next; }
  if (param_3 == 1) { if (IsSkillBundle) goto next; }
  if (CheckCondition(lVar5,param_2)) { ... SingleAction__GetAction ... }
```

**SingleAction.GetAction [0x14a47f0]:**
```
if !IsSkillReusable: IsAvailable = false        // one-shot, consumed when PICKED even if the skill id is then not found
return SkillMstIds.OrderBy(_ => Guid.NewGuid()).FirstOrDefault()    // uniform random among the csv ids
```

**BundleAction.GetActions(n) [0x1493160]:** returns `SkillMstIds.GetRange(0, min(n, count))`, and if the row is not reusable sets `IsAvailable = false`. The skills are queued and handed out one per later `GetAction(…, 1)` call, i.e. over consecutive actions or turns, not in one act.
- **In 3.19 bundles are dead code.** `actionCount` is always 1, so bundle rows are skipped. The master data also has **0** rows with `isSkillBundle = true` (5272 are reusable singles, 96 are one-shot singles).
- 54 rows have 3 ids and 15 have 2 ids. Those are singles, so one of them is picked at uniform random.

**Precedence:** the condition action wins over the weighted pick whenever `GetAction` returns an id that exists in `unit.ActiveSkills`. The data pairs these skills with weight −1 in the same skill set; only 21 of 30575 referenced ids are missing from their set. If the id is missing or `GetAction` returns null, selection falls through to the weighted random pick.

### 1.4 CheckCondition [0x14938b0]: what the conditions are evaluated against
```
csv = row.conditionSetMstIdCsv
if string.IsNullOrEmpty(csv) return true
sets = BattleConditionUtils.GetConditionSetListByIdCsv(csv)     [0x17e2c20]
if sets.Count == 0 return true
self = bundle.SelfUnit (acting enemy)
(friends, opponents, friendSP, oppSP) = self.Team == Ally ? (AllyList, EnemyList, sp.ally, sp.enemy)
                                                          : (EnemyList, AllyList, sp.enemy, sp.ally)
return IsMatchConditionSets(sets, self, actor = self, mainTarget = null, eachTarget = null, friends, opponents,
        friendSP, oppSP, act = currentAct, actorActiveSkill = null, actorAbilityEffect = null, notice = null,
        affectedUnits = null, friendAppliedEffectTypes, oppAppliedEffectTypes, ConditionUseType.EnemyAction(3), director)
```
- `IsMatchConditionSets` [0x17e3150] returns `sets.Any(set => set.IsMatchConditionSet(...))`: **OR across the csv**.
- `ConditionSet.IsMatchConditionSet` [0x17ec2d0] returns `!set.ConditionList.Any(c => !c.IsMatchCondition(...))`: **AND inside a set** (`BattleConditionSetMst.battleConditionMstIdCsv`).
- `Condition.IsMatchCondition` [0x17eca80] dispatches on CompareTarget: 1 Self, 2 Actor, 3 MainTarget, 4 AllTargets, 5 FriendTeam, 6 OpponentTeam, 7 Others, 8 EachTarget. It then goes through `BattleUnitConditionChecker.Check` [0x17e3f10] or the team checker, and compares `actual <op> compareValue` with op 1 `==`, 2 `!=`, 3 `>`, 4 `>=`, 5 `<`, 6 `<=`, 7 contains, 8 not-contains.

Contents actually used by enemy rows, with counts over all rows:

| (target, content) | count | semantics (from `Check`) |
|---|---|---|
| (1, 13) EveryNTurn | 5175 | compareValue `"N[,S]"`: `N = max(1, N)`, `S = (S missing, empty or <1) ? 1 : S`. Matches iff `unit.TurnNum >= S && (TurnNum - S) % N == 0`. It is false while `TurnNum < S`. |
| (7, 402) ComboActionStep | 4082 | current act's `ComboTurnUnitAct.ActionStep` (1-based) == value. See 1.6. |
| (5, 306) BreakedUnitTotalCount | 150 | team counter (**UNCERTAIN**: exact counter) |
| (5, 202) AliveUnitCount | 106 | alive units on the friend (enemy) side, self included. "1" means only self is left. |
| (1, 7) Turn | 90 | `unit.TurnNum` (int compare) |
| (1, 12) AbilityEffect | 72 | self has a state whose effect type is in the list (e.g. `COUNTDOWN_START`) |
| (7, 1201) CountdownValue | 60 | countdown referee value |
| (5, 302) BreakedUnitCount | 30 | |
| (7, 2001) BattleStartTiming | 10 | not handled by the checkers (`default` returns false), so **never true in GetAction**. Used only by 1.5. |
| (1, 2) HPRatio | 4 | `HP * 100f / MaxHP` (float, percent; `CalculationHpRate` [0x1383170]) vs float(value) |
| (1, 17) ChargePoint | 2 | `UnitCondition.ChargePoint` |

Other checker cases: 15 HpGaugeCount = `CurrentHpGaugeCount`, 16 IsBreak.

- **TurnNum** (unit+0x88) starts at **1** in the BattleUnit ctor. It is incremented by 1 in `GameDirectorBase.Forward` after every executed act owned by the unit of type TurnUnitActBase (TurnUnitAct, **ComboTurnUnitAct**, AdditionalTurnUnitAct, ReActionTurnUnitAct), SpecialAttackAct, AdditionalSkillAct (counters and triggered skills) or StartTimingAct. Skipped turns (break, stun) do **not** increment it.
- **UNCERTAIN / verify in game:** the literal code increments TurnNum per combo step and per additional-skill act, which breaks the designers' apparent "turn k, step s" tables (see Example 2). Keep a switch in the simulator for "+1 per unit turn" versus "+1 per act".

### 1.5 Start-timing actions (battle or wave start)
- `LoadStartTimingConditionAction` [0x14964f0]: for each row, if any condition in its sets has content **2001** (BattleStart) or **2002** (WaveStart), it adds `StartConditionTimingAction{SkillMstId, timing}` for every skill id in the row.
- `SetupBattleStage` / `WaveTransition` then call `UnitBrain.SetEnabledActiveEnemyUnitsStartConditionTimingAction(enemies, timing)` [0x17f27d0]. That sets `CanActivate` for alive, non-broken enemies.
- `UnitBrain.RegisterEnemyUnitsStartConditionTimingAction` [0x17f2120] (also called from `TurnActSystem.Forward`) registers a `StartTimingAct` per CanActivate and not-yet-registered action. It runs the units in this order: `OrderByDescending(IsMainTargetEnemy).ThenBy(turnGauge time @0x14).ThenByDescending(gauge @0x1c).ThenBy(Id)`, the same as TurnReferee.SortByTurnOrder.
- These acts run before normal turns and increment TurnNum.
- Simulator port: at battle or wave start, each alive, non-broken enemy casts each such skill once, in that unit order.

### 1.6 Combo (multiple actions per turn)
- `TurnActSystem.Forward` [0x15c1170]: `n = unit.Condition.GetMaximumActionNumComboUnitState(unit)?.ActionNum`.
- If `n >= 2`: `ActReferee.AddComboUnitTurnActs(unit, n)` [0x18e8c80] builds TurnBegin, then ComboTurnUnitAct with ActionStep 1..n, then TurnEnd.
- Otherwise: TurnBegin, TurnUnitAct, TurnEnd (`AddDefaultUnitTurnActs` [0x18e8df0]).
- Each step selects its own skill independently (sections 1.1 to 1.4), and ComboActionStep conditions tell the steps apart. The combo state comes from passives or states; it is not part of the condition table.

---

## 2. MP, SP, ultimates, break, turn start

### 2.1 Turn validation: ValidateCanExecuteAct [0x17e27a0]
For TurnUnitActBase:
```
if CanNotAction                        -> 1 (skip)
if IsBreak                             -> 1 (skip)
if CanNotUseSkill && unit.IsEnemy      -> 1 (skip)     // characters would normal-attack instead
if !IsDecided                          -> 2 (decide)
decided: skill must exist in ActiveSkills and (CanNotUseSkill || ConsumeSP <= SP) -> 0 (execute) else 2
```
A skipped turn resets the unit's turn gauge (`ResetTurnGaugeBeforeTurnUnitActExecute` [0x17e1a70]). There is no action and no TurnNum++.

### 2.2 Turn start: ActExecutor.TurnBegin [0x17e1b30] (the same code runs for every unit)
```
cond.IsAdditionalTurnCoolTime = false
ContinuousRecoveryProcess (regen); slip damage
if IsBreak && !CanNotAction:  BreakPoint.ResetValue() (point = max); BreakedDamageReceiveRate = 0; notice "break recovered"
elif !IsBreak:                point = clamp((int)((float)max * (BattleParameter.BreakPointRecoveryPerTurn / 1000f)) + point, 0, max)
(IsBreak && CanNotAction: stays broken)
```
```c
ReDriveBattleCore_BreakPoint__IncreaseValueByRatio(lVar12,(float)*(int *)(lVar13 + 0x4c) / 1000.0);  // BattleParameter+0x4C
...  ReDriveBattleCore_BreakPoint__ResetValue(*(longlong *)(lVar8 + 0x78)); *(undefined4 *)(lVar8 + 0x80) = 0;
```
- The turn order is TurnBegin, then TurnUnitAct, then TurnEnd. A broken enemy therefore recovers at the start of its next own turn and **acts normally in that turn**.
- What break actually costs the enemy: the damage-taken multiplier while broken, plus the turn-gauge slowdown (`BreakMst.breakTurnGaugeSlowRatio`, handled by the existing gauge code) that pushes that next turn back.
- The IsBreak skip in 2.1 only fires if the enemy is still broken at TurnUnitAct time, i.e. broken + CanNotAction, and CanNotAction skips anyway.
- `breakPointRecoveryPerTurn` is per mille of the max break gauge and applies only while not broken. Enemies take it from `BreakMst` through `QuestEnemyAppearanceParameter`.

### 2.3 MP, SP and ultimates
- **Ultimates:** no enemy skill set contains a type-2 (SpecialAttack) skill; the data has only types 1 and 4. The enemy AI never selects SpecialAttack, and `GetAutoSpecialAttackUseUnit` is the ally auto path. Enemies do not use ultimates or MP (EP).
- **SP:** the weighted path and the Validate check `ConsumeSP <= SpReferee.GetSp(team = Enemy)`. Enemy skills have `sp = 0` except one (sp 4), so this is effectively a no-op; model enemy SP as 0 and filter. The condition-action path skips the SP check at selection time, but Validate re-checks it (**UNCERTAIN** whether enemy SP is ever nonzero).
- **Cooldowns:** none exist for active skills. "Cooldown" behaviour is expressed as EveryNTurn condition rows or as one-shot rows (`isSkillReusable = false`).

---

## 3. Targeting

Enemies use the same pipeline as characters: `UnitBrain.TargetingUnits` [0x17f2ea0].
```
effects = skill.GetAbilityEffectList().OrderBy(e => e.DetailMstId)
opp = effects.FirstOrDefault(e => e.TargetSide == 1)   -> oppId = opp.SelectTargetInAIAction(unit, aiFiltered[opp] ?? opponents)   (vslot 0x1a8)
fr  = effects.FirstOrDefault(e => e.TargetSide == 0)   -> frId  = fr.SelectTargetInAIAction(unit, aiFiltered[fr] ?? friends)
if oppId == 0: oppId = teamAttackTargetId (current enemy-team target)
```
For a condition-action skill, ShouldUseSkillBase was not run, so the aiFiltered cache is empty for it and the raw opponents or friends list is used.

The enemy-specific difference is in `DamageAbilityEffectBase.SelectTargetInAIAction` [0x18ef290]:
```
cands = candidates.Where(b__31_0)        // alive/targetable (not re-read)
if unit.isCharacter: order = [UnitFilterByBreak, UnitFilterByMainTarget, UnitFilterMatchWeakElement, WeightedRandomWithHate]
else (enemy):        order = [WeightedRandomWithHate]           // pure aggro roll, ignores break/weakness/main target
return AISkillTargetSelector.SelectTargetUnitInOrder(cands, order)?.Id ?? 0
```
`UnitFilterByRoleAtWeightedRandomWithHate` [0x18efde0] calls `GetUnitWeightDic(cands, withHate: true)` [0x17dcf80] and then `SelectUnitAtWeightedRandom` [0x17dd730]:
```
for u in cands where u.BattleParameter is CharacterParameter:
    w = RoleWeight[u.Role]  // Defender 15, Healer 10, Buffer 10, Debuffer 10, Attacker 5, Breaker 5  (AISkillTargetSelector.cctor [0x17df2d0])
      + sum(active IHateVariation states on u)
    dict[u] = max(0, w)
r = new System.Random().Next(sum(dict.values)); acc = 0
for u in dict (insertion order): acc += dict[u]; if acc > r: return u
return null
```
Non-damage effects (buffs, heals, EP, BP, charge and so on) have their own `SelectTargetInAIAction` and `GetAIFilteredTargets` overrides, which are the same functions characters use. **UNCERTAIN:** whether any of them branch on isCharacter; only the damage override was checked. After the pick, `AutoAction` calls `ChangeTarget(Enemy, oppId)`, so the enemy team's "current target" follows its last choice.

---

## 4. Multi HP gauges and mode change

**HP gauges:**
- Ctor: `InitialHpGaugeCount = CurrentHpGaugeCount = hpGaugeCount`; then `if startHpGaugeCount > 0: CurrentHpGaugeCount = startHpGaugeCount`.
- `IsDead` [0x138aa50] is `HP <= 0 && CurrentHpGaugeCount < 2`. HP 0 with 2 or more gauges left is "not dead".
- `GameDirectorBase.CheckHpGaugeRevive` [0x14991f0] runs after each act. For every unit with `HP <= 0 && CurrentHpGaugeCount >= 2` it adds a `HpGaugeReviveAct`. That runs `ActExecutor.ExecuteHpGaugeRevive` [0x17df9f0]:
  ```
  RemoveUnitState(..., direction = Negative)   // debuffs cleared (exact flags UNCERTAIN)
  Refresh(); HP = MaxHP; BreakPoint.ResetValue()
  TurnGauge.DecreaseGaugeValue(turnGauge@0x14, NextTurnOrderPriority)   // UNCERTAIN: likely makes it act next
  CurrentHpGaugeCount -= 1
  ```
- Condition content 15 (HpGaugeCount) and `ActiveSkill.HpGaugeValue` both read `CurrentHpGaugeCount`.
- Data: only 10 appearances use gauges (counts 2 or 3), and every `hpGaugeValue` is 0.

**Mode change (QuestEnemyModeChangeMst, 110 rows, all `type = 1` HpRatio):**
- `ModeChangeReferee.Init(stage, wave, enemies)` collects the rows for the wave's main-target enemy. `currentStep` is the step of the row whose `questEnemyAppearanceMstId` equals that enemy's appearance id (step 1, threshold 1000, is the spawn form).
- `RemoveModeChangeFirstOther` [0x14a05f0] keeps later-step forms from spawning.
- **Damage cap:** `BattleUnit.Attack` calls `GetNextModeChangeDamageCutDamage` [0x149fd30]. If the unit is the current form and the next step (`step == cur + 1`) exists with type 1: `floor = (int)(threshold * MaxHP / 1000.0)` (double); `if HP - dmg <= floor: dmg = HP - floor`. HP stops exactly at the threshold.
- **Trigger:** `SoloGameDirectorBase.CheckModeChange` [0x14a4bd0] calls `CanModeChange` [0x149f960]. That takes the first main-target enemy and the next-step info; if `(float)HP / MaxHP * 1000 <= threshold` it queues a `ModeChangeAct`, run by `ActExecutor.ExecuteModeChange` [0x17dfcc0].
- The act calls `EnemyAppearanceGameDirectorBase.ModeChangeEnemyBattleUnit` [0x14956f0]: build `new BattleUnit(sameId, nextInfo.questEnemyAppearanceMstId, samePos)`, copy **HP** (not the ratio) and the **TurnGauge** object, then swap the unit in the bundle and re-trigger its battle-start passives. `currentStep++`.
- The new form brings its own stats, break, skill set, condition table (a fresh controller, so one-shots reset) and **TurnNum = 1**.

---

## 5. Waves and summons (high level)
- **Waves:** appearance rows are grouped by `(questStageMstId, wave)`. `wave = 0` is used by the 4336 single-wave stages. Multi-wave stages (41) use 1..3 and have matching `QuestEnemyWaveMst` rows. `WaveTransition` spawns the next wave and fires WaveStart timing actions (1.5).
- **Summons:** rows with `conditionType = 3` (649 rows, `summonId` 1..n) do not spawn initially (`AdditionalEnemyReferee.Initialize` [0x1376f70]).
  - A skill's `SummonAbilityEffect` goes through `EnemyAppearanceGameDirectorBase.GetSummonedUnitList` and `AdditionalEnemyReferee.CreateAdditionalBattleUnitForSummon`, and spawns the matching same-stage rows by summonId.
  - `AddEnemyBattleUnit` sets their HP and resets their TurnGauge.
  - Summons are normal enemies with their own AI.
  - The only other `conditionType` in code is 2 (KnockDown additional enemy: appears when the unit with appearance id `conditionValue` dies); no rows use it.

---

## 6. Worked examples (3.18/3.19 master data)

**Example 1: Dessert Witch, appearance 10411300 (stage 104113, HP 13000).** skillSet 2004001, condSet 2001.

Weighted pool (w > 0): only **2004003 Light DMG [M] (All), w30**. So the random pick always gives 2004003 if it has targets. 2004002, 2004006 and 2004009 have w −1 (condition only).

Condition rows in evaluation order (priority asc, then data order):

| prio | row | reusable | skill | condition (description, decoded) |
|---|---|---|---|---|
| 1 | 2001003 | **no** | 2004002 Light DMG [L] (All) | set 416 「自分のHPが25％未満」: (Self, HPRatio, <, 25), i.e. HP% < 25 |
| 1 | 2001004 | yes | 2004002 | set 592 「2ターンごと（ターン7から）」: EveryNTurn "2,7", TurnNum 7, 9, 11… |
| 2 | 2001002 | **no** | 2004002 | set 415 「HPが75％未満」: HP% < 75 |
| 3 | 2001001 | yes | 2004006 Summon 2 Minions | set 69 「6ターンごと（ターン1から）」: TurnNum 1, 7, 13… |
| 4 | 2001005 | yes | 2004009 DMG Taken UP (All) | set 444 「3ターンごと（ターン4から）」: TurnNum 4, 7, 10… |

Trace at full HP, one act per turn:

| TurnNum | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| skill | summon | 2004003 | 2004003 | DMG-taken-up | 2004003 | 2004003 | 2004002 (p1 beats summon and debuff) | 2004003 | 2004002 | debuff |

The first time HP is below 75%, 2004002 fires once, and the one-shot is then consumed. The same happens once below 25%.

**Example 2: Sandbox Witch, appearance 50914000 (stage 509140, main target, HP 1.5M).** skillSet 2011003, condSet 6003. This is a combo enemy with ActionStep 1 and 2.

Weighted pool: 2011014, 2011015, 2011016, 2011017 (Barrier All), 2011019 and 2011020, **all w1**, so a uniform pick among those with valid targets. 2011012 and 2011013 (Summon 4 allies) have w −1.

Condition rows:
- p1 6003001 (one-shot), 2011012 summon: set 418 「味方が誰もいない（自分だけ）」 (FriendTeam, AliveUnitCount, ==, 1).
- p2 6003002 (one-shot), 2011013 summon: same condition. The witch can therefore re-summon twice in total.
- p3 rows (reusable), each set is "EveryNTurn 4,k AND ComboActionStep s":

| k \ s | step 1 | step 2 |
|---|---|---|
| k = 1 | 2011014 | 2011017 |
| k = 2 | 2011015 | 2011019 |
| k = 3 | 2011015 | 2011017 |
| k = 4 | 2011020 | 2011016 |

- Designer intent is a 4-turn rotation: T1 = 2011014 + Barrier, T2 = 2011015 + DMG Down, T3 = 2011015 + Barrier, T4 = Cleanse + 2011016.
- With the literal +1 per act TurnNum (see 1.4), step 1 always sees odd TurnNum and step 2 even. Only (k=1, s1), (k=2, s2), (k=3, s1) and (k=4, s2) can ever match, giving a 2-turn cycle [2011014, 2011019], [2011015, 2011016]. The other four rows are dead.
- **This is the main thing to verify in game.**
- Whenever no row matches, the step falls back to the uniform w1 pick.

**Example 3a: Mermaid Witch, appearance 11011300 (HP gauges).**
- `hpGaugeCount = 2`, `startHpGaugeCount = 1`, so it starts at CurrentHpGaugeCount 1 and has no revive: IsDead at HP 0. The sibling appearance 11011200 (2, 2) revives once.
- Weighted: only 2010014 Aqua DMG [L] (All), w5.
- Rows (all reusable): p1 2010012 heal plus DMG-taken-down on EveryNTurn "6,6"; p2 2010013 on "4,4"; p3 2010011 on "3,3"; p3 2010015 on "4,2"; p4 2010014 on "2,1".
- Trace TurnNum 1–8: 2010014, 2010015, 2010011, 2010013, 2010014, 2010012, 2010014, 2010013. At 12, "6,6" beats "4,4" and "3,3".
- Every TurnNum matches at least one row: odd numbers hit "2,1", n≡2 (mod 4) hits "4,2", n≡0 (mod 4) hits "4,4". So the weighted pick is never reached, and the w5 entry is only a fallback for when the chosen skill has no targets. Note the condition path does not check targets, so in practice the fallback is never used.

**Example 3b: Uwasa of the Chelation Land Mascot, appearance 50920102.**
- Row 98001001: 5007014 Crit Rate DOWN (All) with set 2642 「バトル開始時の初回行動のとき」, i.e. (Others, BattleStartTiming 2001, ==, TRUE).
- It is cast once as a StartTimingAct at battle start (1.5) and never through GetAction, because content 2001 evaluates false there.
- Normal turns: weighted pool = 5007013 Dark DMG [M] (All), w20 only.

---

## 7. Open points / verification list
1. Does TurnNum increment per combo step and per AdditionalSkillAct? That is the literal reading of `GameDirectorBase.Forward` [0x1499ab0], but Example 2's tables suggest per turn.
2. The reader order of equal-priority condition rows (assumed master-id ascending).
3. The HpGaugeRevive turn-gauge effect and the exact state-removal flags.
4. Target filtering for non-damage effect types when the actor is an enemy.
5. The team-counter contents (302, 306) used by some enemies were not decoded in detail.
