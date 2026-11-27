# Version diff 3.24.0 -> 3.25.0 (generated 2026-11-27T15:18:35)

## Client binaries (Senbei output)

- `GameAssembly.unpack.dll`: 139751424 -> 140279808 bytes, **CODE CHANGED**; PE timestamp 2026-11-06T05:22:10Z -> 2026-11-20T03:39:15Z
  - section `.text`: changed, 1845 pages, None bytes
  - section `il2cpp`: changed, 21953 pages, None bytes
  - section `.rdata`: changed, 5889 pages, None bytes
  - section `.data`: changed, 1710 pages, None bytes
  - section `.pdata`: changed, 1228 pages, None bytes
  - section `_RDATA`: changed, 764 pages, None bytes
  - section `.reloc`: changed, 1 pages, 3679 bytes
- `MadokaExedra.unpack.exe`: 1044480 -> 1044480 bytes, **code identical** (only data/resource/debug sections differ); PE timestamp 2025-09-26T11:16:27Z -> 2025-09-26T11:16:27Z
  - section `.rsrc`: changed, 59 pages, 189581 bytes
  - section `.reloc`: changed, 1 pages, 2325 bytes
- `baselib.unpack.dll`: 610304 -> 419760 bytes, **CODE CHANGED**; PE timestamp 2025-09-26T11:16:23Z -> 2025-09-26T11:16:23Z
  - section `.rdata`: changed, 3 pages, 271 bytes
  - section `.data`: changed, 1 pages, None bytes
  - section `.pdata`: changed, 1 pages, None bytes
  - section `_RDATA`: changed, 1 pages, None bytes
  - section `.reloc`: changed, 1 pages, None bytes

## global-metadata.dat
- v31, 33711 string literals; version literals ['2.1.1', '2.1.2', '2.23.136', '3.2.6', '3.2.8', '3.25.0']
- vs 3.24.0's global-metadata.dat: changed sections ['stringLiteral', 'stringLiteralData', 'string', 'events', 'properties', 'methods', 'parameterDefaultValues', 'fieldDefaultValues', 'fieldAndParameterDefaultValueData', 'fieldMarshaledSizes', 'parameters', 'fields', 'genericParameters', 'genericParameterConstraints', 'genericContainers', 'nestedTypes', 'interfaces', 'vtableMethods', 'interfaceOffsets', 'typeDefinitions', 'images', 'assemblies', 'fieldRefs', 'referencedAssemblies', 'attributeData', 'attributeDataRange', 'unresolvedIndirectCallParameterTypes', 'unresolvedIndirectCallParameterRanges', 'exportedTypeDefinitions']
- literals gone since the old dump: ["'{0}' is not a member of type '{1}'", '/api/shop/buy', '3.24.0', 'Argument {0} is not valid', 'Cannot enumerate a query created from a null IEnumerable<>', 'CardMstId', 'CharacterData', 'CharacterMstId', 'CharacterTeamMstId1', 'CharacterTeamMstId2', 'DioramaBackgroundMstId', 'ElementTypeInt', 'EnemyUniqueId', 'EnumerableRewriter.VisitBlock', 'IsGet', 'MstId', 'ObjectId2', 'ObjectId3', 'RoleTypeInt', 'SeriesId', 'SoundMstId', 'StyleMstId', "There is no method '{0}' on type '{1}'", "There is no method '{0}' on type '{1}' that matches the specified arguments", 'WorkSeriesId', 'del', 'propertyOrFieldName', '{{ Info = {0}, GenType = {1} }}', '叛逆の物語', '魔獣編']
- literals not in the old dump (103; Il2CppDumper omits unreferenced ones, so most of these are not new): [' Closed before setup completed. LastStep=[', ' Migration is NULL. ', ' Migration succeeded but ResultObject is NULL. ', ' Setup failed at [', ' Setup not completed within timeout. LastStep=[', ' TransferID failed at [', ', Exception=', '/api/scratch/complete', '/api/scratch/get_top', '2D背景', '2D衣装', '3.25.0', '3D背景', 'Acc', 'Arm', 'Body', 'Bottom', 'Cage', 'CompleteLoop', 'Foot', 'Hair', 'IsDataLink={0}, IsSteam={1}, Language={2}, IsJapanese={3}', 'Leg', 'MagicCircle', 'Migration count={0}', 'Migration has error. Code={0}', 'Possible', 'Props', 'Reach', 'ReachLoop', 'Scratch', 'ScreenAspectBand', 'ScreenAspectCameraRect', 'Series', 'Setup completed.', 'Setup completed. (migration error path)', 'Setup start. ', 'Sofa', 'Spangle', 'Tail']

## Master data: `HEAD` -> `HEAD`

### Balance changes
- none (no existing skill/passive row changed)
### Effect types used by new skill/passive rows (engine coverage)
- 0 types; not plainly covered: none
### Per-file counts (+added -removed ~changed)

