# Master data (src/assets/base_data) and wiki pages

`base_data/get<Name>MstList.json` are the game's master tables (auto-synced by a GitHub Actions bot after patches;
~3.18/3.19). Each is a JSON list of rows. `xq` reads them for you; the rules below are what you need when writing
engine code or a one-off query.

## Kiokus (characters)

`kioku_data.json` is a **dict keyed by kioku name** (114). Fields: `id` (= styleMstId), `character_en`, `rarity`,
`element` ("Flame"/"Aqua"/"Forest"/"Light"/"Dark"/"Void"), `role` ("Attacker"/"Breaker"/"Defender"/"Buffer"/
"Debuffer"/"Healer"), stats `hp120..atk200..def200`, `minSpd`, `ep`, and the kit ids:

| slot | id field | detail table | row key |
|---|---|---|---|
| basic attack / battle skill / ultimate | `attack_id` / `skill_id` / `special_id` | getSkillDetailMstList | `skillMstId == id*100 + lvl` (lvl 1..10) |
| ability (magic) | `ability_id` | getPassiveSkillDetailMstList | `passiveSkillMstId == id*100 + lvl` |
| ascension 1/2/4 effects | `ascension_N_effect_2_id` | passive details | `id*100 + 1` |
| support ability | `support_id` (+ `support_target` = role or element it must match) | passive details | `id*100 + lvl` |
| crystalis (kit EX crys) | `crystalis_id` | passive details | **exact** `passiveSkillMstId == id` |
| equipped crys | getSelectionAbilityMstList row: `value1` = passive id (`styleMstId` 0 = generic pool, else EX crys of that kioku) | passive details | **exact** |
| portrait | getCardMstList `passiveSkill1` | passive details | `id*100 + 6` (as PvPKioku uses) |

**Trap:** looking up `skillMstId == 1195` finds nothing; the rows are `119501..119510`. A scan that forgets this
concludes "no kioku uses X" (happened; see PITFALLS.md). Follow-ups: `ADDITIONAL_SKILL_ACT` & co. have the
follow-up skill id in `value1`; its rows are keyed by that id directly (level-less) or id*100+lvl - xq tries both.

## Detail rows (skill and passive)

Common columns: `abilityEffectType` (the effect string, see EFFECT_TYPES.md), `value1..value5`, `turn` (duration),
`remainCount`, `probability` + `isFixedProbability`, `range` (-1 self, 1 single, 2 splash = main + adjacent, 3 all),
`element` / `role` (for DMG_* the element is the **attack element**; for states it's a CanAddTo filter, see
MECHANICS), `startConditionSetIdCsv`, `activeConditionSetIdCsv`. Passives also have `startTimingIdCsv`
(ProcessTiming: 1 BattleStart, 2 WaveStart, 3 TurnStart, 4 AttackStart, 5 AttackEnd, 6 TurnEnd, 7 WaveEnd,
8 BattleEnd, 9 AfterProcess, 10 SeasonBuffActive = Solo Raid vanguard phase).
Values are usually per-mille (`v1=300` = 30 %), ratios in stat states are `v/10` percent. Check the game class.
Names/descriptions: getSkillMstList (`type` 1 Active, 2 Special, 3 Normal, 4 Additional), getPassiveSkillMstList.
Effect type metadata: getAbilityEffectTypeMstList (display name, category).

## Conditions

- A csv of **condition set ids** (getBattleConditionSetMstList: `battleConditionMstIdCsv`, Japanese `description`)
  is **OR** over sets (`IsMatchConditionSets` = Any); conditions inside a set are **AND**.
- getBattleConditionMstList row: `compareTarget` (1 Self, 2 Actor, 3 MainTarget, 4 AllTargets, 5 FriendTeam,
  6 OpponentTeam, 7 Others, 8 EachTarget), `compareContent` (names: `xq enum CompareContent`), `compareOperator`
  (1 ==, 2 !=, 3 >, 4 >=, 5 <, 6 <=, 7 contains, 8 not-contains), `compareValue` (string: number, "TRUE"/"FALSE",
  a type list "LOCK_TURN_ORDER,1", "N,S" for EveryNTurn, "pid,n" for unique states...).
- Content ranges: 1-31 unit state (BattleUnitConditionChecker: HP, Turn 7, AbilityEffect 12, EveryNTurn 13,
  ChargePoint 17, UniqueAbilityEffect 26..31...); 101-116 what happened to the unit in the current skill
  (AffectedUnitNotice: DMG 101, IsKilled 103, IsReceivedAttack 110, IsExpandZone 113...); 201-212 team state
  (SP 201, AliveUnitCount 202, AbilityEffectUnitCount 205, AllUnitCountPointCount 209...); 301-316 team totals of
  the current skill's notices (TotalDamage 304, BreakedUnitCount 302, HitUnitCount 313...); 401-403 act info
  (ActorSkillType 401, ComboActionStep 402, ActorDamageRange 403); 1001 IsAlly, 1101 IsSeasonBuffActive (raid
  vanguard), 1201/1202 countdown, 2001/2002 Battle/WaveStartTiming (only meaningful for enemy start-timing rows;
  the normal checkers return false). Full list: `xq enum CompareContent`. `xq cond <csv>` decodes a set.

## Enemies and stages

| table | key facts |
|---|---|
| getQuestStageMstList | `questStageMstId`, `name`, `difficulty`, `questGroupMstId`, `judgeResultType` |
| getQuestEnemyAppearanceMstList | one row per enemy placement: `questStageMstId`, `wave` (0 = single wave), stats `hp atk def speed`, `criticalRate`/`criticalDamageRate` (per-mille), `breakMstId`, `enemySkillSetId`, `enemyConditionSkillSetId`, `passiveSkillMstId` (**exact id**, level 1), `weakElement1..6`, `<elem>ResistRate` / `<elem>AimDamageRate` / `<ailment>ParryRate` (per-mille), `isMainTargetEnemy`, `conditionType` (0 normal, 3 summon with `summonId`), `hpGaugeCount`/`startHpGaugeCount`, `linkHpWeight` |
| getEnemyMstList | `enemyMstId` -> `name` |
| getBreakMstList | `breakPoint` (0 = unbreakable), `breakPointRecoveryPerTurn` ‰, `breakTurnGaugeSlowRatio` ‰, `initial/max/IncreaseRate` broken damage rates |
| getQuestEnemySkillSetMstList | `enemySkillSetId` -> rows `skillMstId`, `weightValue` (-1 = condition-only), `hpGaugeValue` |
| getEnemyConditionSetsAndActionMstList | `enemyConditionSkillSetId` -> rows `priority` (asc), `conditionSetMstIdCsv`, `skillMstIdCsv` (uniform pick), `isSkillReusable` (false = one-shot), `isSkillBundle` (unused in 3.19) |
| enemy skill details | getSkillDetailMstList with `skillMstId == enemy skill id` **exactly** (no level) |
| getQuestEnemyWaveMstList | `questStageMstId`, `wave`, `linkHpType` (0 none, 1 endless minions, 2 shared boss pool), `linkHpName`, `enemyTipsText` |
| getQuestEnemyModeChangeMstList | form changes: `questEnemyAppearanceMstId`, `step`, `type` 1 (HP ratio), `thresholdValue` ‰ |
| getSoloRaidStageMstList / SoloRaidMst / PartyBuff / SeasonBuff | Solo Raid: `limitRoundCount`, buff groups, vanguard passives (`passiveSkillMstId`, `enhancedPassiveSkillMstId`, `buffPointChargePassiveSkillMstId`, `enhancedSkillTurnGaugeValue`, `maxBuffPoint` 100, `maxBuffPointOnEnhanced` 30) |
| getScoreAttackStageMstList | Score Attack stages (all `judgeResultType` 0) |
| getCalculationPointPolicyMstList | policy values (policyType 3 = PvP/GvG battle core: suppression, break) |
| getUniqueStatePatternMstList / LevelMst | unique state names (pattern id = `value1` of UNIQUE_*), Lv thresholds (`groupId` = value2, `conditionCount`) |

Useful stages: 509140 Sandbox Witch (combo + rotation), 110112 Mermaid Witch (2 HP gauges), 509196 (3 waves),
104113 Dessert Witch (condition rows), 1401101 Dessert Witch Solo Raid (link HP 1 then 2, countdown, form change).

## Wiki pages (E:\ma-ex-data\wiki)

`kioku_pages/<Kioku name>.wt`: infobox (id, element, role), stats, `{{Kioku Skills ...}}` with `special_id`,
`special_indexable = ADDITIONAL_DAMAGE, DMG_ATK, TSUBAME_CORE, ...` per slot (attack/skill/special/ability/support/
crystalis/ascension_N_effect_2), plus descriptions. `battle_pages/*.wt`: per event/stage, enemies with
`indexable = ...`. Grep them to answer "which kiokus/stages use X" in one line:
`grep -l "TSUBAME" $HOME/mnt/ma-ex-data/wiki/kioku_pages/*.wt`. `xq effect` does the same from the data.
