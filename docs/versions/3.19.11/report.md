# Version diff 3.19.0 -> 3.19.11 (generated 2026-10-05T19:05:49)

## Client binaries (Senbei output)

- `GameAssembly.unpack.dll`: 138817536 -> 138817536 bytes, **CODE CHANGED**; PE timestamp 2026-09-17T08:10:53Z -> 2026-09-30T04:41:36Z
  - section `il2cpp`: changed, 3 pages, None bytes
  - section `.rdata`: changed, 3 pages, 12 bytes
  - section `.data`: changed, 1 pages, 5 bytes
  - section `.pdata`: changed, 2 pages, 3 bytes
  - section `_RDATA`: changed, 136 pages, 95146 bytes
  - section `.reloc`: changed, 1 pages, 1154 bytes
- `MadokaExedra.unpack.exe`: 1040384 -> 1044480 bytes, **code identical** (only data/resource/debug sections differ); PE timestamp 2025-09-26T11:16:27Z -> 2025-09-26T11:16:27Z
  - section `_RDATA`: changed, 85 pages, None bytes
  - section `.rsrc`: changed, 128 pages, 452647 bytes
  - section `.reloc`: changed, 1 pages, 3838 bytes
- `baselib.unpack.dll`: 610304 -> 610304 bytes, **code identical** (only data/resource/debug sections differ); PE timestamp 2025-09-26T11:16:23Z -> 2025-09-26T11:16:23Z
  - section `_RDATA`: changed, 27 pages, 70068 bytes
  - section `.reloc`: changed, 1 pages, 3849 bytes

## global-metadata.dat
- v31, 33359 string literals; version literals ['2.1.1', '2.1.2', '2.1.27', '2.23.136', '2.7.2', '3.19.11', '3.2.6', '3.2.8']
- literals gone since the old dump: ['3.19.0']
- literals not in the old dump (13; Il2CppDumper omits unreferenced ones, so most of these are not new): ['3.19.11', 'Cannot get the real proxy from an object that is not a transparent proxy.', 'Cannot process request because the process has exited.', 'EN: SlotItemContentViewType にあわせた Prefab を指定してください: {0}', 'It is not possible marshal a proxy of a remote object.', 'Output length too large', 'Paddings not used for stream ciphers', 'Part count must not exceed byte.MaxValue=', 'Part index must not be negative', 'SOCKS proxy: No acceptable method', 'SceneType', 'Scheduled Item type is not supported by this scheduler', "This isn't a 64bits machine."]

## Master data: `4ea7254^` -> `HEAD`

### New kiokus
- **Metallicized Projectile** (10020801) 5* Flame Attacker, release 2026-09-27T21:00:00+09:00
- **Aqua Tempest** (11540101) 5* Aqua Buffer, release 2026-10-04T22:00:00+09:00
### Balance changes
- none (no existing skill/passive row changed)
### New effect types
- `LOCK_SPECIAL_ATTACK` "Magic Seal": engine **yes**, used by 0 new rows
### Effect types used by new skill/passive rows (engine coverage)
- 75 types; not plainly covered: `UNIQUE_BUFF` (prefix/template?), `DWN_CTR_RATIO` (prefix/template?)
### New conditions: 153 rows, 51 with a compareContent never seen before
- content 212 BREAK_COUNT_IN_GROUP (engine: yes, new content): conds 2208, 2209, 2210, 2211 ... (50 rows), e.g. "敵軍のブレイク回数合計が1回"
- content 403 ACTOR_DAMAGE_RANGE (engine: yes, new content): conds 2260, e.g. "全体攻撃を発動したとき"
### New stages
- group 71100 Birdcage Witch_Chaos: 1 stages (113401) e.g. Birdcage_4-BOSS_C
- group 71800 Uwasa of the Commoner's Horse_Chaos: 1 stages (116401) e.g. Horse_2-BOSS_C
- group 71200 Stage Witch_Chaos: 1 stages (117401) e.g. Stage_3-BOSS_C
- group 66300 Sorana Nagiboshi's Memory - Earth: 45 stages (133101, 133102, 133103, 133104, 133105, 133106...) e.g. Sorana_Chapter_1_1-2_N, Sorana_Chapter_1_1-4_N, Sorana_Chapter_1_1-5_N, Sorana_Chapter_1_1-7_N
- group 1103 [Redux] Eternal Summer Days Part II_Score Attack: 51 stages (982301, 982302, 982303, 982304, 982305, 982306...) e.g. Score Attack Rank 1, Score Attack Rank 2, Score Attack Rank 3, Score Attack Rank 4
- group 1107 My Friend: 15 stages (982501, 982502, 982503, 982504, 982505, 982506...) e.g. My Friend Battle 1, My Friend Battle 2, My Friend Battle 3, My Friend Battle 4
- group 1105 Anything for Who I Care About!: 15 stages (982701, 982702, 982703, 982704, 982705, 982706...) e.g. Anything for Who I Care About! Battle 1, Anything for Who I Care About! Battle 2, Anything for Who I Care About! Battle 3, Anything for Who I Care About! Battle 4
- group 2010 Link Raid: Darkness Witch: 20 stages (1210101, 1210102, 1210103, 1210104, 1210105, 1210106...) e.g. Darkness Witch Lvl. 1, Darkness Witch Lvl. 2, Darkness Witch Lvl. 3, Darkness Witch Lvl. 4
- group 4003 Chapter 1 Part II: 1 stages (1309101) e.g. Exedra Quest 1-5
- group 3007 Season 7: Rose Garden Witch: 6 stages (1407101, 1407102, 1407103, 1407104, 1407105, 1407106) e.g. Rose Garden Witch (Easy), Rose Garden Witch (Normal), Rose Garden Witch (Hard), Rose Garden Witch (Very Hard)
### New enemies
- Rose Garden Witch (Apex Form) (600021)
- Rose Garden Witch (Apex Overdrive Form) (600022)
- ??? Witch Minion (664004)
- ??? Witch Minion (664005)
- ??? Witch Minion (664006)
- ??? Witch Minion (664007)
- ??? Witch Minion (664008)
- ??? Witch Minion (664009)
### New Solo Raid
- {"soloRaidMstId": 7, "startTime": "2026-10-01T12:00:00+09:00", "battleEndTime": "2026-10-08T23:59:59+09:00", "endTime": "2026-10-13T04:59:59+09:00", "stages": [{"stage": 1407101, "name": "Rose Garden Witch (Easy)", "difficulty": 1, "rounds": 5}, {"stage": 1407102, "name": "Rose Garden Witch (Normal)", "difficulty": 2, "rounds": 5}, {"stage": 1407103, "name": "Rose Garden Witch (Hard)", "difficulty": 3, "rounds": 4}, {"stage": 1407104, "name": "Rose Garden Witch (Very Hard)", "difficulty": 4, "rounds": 4}, {"stage": 1407105, "name": "Rose Garden Witch (Extra)", "difficulty": 5, "rounds": 3}, {"
### New Score Attack
- {"scoreAttackMstId": 28, "name": "Box Witch", "startTime": "2026-09-27T21:00:00+09:00", "endTime": "2026-11-05T11:59:59+09:00", "comment": "The boss has 3 actions, but is reduced to 2 actions when applying an ailment to it.\nAlso, DMG dealt increases while in break, stacking up to 3 times based on the number of ailments applied.\nTry to keep multiple ailments on the boss consistently while timing your attacks for maximum damage."}
### New Multi Raid
- {"multiRaidMstId": 30, "startTime": "2026-10-08T12:00:00+09:00", "endTime": "2026-10-22T11:59:59+09:00", "seasonId": 10}
### New Story events
- {"storyEventMstId": 76, "title": null, "name": "Madoka's Birthday 2026: A Special Group Snapshot", "startTime": null, "endTime": null}
- {"storyEventMstId": 77, "title": null, "name": "Box Witch Score Attack", "startTime": null, "endTime": null}
- {"storyEventMstId": 80, "title": null, "name": "My Friend", "startTime": null, "endTime": null}
- {"storyEventMstId": 82, "title": null, "name": "Anything for Who I Care About!", "startTime": null, "endTime": null}
### New crys / portraits
- Body Heat, Eyes Meet (4100034) 4*: Increases MP recovery rate by 5%.
- The Sea Can't Have You (4100035) 4*: Increases critical rate by 5%.
- My Friend (4200098) 5*: Increases flame DMG dealt by 12.5%. Equipped to Attacker: Also increases critical DMG by 8.5%.
- Walpurgisnacht Rising KV Part 1 Homura (4200099) 5*: Increases battle skill DMG dealt by 12.5%. Increases follow-up attack and counterattack DMG dealt by 12.5%.
- Magia Day 2026 Celebration (4200100) 5*: Increases ATK by 7.5%. Increases SPD by 10%.
- Ribbons of Devotion (4200101) 5*: Increases DEF by 7.5%.
- Our Future (4200102) 5*: Increases max HP by 7.5%. Equipped to Buffer: Also increases SPD by 10%.
- Moon Gazing at Blue Hour (4300060) 4*: Increases ATK by 10%. Equipped to Sorana Nagiboshi: Also increases MP recovery rate by 5%.
- Noontide in a Sunken City (5100054) 5*: On aqua attack, increases DMG dealt by 20%.
- Orbit of SORA (5100055) 5*: Increases SPD by 20%.
- Ichthyian Witch (5400033) 5*: Increases ATK by 15%.
### New EX crys (selection abilities)
- What Does the Future Have in Store for Me Now?! for Aqua Tempest: On basic attack, advances action order by 10% and grants 5 MP.
- To See Her Again for Metallicized Projectile: Increases SPD by 10% and ATK by 10%.  While Ember Feather is applied: On special attack, increases own DMG dealt when targeting elemental weakness by 20%.
### New unique state patterns
- 30 Ember Feather
- 32 Orchestration
- 10004 Flame Field
### New banners
- banner_00383; banner_00383; banner_00383; banner_00399; banner_00388; banner_00389; banner_00386; banner_00387; banner_00364; banner_00391; banner_00392; banner_00382; banner_00397; banner_00398; banner_00396; banner_00390; banner_00393; banner_00394; banner_00395; banner_00400; banner_00401
### Per-file counts (+added -removed ~changed)
- getAbilityEffectTypeMstList.json: +1 -0 ~0
- getAdvMstList.json: +45 -0 ~249 fields {'releaseTime': 249}
- getAdvTitleMstList.json: +7 -0 ~0
- getAlternativeStoryMstList.json: +0 -0 ~1 fields {'description': 1, 'startTime': 1, 'title': 1}
- getAlternativeStoryPointGroupMstList.json: +2 -0 ~0
- getAlternativeStoryPointMstList.json: +5 -0 ~21 fields {'alternativeStoryPointGroupMstId': 21}
- getBannerMstList.json: +21 -0 ~0
- getBattleConditionMstList.json: +153 -0 ~0
- getBattleConditionSetMstList.json: +261 -0 ~0
- getBingoMissionMstList.json: +3 -1 ~0
- getBossDirectionMstList.json: +4 -0 ~0
- getBreakMstList.json: +81 -0 ~0
- getCalculationPointPolicyMstList.json: +1 -0 ~0
- getCameraPoseMstList.json: +26 -0 ~0
- getCardLimitBreakMstList.json: +66 -0 ~0
- getCardMstList.json: +11 -0 ~0
- getCharacterHeartMstList.json: +1 -0 ~0
- getCharacterHeartObjectRewardMstList.json: +36 -0 ~0
- getCharacterMstList.json: +1 -0 ~65 fields {'canSelectProfileFavorite': 65}
- getCharacterProfileMstList.json: +1 -0 ~0
- getCharacterStoryAlertViewMstList.json: +1 -0 ~0
- getCollaborationCopyrightMstList.json: +3 -0 ~0
- getCollectionConditionGroupMstList.json: +15 -0 ~0
- getCollectionConditionMstList.json: +37 -0 ~0
- getCollectionIllustMstList.json: +1 -0 ~0
- getCollectionIllustPieceMstList.json: +15 -0 ~0
- getCollectionParamUpLevelMstList.json: +5 -0 ~0
- getDioramaBackgroundMstList.json: +2 -0 ~0
- getDollhouse2dBackgroundMstList.json: +10 -0 ~0
- getEnemyConditionSetsAndActionMstList.json: +194 -0 ~0
- getEnemyMstList.json: +8 -0 ~0
- getEnemyProfileMstList.json: +1 -0 ~0
- getExplorationShortcutMstList.json: +1 -0 ~0
- getFieldPointMstList.json: +57 -0 ~0
- getFieldSeriesMstList.json: +4 -0 ~2 fields {'name': 2}
- getFieldStageMstList.json: +6 -0 ~6 fields {'name': 6}
- getFieldStratumMstList.json: +9 -0 ~0
- getHomeAppealMstList.json: +43 -0 ~11 fields {'endTime': 9, 'bannerText2': 2, 'startTime': 1}
- getHomeBannerMstList.json: +7 -0 ~0
- getItemMstList.json: +29 -0 ~6 fields {'name': 3, 'rarity': 3, 'validDays': 1, 'resourceName': 1}
- getLive2DParamMstList.json: +10 -0 ~0
- getLocalizeTextMstListDefaultAndClientDefined.json: +90 -0 ~0
- getLoginBonusMstList.json: +3 -0 ~0
- getLoginBonusRewardMstList.json: +85 -0 ~0
- getMiniTutorialMstList.json: +0 -0 ~1 fields {'resourceName': 1}
- getMissionMstList.json: +345 -278 ~36 fields {'endTime': 30, 'title': 6, 'description': 2}
- getMissionTitleMstList.json: +16 -16 ~0
- getMissionTransitionConditionMstList.json: +2 -0 ~0
- getMissionTransitionMstList.json: +1 -3 ~0
- getMovieReplaceMstList.json: +12 -0 ~0
- getMultiRaidBattleBonusMstList.json: +5 -0 ~0
- getMultiRaidMstList.json: +1 -0 ~0
- getMultiRaidStageMstList.json: +20 -0 ~0
- getNamaeScenarioArchiveCategoryMstList.json: +1 -0 ~0
- getNamaeScenarioArchiveMstList.json: +6 -0 ~0
- getPassiveSkillDetailMstList.json: +1213 -0 ~0
- getPassiveSkillMstList.json: +170 -0 ~0
- getPassiveSkillSortMstList.json: +11 -0 ~0
- getQuestCampaignMstList.json: +3 -0 ~0
- getQuestConditionMstList.json: +3 -0 ~0
- getQuestEnemyAppearanceMstList.json: +495 -0 ~0
- getQuestEnemyModeChangeMstList.json: +18 -0 ~0
- getQuestEnemySkillSetMstList.json: +199 -0 ~0
- getQuestEnemyWaveMstList.json: +12 -0 ~0
- getQuestGroupMstList.json: +11 -0 ~2 fields {'name': 2}
- getQuestGuestMemberMstList.json: +1 -0 ~0
- getQuestMapMstList.json: +1 -0 ~14 fields {'shortName': 14}
- getQuestMissionMstList.json: +9 -0 ~0
- getQuestRewardMstList.json: +32 -0 ~0
- getQuestStageMstList.json: +156 -0 ~0
- getScoreAttackHighScoreRewardMstList.json: +123 -0 ~0
- getScoreAttackMstList.json: +1 -0 ~1 fields {'name': 1}
- getScoreAttackStageMstList.json: +51 -0 ~1202 fields {'isEx': 1202, 'fixedDifficultyScore': 1202}
- getScoreAttackTotalScoreRewardMstList.json: +150 -0 ~0
- getSelectionAbilityMstList.json: +2 -0 ~0
- getShopMstList.json: +155 -0 ~0
- getShopSeriesMstList.json: +10 -0 ~0
- getSkillDetailMstList.json: +618 -0 ~0
- getSkillMstList.json: +233 -0 ~0
- getSoloRaidMstList.json: +1 -0 ~0
- getSoloRaidPartyBuffMstList.json: +3 -0 ~0
- getSoloRaidRankingRewardMstList.json: +146 -0 ~0
- getSoloRaidSeasonBuffMstList.json: +1 -0 ~0
- getSoloRaidStageMstList.json: +6 -0 ~0
- getSoloRaidTotalScoreRewardMstList.json: +98 -0 ~0
- getSoundMstList.json: +15 -0 ~0
- getStoryEventBonusRateMstList.json: +11 -0 ~0
- getStoryEventMstList.json: +4 -0 ~76 fields {'explorationShortcutMstId': 76}
- getStoryEventQuestStageMstList.json: +30 -0 ~0
- getStoryEventScenarioMstList.json: +13 -0 ~0
- getStoryEventScenarioRewardMstList.json: +13 -0 ~0
- getStreamableBgmMstList.json: +3 -0 ~0
- getStyle3dCharacterGroupMstList.json: +2 -0 ~0
- getStyle3dCharacterMstList.json: +2 -0 ~0
- getStyleFigureMstList.json: +2 -0 ~0
- getStyleLevelUpMstList.json: +12 -0 ~0
- getStyleLimitBreakEffectMstList.json: +6 -0 ~0
- getStyleLimitBreakMstList.json: +10 -0 ~0
- getStyleLive2dCostumeGroupMstList.json: +4 -0 ~0
- getStyleLive2dCostumeMstList.json: +4 -0 ~0
- getStyleMstList.json: +2 -0 ~0
- getStyleOverrideProfileMstList.json: +1 -0 ~0
- getStyleParamUpMstList.json: +280 -0 ~0
- getSubscriptionMissionRewardMstList.json: +30 -0 ~0
- getUniqueStatePatternMstList.json: +3 -0 ~0
- getUserTitleMstList.json: +10 -0 ~3 fields {'title': 3}
- files only in new: ['getAlternativeStoryPointGroupMstList.json', 'getExplorationShortcutMstList.json']; only in old: []

