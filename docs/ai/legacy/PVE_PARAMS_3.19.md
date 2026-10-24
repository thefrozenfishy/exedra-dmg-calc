# PvE (Quest / Score Attack) unit parameters - porting spec (3.19.0)

Legend: **[C]** confirmed from decompiled code, **[D]** confirmed from master data only, **[?]** inferred / unverified.
All RVAs refer to `/home/claude/re/decompiled/*.c`. Ghidra names are ICF-folded (e.g. the call to
`AbilityEffectTypeMstModel__get_DisplayType` in the enemy ctor is really `QuestEnemyAppearanceMstModel.get_DEF`, RVA 0x16cbe90).
The mapping below uses the real C# getter behind each RVA.

---------------------------------------------------------------------------------------------------
## 1. Enemy BattleUnit from QuestEnemyAppearanceMst

### Construction chain [C]
```
SoloGameDirectorBase.SetupBattleStage (0x14a55a0)            // Solo=1 and ScoreAttack=6 both use it
  -> WaveReferee.CreateEnemyUnitList (0x15d22e0)
       mst list = QuestEnemyAppearanceMstReader.GetModelListForBattleStart(stageId, wave)
       if QuestEnemyWaveMst.LinkHpType == 1 -> endless-enemy path (AdditionalEnemyReferee)
  -> BattleUnit.ctor(int id, int questEnemyAppearanceMstId, int position)   (0x1389760, ReDriveBattleCore.c:20101)
       mst   = QuestEnemyAppearanceMst[id]
       brk   = BreakMst[mst.BreakMstId]               // throws if missing (every enemy row has one in data)
       param = new QuestEnemyAppearanceParameter(mst, brk)   (0x138b650, ReDriveBattleCore.c:18248)
```

### QuestEnemyAppearanceParameter.ctor (0x138b650) - field map [C]
| master (QuestEnemyAppearanceMst) | runtime BattleParameter field (offset) | scale when used |
|---|---|---|
| atk | ATK (0x10) | raw |
| def | DEF (0x14) | raw |
| criticalRate | CTR (0x18) | `GetProcessedCtr` (0x1385160): `CTR / 10.0f` = **percent**. So per-mille: data 10 -> 1 % crit, 0 -> 0 %. |
| criticalDamageRate | CTD (0x1c) | `GetProcessedCtd` (0x1384e40): `CTD / 10.0f` = percent, then crit mult `(1 + Ctd/100)`. Data 100 -> +10 % (x1.10), NOT +100 %. |
| hp | HP (0x20) -> unit MaxHP (0x28) and HP (0x2c) | raw |
| speed | Speed (0x24) | raw |
| healRate | HealRate (0x28) | /10 (same as characters; all 0 in data) |
| effectHitRate | EffectHitRate (0x2c) | /10 (all 0 in data) |
| effectParryRate | EffectParryRate (0x30) | /10 (one row = 200) |
| fire..neutralDamageRate (rec 0x88..0x9c) | ElementDamageRates[6] (0x38), elements 1..6 | /10 (all 0 in data) |
| fire..neutralResistRate | ElementResistRates[6] (0x40) | `GetProcessedElementResistRate` (0x13864c0): `rate / 10` (decimal) -> percent; 800 -> 80 % |
| questEnemyAppearanceMstId | 0x60 | - |
| isMainTargetEnemy | IsMainTargetEnemy (0x64) | - |
| weakElement1..6 | WeakElements (0x68) -> BattleUnit.WeakElements (0x70) | see item 6 |
| burn/weakness/poison/stun/curse/bleed/vortexParryRate (rec 0x6c..0x84) | AbnormalEffectParryRates (0x70), AbnormalType 1..7 in that order | /10 -> percent (see below) |
| fire..neutralAimDamageRate | ElementAimDamageRates (0x78) | /1000 (see "Aim") |
| hpGaugeCount | HPGaugeCount (0x80) -> unit InitialHpGaugeCount (0xa0) & CurrentHpGaugeCount (0xa4) | |
| startHpGaugeCount | StartHPGaugeCount (0x84) -> CurrentHpGaugeCount if > 0 | |
| linkHpWeight | LinkHpWeight (0x88) | |
| BreakMst.* | BreakPoint 0x48, RecoveryPerTurn 0x4c, BreakTurnGaugeSlowRatio 0x50, InitialBreakedDmgRcvRate 0x54, MaxBreakedDmgRcvRate 0x58, BreakedDmgRcvRateIncreaseRate 0x5c | item 2 |

Other BattleUnit fields set by the enemy ctor [C] (ReDriveBattleCore.c:20420-20500):
- `MstId (0x14) = mst.EnemyMstId`, `Team (0x18) = 1` (Enemy), `PositionId (0x68)`, `isCharacter (0x84) = false`,
  `isCharacterFigure (0x85) = EnemyMst.category == 4`, `isNoVisualDeath (0x86)` from EnemyMst.
- `EP/BP/MaxEP/MaxBP` are **never set -> 0**. Enemies do not use EP; skills come from QuestEnemySkillSetMst
  (`EnemySkillSetId`) + `EnemyConditionAndActionController(EnemyConditionSkillSetId)`.
- PassiveSkills = `[PassiveSkillInfo{ id = mst.PassiveSkillMstId, level = 1 }]`.
- `BreakPoint.Initialize(param.BreakPoint)` (0x1492b20): max = current = breakPoint.
- `BreakedDamageReceiveRate (0x80)` stays 0 until broken.
- Death: `AddHP` (0x1382de0) clamps HP to [0, MaxHP]; a unit is dead only if `HP < 1 && CurrentHpGaugeCount < 2`.
  With extra gauges `ExecuteHpGaugeRevive` (0x17df9f0) refills HP to MaxHP, `BreakPoint.ResetValue()`, gauge count -1.

### Element and Role of an enemy [C]
- **No element, no role.** `BattleUnit.IsMatch(TargetElementType)` (0x1388540) and `IsMatch(TargetRoleType)` (0x13884b0)
  return `true` only for target 0 (wildcard); for non-zero they read `CharacterParameter.Element (0x6c)` / `.Role (0x70)`
  and return **false** for any non-CharacterParameter. So role/element-gated effects never apply to enemies, and
  weak-element hits are impossible *on characters* (only CharacterParameter attackers produce weak hits, see item 6).
  (`QuestStageMst.element` exists but is not read by the core [?] - probably UI "recommended element".)

### "Aim" damage = enemy damage multiplier vs the defender character's element [C]
`BattleDamageCalculator.GetDifficultyCorrectedDamage` (0x137dd90) - pipeline step "difficulty (PvE)":
```
if attacker.param is QuestEnemyAppearanceParameter && defender.param is CharacterParameter:
    r = attacker.ElementAimDamageRates.FirstOrDefault(x => x.Element == defender.Element)   // lambda 0x138e280 reads CharacterParameter+0x6c
    if r != null: d = d + d * ((decimal)r.DamageRate / 1000)
```
Data: 1000 -> enemy deals x2 to that element, 300 -> x1.3. Only affects enemy -> player damage.

### Enemy ailment parry [C]
`BattleUnit.GetAbnormalParryRate(UnitStateBase)` (0x1383190): only for QuestEnemyAppearanceParameter:
`p = (AbnormalEffectParryRates[stateAbnormalType].ParryRate / 10) (+ parry-variation states)`, `/100`, clamp [0,1].
Characters get 0 from this term. (The state-variation part was partially lost in decompile [?]; base term is certain.)

---------------------------------------------------------------------------------------------------
## 2. Enemy break gauge (BreakMst)

| BreakMst | meaning | code |
|---|---|---|
| breakPoint | gauge max and initial value. `HasBreakPoint = max > 0` (0xde8c00). **0 = no gauge, never breaks** (`Decrease` returns early if max<1 or value<1). No special case for 999 - it's just a big gauge (breakMst 8/9 = tutorial-ish rows) [C] | `BreakPoint.Initialize` 0x1492b20 |
| breakPointRecoveryPerTurn | per-mille of max regained at **the unit's own TurnBegin while not broken** | below |
| breakTurnGaugeSlowRatio | on break: `unit.TurnGauge.AddGaugeValue(ratio / 1000f)` (push-back; PvP chars use 250 -> 0.25). Enemy values 300-2000 -> 0.3-2.0 | `BreakPoint.Decrease` 0x1492530 |
| initialBreakedDamageReceiveRate | on break: `BreakedDamageReceiveRate = initial / 10` (e.g. 3500 -> 350) | `Decrease` -> setter with `param+0x54 / 10` |
| maxBreakedDamageReceiveRate | cap: `min(rate + inc, max/10)` | `BattleUnit.AddBreakedDamageReceiveRate` 0x1382cb0 |
| breakedDamageReceiveRateIncreaseRate | growth per hit while broken (below) | `DamageAbilityEffectBase.IncreaseBreakedDamageReceiveRate` 0x18eecd0 |

Pseudocode [C]:
```
// on hit (after damage), BreakPoint.Decrease (0x1492530):
if max < 1 || value < 1: return                           // unbreakable or already broken
value = clamp(value - CalculateProcessedBreakPointDamage(...), 0, max)
if value == 0:
    BreakCount++
    notice.breakDamage = GetBreakDamage(...)
    defender.TurnGauge.AddGaugeValue(param.BreakTurnGaugeSlowRatio / 1000f)
    defender.BreakedDamageReceiveRate = param.InitialBreakedDamageReceiveRate / 10     // int division

// while broken, per damaging hit whose ATTACKER isCharacter (0x18eecd0):
base = skill value5 (if != 0) else by attacker role {1:5, 2:20, 3|6:10, 4|5:12}
inc  = floor((param.IncreaseRate/1000f) * (attacker.GetProcessedBreakedDamageReceiveRatio()/100 + 1) * base)
rate = min(rate + inc, param.MaxBreakedDamageReceiveRate / 10)

// ActExecutor.TurnBegin (0x17e1b30, Act.c:1222) for the acting unit, after slip damage:
if IsBreak && !Condition.CanNotAction:  BreakPoint.ResetValue(); BreakedDamageReceiveRate = 0   // recovers to FULL
else if !IsBreak:  value = clamp(value + (int)(max * (RecoveryPerTurn/1000f)), 0, max)       // IncreaseValueByRatio 0x1492a90
// broken + CanNotAction (e.g. stunned): stays broken, no regen
```
Note the sim's `BreakPoint.ts` hard-codes PVP_POLICY 1000/2000/1000/250; for enemies these must come from BreakMst
(values are already the raw ints; keep the `/10` and `/1000`).

---------------------------------------------------------------------------------------------------
## 3. Player characters in PvE [C]

`CharacterParameter.ctor(..., StyleMst, bool isPvpOrGvg = false)` (0x138af80, ReDriveBattleCore.c:17643):
```
Element (0x6c) = style.Element; Role (0x70) = style.Role; MaxEP (0x74), MaxBP (0x78) from style
if !isPvpOrGvg:                       // Solo, ScoreAttack, Gve, raids...
    BreakPoint = 0; BreakPointRecoveryPerTurn = 0          // 8-byte zero at 0x48
    InitialBreakedDamageReceiveRate = 1300 (0x514); MaxBreakedDamageReceiveRate = 2000
    BreakTurnGaugeSlowRatio = BreakPoint.BreakTurnGaugeSlowRatio(static 25) * 10 = 250
    BreakedDamageReceiveRateIncreaseRate = 1000
else:                                 // PvP/GvG: CalculationPointPolicyMst policyType 3 rows
    BreakPoint = CalculateBreakPoint(rarity, role) (0x138aba0: baseBreakGaugeValue + rarity/role UpRatios)
    0x50/0x54/0x58 from policy rows (b__37_0..2), RecoveryPerTurn = 0, IncreaseRate = 1000
```
Character BattleUnit ctor (0x138a1d0) only calls `BreakPoint.Initialize` if `param.BreakPoint > 0` -> in PvE
**characters have no break gauge and can never be broken**; the 1300/2000 values are dead data.
`isPvpOrGvg` is passed by client code outside ReDriveBattleCore (`CreateCharParamFromNetworkUnit`), assumed false for quests [?].
EP = 0 at start, MaxEP from style (same as PvP).

### PvP-only vs PvE-only branches in the damage/heal pipeline
PvP/GvG-only (already in sim): `DamageCutByPvpOrGvgSuppression` x(1-750/1000); heal x0.5 (`GetProcessedRecoveryValue`);
barrier x0.5 (`BarrierUnitState.CalculateEndurance/MaxEndurance`). All three are off in Solo/ScoreAttack.
PvE-only (gated on `param is QuestEnemyAppearanceParameter`) [C]:
- `GetDifficultyCorrectedDamage` (Aim, above) - enemy attacker only.
- `GetAbnormalParryRate` enemy ailment parry (above); `AddRepeatStunParryRateIfNeed`; `UnitFilterByMainTarget`; `IsDamageDisabled` (UniqueEnemy639002).
- Weak-element damage x1.2 and weak-element break x1.2 (`BreakPointWeakElementDecreaseRatio` = 0.2) - need defender.WeakElements, i.e. enemies.
- Break-rate growth only from character attackers (`isCharacter`), so enemies never grow a (non-existent) player break rate.
- HP gauges / LinkHp / mode change / summons (EnemyAppearanceGameDirectorBase).
- `SetupBattleStage(..., campUpDmg, campUpBreakPointDmg, victoryRound)`: quest campaign damage/break-damage up buffs are injected here [?] (values come from client).

---------------------------------------------------------------------------------------------------
## 4. CalculationPointPolicyMst policyType [C enum / D data]
`Network.Definition.CalcPoint.CalculationPointPolicyType` (dump.cs:99362):
`1 ScoreAttack, 2 Quest, 3 PvpOrGvg, 4 Gve, 5 Pvp, 6 Gvg, 7 SoloRaid`. (BattleType enum is different: 1 Solo, 2 Pvp, 3 Gve, 4 Gvg, 5 Exploration, 6 ScoreAttack, 7 Simulation, 8 MultiRaid, 9 SoloRaid.)

| type | rows | use |
|---|---|---|
| 1 | maxRoundBonus 5000; penaltyPerRound cond 0..16 (1000,900,...,100); difficultyBonus cond 1..50 (10000..); difficultyCoefficient cond 1..50 (1000,1050,...); divideDamageBonus 9500; baseAliveBonus 1000; baseHpBonus 15000 | Score Attack **result score** |
| 3 | break gauge / suppression rows | battle core (PvP/GvG) - only type the core reads |
| 5 | basePoint, relativelyBonus, roundBonus, hpBonus, winStreakBonus | PvP ranking points |
| 7 | difficultyScore, clearRoundBonusDifficultyRate, battleCountBonus(cond,cond2), bossRestHpBonus(cond %HP, cond2) | Solo Raid score (`ScoreInfo{score, difficultyScore, clearRoundBonus, battleCountBonus, ...}` returned by server) |

**The score formulas are NOT in the decompiled code.** No ReDriveBattleCore function references any type 1/5/7
coefficient name (grep of `StringLiteral_maxRoundBonus` etc. = 0 hits); they are only in client UI classes
(`PopupScoreAttackReadyController.OpenReadyPopup` b__3, `StoryEventScoreAttackTopPartsController.SetupFirstTimeOnly`)
which are not decompiled, and the final score comes from the server. Any formula is a guess [?], e.g.
`score ~ damage * difficultyCoefficient/1000 * (maxRoundBonus - penaltyPerRound[round]...)/1000 + alive/HP bonuses`.
To confirm: decompile `PopupScoreAttackReadyController` / battle result UI in Assembly-CSharp, or fit against real results.

---------------------------------------------------------------------------------------------------
## 5. Score Attack battle specifics
- `ScoreAttackGameDirector` (ctor 0x14a42a0) = `SoloGameDirectorBase` + `get_BattleType() = 6` (0xdb7a40). No custom
  damage, turn or HP logic in the core [C].
- Judge: `QuestJudgeResultReferee(stageId, victoryRound)` (ctor 0x14a46c0). `RoundLimit = 100` (0xc2a210, same as
  every quest). `CheckBattleFinishBeforeAct(nextActRound)` (0x14a4410):
  ```
  if victoryRound > 0 && nextActRound > victoryRound: Result = Winning(1); FinishByRoundLimit = true
  elif nextActRound > 100:                             Result = Losing(2);  FinishByRoundLimit = true
  ```
  After each act (`JudgeResultRefereeBase.CheckBattleFinishAfterAct` 0x149e760): all enemies dead -> Win, all allies dead -> Lose.
  All 1202 ScoreAttack stages have `judgeResultType = 0` [D] (no HP-gauge judge).
  `victoryRound` is supplied by client/server (`QuestInitializer.VictoryRound`); its Score Attack value is not in any master table [?].
- **What a round is** [C] (`TurnReferee.get_CurrentRound` 0x15c2780, `CalculateNextRound` 0x15c18b0): time-based,
  not per-unit-turn: `t = elapsedActionTime` (+ next actor's gauge time); `round = t < 150 ? 1 : floor((t-150)/100) + 2`
  (`FirstRoundTime = 150f`, `DefaultRoundTime = 100f`, cctor 0x15c2710). Same as PvP.
- Damage total/cap: enemy HP is clamped at 0 in `AddHP`, so HP loss is capped per enemy; score attack bosses have
  18M-180M HP [D] so the cap rarely matters. The UI has `ScoreAttackMaxDamageView.maxRoundDamageValueText` (max damage
  in one round?) [?]. Whether the server score uses notice damage (uncapped) or HP lost is unknown [?].

---------------------------------------------------------------------------------------------------
## 6. Weak element and resist
- `BattleUnit.WeakElements` is filled **only** from `QuestEnemyAppearanceParameter.WeakElements` [C] =
  `[weakElement1..6].Where(e => Enum.IsDefined(ElementType, e))` (get_WeakElements 0x16d4ed0, lambda 0x16db930)
  -> zeros dropped. ElementType: 1 Fire, 2 Aqua, 3 Forest, 4 Light, 5 Dark, 6 Neutral.
- Weak hit (sim's rule already correct): attacker must be a character, attackElement != 0, attackElement in defender.WeakElements;
  ratio 1.2f + Σ(UpWeakElement up)/100 (float32). Also break damage x1.2 on weak.
- Resist does reduce damage [C]: `GetProcessedElementResistRate` (0x13864c0) = `ResistRate/10` + resist states; then
  `GetElementResistDamage` (0x137e130) clamps to [-100, 100] and applies `d * (1 - r/100)`. Enemy data uses 100/300/600/800/900
  (10-90 %). A weak element can also have resist (not mutually exclusive in data) - apply both steps independently.

---------------------------------------------------------------------------------------------------
## Porting checklist
```ts
enemyFromMst(m, b /*BreakMst*/) = {
  atk: m.atk, def: m.def, maxHp: m.hp, hp: m.hp, speed: m.speed,
  ctr: m.criticalRate /10 /*%*/, ctd: m.criticalDamageRate /10 /*%*/,
  healRate: m.healRate, effectHitRate: m.effectHitRate, effectParryRate: m.effectParryRate,   // same raw scale as chars
  elementDamageRate: {1..6: m.<el>DamageRate}, elementResistRate: {1..6: m.<el>ResistRate},   // raw, /10 at use
  aimDamageRate: {1..6: m.<el>AimDamageRate},                                                 // /1000, enemy->char only
  ailmentParry: {burn,weakness,poison,stun,curse,bleed,vortex: m.<x>ParryRate},              // /10 %
  weakElements: [m.weakElement1..6].filter(e => e>=1 && e<=6),
  element: 0, role: 0, isCharacter: false, ep: 0, maxEp: 0,
  breakMax: b.breakPoint, break: b.breakPoint, breakRegenPerMille: b.breakPointRecoveryPerTurn,
  breakSlow: b.breakTurnGaugeSlowRatio, breakInit: b.initialBreakedDamageReceiveRate,
  breakMaxRate: b.maxBreakedDamageReceiveRate, breakInc: b.breakedDamageReceiveRateIncreaseRate,
  hpGauges: m.hpGaugeCount, curHpGauge: m.startHpGaugeCount > 0 ? m.startHpGaugeCount : m.hpGaugeCount,
  isMainTarget: m.isMainTargetEnemy, passive: [m.passiveSkillMstId @ lv1],
}
character in PvE: breakMax = 0 (no break), no PvP suppression, no heal/barrier halving.
```
