# Version diff 3.19.0 -> 3.19.1 (generated 2026-10-02T08:23:12)

## Client binaries (Senbei output)

- `GameAssembly.unpack.dll`: 138817536 -> 138817536 bytes, **code identical** (only data/resource/debug sections differ); PE timestamp 2026-09-17T08:10:53Z -> 2026-09-24T02:49:59Z
  - section `.rdata`: changed, 2 pages, 10 bytes
  - section `_RDATA`: changed, 19 pages, 45820 bytes
  - section `.reloc`: changed, 1 pages, 1148 bytes
- `MadokaExedra.unpack.exe`: 1040384 -> 1044480 bytes, **code identical** (only data/resource/debug sections differ); PE timestamp 2025-09-26T11:16:27Z -> 2025-09-26T11:16:27Z
  - section `_RDATA`: changed, 85 pages, None bytes
  - section `.rsrc`: changed, 129 pages, 450910 bytes
  - section `.reloc`: changed, 1 pages, 3845 bytes
- `baselib.unpack.dll`: 610304 -> 610304 bytes, **code identical** (only data/resource/debug sections differ); PE timestamp 2025-09-26T11:16:23Z -> 2025-09-26T11:16:23Z
  - section `_RDATA`: changed, 19 pages, 41414 bytes
  - section `.reloc`: changed, 1 pages, 3333 bytes

## global-metadata.dat
- v31, 33359 string literals; version literals ['2.1.1', '2.1.2', '2.1.27', '2.23.136', '2.7.2', '3.19.1', '3.2.6', '3.2.8']
- literals gone since the old dump: ['3.19.0']
- literals not in the old dump (13; Il2CppDumper omits unreferenced ones, so most of these are not new): ['3.19.1', 'Cannot get the real proxy from an object that is not a transparent proxy.', 'Cannot process request because the process has exited.', 'EN: SlotItemContentViewType にあわせた Prefab を指定してください: {0}', 'It is not possible marshal a proxy of a remote object.', 'Output length too large', 'Paddings not used for stream ciphers', 'Part count must not exceed byte.MaxValue=', 'Part index must not be negative', 'SOCKS proxy: No acceptable method', 'SceneType', 'Scheduled Item type is not supported by this scheduler', "This isn't a 64bits machine."]

## Master data: `4ea7254^` -> `HEAD`

### New kiokus
- **Metallicized Projectile** (10020801) 5* Flame Attacker, release 2026-09-27T21:00:00+09:00
### Balance changes
- none (no existing skill/passive row changed)
### New effect types
- `LOCK_SPECIAL_ATTACK` "Magic Seal": engine **yes**, used by 0 new rows
### Effect types used by new skill/passive rows (engine coverage)
- 65 types; not plainly covered: `UNIQUE_BUFF` (prefix/template?), `DWN_CTR_RATIO` (prefix/template?)
### New conditions: 23 rows, 0 with a compareContent never seen before
### New stages
- group 71100 Birdcage Witch_Chaos: 1 stages (113401) e.g. Birdcage_4-BOSS_C
- group 71800 Uwasa of the Commoner's Horse_Chaos: 1 stages (116401) e.g. Horse_2-BOSS_C
- group 71200 Stage Witch_Chaos: 1 stages (117401) e.g. Stage_3-BOSS_C
- group 1103 [Redux] Eternal Summer Days Part II_Score Attack: 51 stages (982301, 982302, 982303, 982304, 982305, 982306...) e.g. Score Attack Rank 1, Score Attack Rank 2, Score Attack Rank 3, Score Attack Rank 4
- group 1107 My Friend: 15 stages (982501, 982502, 982503, 982504, 982505, 982506...) e.g. My Friend Battle 1, My Friend Battle 2, My Friend Battle 3, My Friend Battle 4
- group 4003 Chapter 1 Part II: 1 stages (1309101) e.g. Exedra Quest 1-5
- group 3007 Season 7: Rose Garden Witch: 6 stages (1407101, 1407102, 1407103, 1407104, 1407105, 1407106) e.g. Rose Garden Witch (Easy), Rose Garden Witch (Normal), Rose Garden Witch (Hard), Rose Garden Witch (Very Hard)
### New enemies
- Rose Garden Witch (Apex Form) (600021)
- Rose Garden Witch (Apex Overdrive Form) (600022)
### New Solo Raid
- {"soloRaidMstId": 7, "startTime": "2026-10-01T12:00:00+09:00", "battleEndTime": "2026-10-08T23:59:59+09:00", "endTime": "2026-10-13T04:59:59+09:00", "stages": [{"stage": 1407101, "name": "Rose Garden Witch (Easy)", "difficulty": 1, "rounds": 5}, {"stage": 1407102, "name": "Rose Garden Witch (Normal)", "difficulty": 2, "rounds": 5}, {"stage": 1407103, "name": "Rose Garden Witch (Hard)", "difficulty": 3, "rounds": 4}, {"stage": 1407104, "name": "Rose Garden Witch (Very Hard)", "difficulty": 4, "rounds": 4}, {"stage": 1407105, "name": "Rose Garden Witch (Extra)", "difficulty": 5, "rounds": 3}, {"
### New Score Attack
- {"scoreAttackMstId": 28, "name": "Box Witch", "startTime": "2026-09-27T21:00:00+09:00", "endTime": "2026-11-05T11:59:59+09:00", "comment": "The boss has 3 actions, but is reduced to 2 actions when applying an ailment to it.\nAlso, DMG dealt increases while in break, stacking up to 3 times based on the number of ailments applied.\nTry to keep multiple ailments on the boss consistently while timing your attacks for maximum damage."}
### New Story events
- {"storyEventMstId": 76, "title": null, "name": "Madoka's Birthday 2026: A Special Group Snapshot", "startTime": null, "endTime": null}
- {"storyEventMstId": 77, "title": null, "name": "Box Witch Score Attack", "startTime": null, "endTime": null}
- {"storyEventMstId": 80, "title": null, "name": "My Friend", "startTime": null, "endTime": null}
### New crys / portraits
- My Friend (4200098) 5*: Increases flame DMG dealt by 12.5%. Equipped to Attacker: Also increases critical DMG by 8.5%.
- Walpurgisnacht Rising KV Part 1 Homura (4200099) 5*: Increases battle skill DMG dealt by 12.5%. Increases follow-up attack and counterattack DMG dealt by 12.5%.
- Magia Day 2026 Celebration (4200100) 5*: Increases ATK by 7.5%. Increases SPD by 10%.
- Ribbons of Devotion (4200101) 5*: Increases DEF by 7.5%.
### New EX crys (selection abilities)
- To See Her Again for Metallicized Projectile: Increases SPD by 10% and ATK by 10%.  While Ember Feather is applied: On special attack, increases own DMG dealt when targeting elemental weakness by 20%.
### New unique state patterns
- 30 Ember Feather
- 10004 Flame Field
### New banners
- banner_00383; banner_00383; banner_00383; banner_00399; banner_00388; banner_00389; banner_00386; banner_00387; banner_00364; banner_00391; banner_00392; banner_00382; banner_00393; banner_00394; banner_00395
### Per-file counts (+added -removed ~changed)
- getAbilityEffectTypeMstList.json: +1 -0 ~0
- getAdvMstList.json: +8 -0 ~249 fields {'releaseTime': 249}
- getAdvTitleMstList.json: +3 -0 ~0
- getAlternativeStoryMstList.json: +0 -0 ~1 fields {'startTime': 1, 'title': 1, 'description': 1}
- getAlternativeStoryPointGroupMstList.json: +2 -0 ~0
- getAlternativeStoryPointMstList.json: +5 -0 ~21 fields {'alternativeStoryPointGroupMstId': 21}
- getBannerMstList.json: +15 -0 ~0
- getBattleConditionMstList.json: +23 -0 ~0
- getBattleConditionSetMstList.json: +142 -0 ~0
- getBingoMissionMstList.json: +1 -0 ~0
- getBreakMstList.json: +58 -0 ~0
- getCalculationPointPolicyMstList.json: +1 -0 ~0
- getCameraPoseMstList.json: +8 -0 ~0
- getCardLimitBreakMstList.json: +24 -0 ~0
- getCardMstList.json: +4 -0 ~0
- getCharacterMstList.json: +0 -0 ~65 fields {'canSelectProfileFavorite': 65}
- getCollaborationCopyrightMstList.json: +3 -0 ~0
- getDioramaBackgroundMstList.json: +2 -0 ~0
- getDollhouse2dBackgroundMstList.json: +3 -0 ~0
- getEnemyConditionSetsAndActionMstList.json: +148 -0 ~0
- getEnemyMstList.json: +2 -0 ~0
- getFieldPointMstList.json: +3 -0 ~0
- getFieldSeriesMstList.json: +3 -0 ~2 fields {'name': 2}
- getFieldStageMstList.json: +3 -0 ~6 fields {'name': 6}
- getFieldStratumMstList.json: +3 -0 ~0
- getHomeAppealMstList.json: +31 -0 ~11 fields {'endTime': 9, 'bannerText2': 2, 'startTime': 1}
- getHomeBannerMstList.json: +4 -0 ~0
- getItemMstList.json: +25 -0 ~6 fields {'name': 3, 'rarity': 3, 'resourceName': 1, 'validDays': 1}
- getLive2DParamMstList.json: +2 -0 ~0
- getLocalizeTextMstListDefaultAndClientDefined.json: +90 -0 ~0
- getLoginBonusMstList.json: +3 -0 ~0
- getLoginBonusRewardMstList.json: +85 -0 ~0
- getMiniTutorialMstList.json: +0 -0 ~1 fields {'resourceName': 1}
- getMissionMstList.json: +170 -91 ~44 fields {'endTime': 38, 'title': 6, 'description': 2}
- getMissionTitleMstList.json: +7 -2 ~0
- getMissionTransitionConditionMstList.json: +2 -0 ~0
- getMissionTransitionMstList.json: +1 -0 ~0
- getMovieReplaceMstList.json: +6 -0 ~0
- getPassiveSkillDetailMstList.json: +435 -0 ~0
- getPassiveSkillMstList.json: +78 -0 ~0
- getPassiveSkillSortMstList.json: +4 -0 ~0
- getQuestCampaignMstList.json: +3 -0 ~0
- getQuestConditionMstList.json: +3 -0 ~0
- getQuestEnemyAppearanceMstList.json: +209 -0 ~0
- getQuestEnemyModeChangeMstList.json: +18 -0 ~0
- getQuestEnemySkillSetMstList.json: +118 -0 ~0
- getQuestEnemyWaveMstList.json: +12 -0 ~0
- getQuestGroupMstList.json: +8 -0 ~2 fields {'name': 2}
- getQuestGuestMemberMstList.json: +1 -0 ~0
- getQuestMapMstList.json: +0 -0 ~14 fields {'shortName': 14}
- getQuestMissionMstList.json: +9 -0 ~0
- getQuestRewardMstList.json: +27 -0 ~0
- getQuestStageMstList.json: +76 -0 ~0
- getScoreAttackHighScoreRewardMstList.json: +123 -0 ~0
- getScoreAttackMstList.json: +1 -0 ~1 fields {'name': 1}
- getScoreAttackStageMstList.json: +51 -0 ~1202 fields {'isEx': 1202, 'fixedDifficultyScore': 1202}
- getScoreAttackTotalScoreRewardMstList.json: +150 -0 ~0
- getSelectionAbilityMstList.json: +1 -0 ~0
- getShopMstList.json: +121 -0 ~0
- getShopSeriesMstList.json: +8 -0 ~0
- getSkillDetailMstList.json: +370 -0 ~0
- getSkillMstList.json: +112 -0 ~0
- getSoloRaidMstList.json: +1 -0 ~0
- getSoloRaidPartyBuffMstList.json: +3 -0 ~0
- getSoloRaidRankingRewardMstList.json: +146 -0 ~0
- getSoloRaidSeasonBuffMstList.json: +1 -0 ~0
- getSoloRaidStageMstList.json: +6 -0 ~0
- getSoloRaidTotalScoreRewardMstList.json: +98 -0 ~0
- getStoryEventBonusRateMstList.json: +6 -0 ~0
- getStoryEventMstList.json: +3 -0 ~76 fields {'explorationShortcutMstId': 76}
- getStoryEventQuestStageMstList.json: +15 -0 ~0
- getStoryEventScenarioMstList.json: +5 -0 ~0
- getStoryEventScenarioRewardMstList.json: +5 -0 ~0
- getStyle3dCharacterGroupMstList.json: +1 -0 ~0
- getStyle3dCharacterMstList.json: +1 -0 ~0
- getStyleFigureMstList.json: +1 -0 ~0
- getStyleLevelUpMstList.json: +6 -0 ~0
- getStyleLimitBreakEffectMstList.json: +3 -0 ~0
- getStyleLimitBreakMstList.json: +5 -0 ~0
- getStyleLive2dCostumeGroupMstList.json: +1 -0 ~0
- getStyleLive2dCostumeMstList.json: +1 -0 ~0
- getStyleMstList.json: +1 -0 ~0
- getStyleOverrideProfileMstList.json: +1 -0 ~0
- getStyleParamUpMstList.json: +140 -0 ~0
- getSubscriptionMissionRewardMstList.json: +30 -0 ~0
- getUniqueStatePatternMstList.json: +2 -0 ~0
- getUserTitleMstList.json: +5 -0 ~3 fields {'title': 3}
- files only in new: ['getAlternativeStoryPointGroupMstList.json', 'getExplorationShortcutMstList.json']; only in old: []

