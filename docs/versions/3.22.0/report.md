# Version diff 3.21.0 -> 3.22.0 (generated 2026-10-29T21:57:51)

## Client binaries (Senbei output)

- `GameAssembly.unpack.dll`: 139264000 -> 139313152 bytes, **CODE CHANGED**; PE timestamp 2026-10-08T02:41:05Z -> 2026-10-22T11:15:42Z
  - section `.text`: changed, 1838 pages, None bytes
  - section `il2cpp`: changed, 21875 pages, None bytes
  - section `.rdata`: changed, 5847 pages, None bytes
  - section `.data`: changed, 1701 pages, None bytes
  - section `.pdata`: changed, 1223 pages, None bytes
  - section `_RDATA`: changed, 756 pages, 2509699 bytes
  - section `.reloc`: changed, 1 pages, 1391 bytes
- `MadokaExedra.unpack.exe`: 1044480 -> 1044480 bytes, **code identical** (only data/resource/debug sections differ); PE timestamp 2025-09-26T11:16:27Z -> 2025-09-26T11:16:27Z
  - section `_RDATA`: changed, 86 pages, 258746 bytes
  - section `.rsrc`: changed, 110 pages, 337678 bytes
  - section `.reloc`: changed, 1 pages, 2492 bytes
- `baselib.unpack.dll`: 610304 -> 610304 bytes, **code identical** (only data/resource/debug sections differ); PE timestamp 2025-09-26T11:16:23Z -> 2025-09-26T11:16:23Z
  - section `_RDATA`: changed, 33 pages, 102595 bytes
  - section `.reloc`: changed, 1 pages, 3840 bytes

## global-metadata.dat
- v31, 33469 string literals; version literals ['2.1.1', '2.1.2', '2.23.136', '3.2.6', '3.2.8', '3.22.0']
- vs 3.21.0's global-metadata.dat: changed sections ['stringLiteral', 'stringLiteralData', 'string', 'events', 'properties', 'methods', 'parameterDefaultValues', 'fieldDefaultValues', 'fieldAndParameterDefaultValueData', 'fieldMarshaledSizes', 'parameters', 'fields', 'genericParameters', 'genericParameterConstraints', 'genericContainers', 'nestedTypes', 'interfaces', 'vtableMethods', 'interfaceOffsets', 'typeDefinitions', 'images', 'assemblies', 'fieldRefs', 'attributeData', 'attributeDataRange', 'unresolvedIndirectCallParameterTypes', 'unresolvedIndirectCallParameterRanges', 'exportedTypeDefinitions']
- literals gone since the old dump: ['3.21.0', 'CharacterHeartPartyDataIdKey', "The method '{0}.{1}' is not a property accessor", 'error: No mission is found. missionTitleMstId: {0}', 'error: invalid category. missionCategory: {0}', 'propertyAccessor', '挑戦回数は返還されず、ハイスコアを更新することができません。']
- literals not in the old dump (26; Il2CppDumper omits unreferenced ones, so most of these are not new): [', Args = ', ', IsOpenConditionMessage = ', ', SystemMessage = ', '3.22.0', 'GetLastUsePartySoloBattle() を使用してください。', 'MissionTitleMstが見つかりません。cellKeyId: {0}', 'PrimaryKeyValue', 'QuestCategoryMstId', 'Resourcesにprefabが見つかりません : ', 'SceneName = ', 'SceneTransitionResult', 'TargetId', 'ViewPartyLendStyleList', 'ViewPartyLendStyleTop', 'ViewPartyPortraitList', 'ViewPartyStyleList', 'ViewPartySubStyleInfo', 'ViewPartySubStyleList', 'ViewSoloRaidPartyBuff', 'appealPriority', 'isGpgReward', 'isMainPickUp', 'isRewardGuideTarget', 'targetKind', 'target{0}', '※バトルは敗北となり、ハイスコアを更新することができません。']

## Master data: `0a3d40e8^` -> `HEAD`

### Balance changes
- none (no existing skill/passive row changed)
### Effect types used by new skill/passive rows (engine coverage)
- 0 types; not plainly covered: none
### Per-file counts (+added -removed ~changed)
- getHomeAppealMstList.json: +0 -0 ~2 fields {'endTime': 1, 'startTime': 1, 'bannerText3': 1}
- getLoginBonusMstList.json: +0 -0 ~1 fields {'endTime': 1}
- getMissionMstList.json: +0 -0 ~1346 fields {'isRewardGuideTarget': 1346, 'endTime': 203}
- getMissionTitleMstList.json: +0 -0 ~46 fields {'isRewardGuideTarget': 46}
- getQuestGroupMstList.json: +0 -0 ~1 fields {'endTime': 1}
- getStoryEventMstList.json: +0 -0 ~83 fields {'appealPriority': 83}

