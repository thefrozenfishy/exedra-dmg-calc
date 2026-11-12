# Version diff 3.22.0 -> 3.24.0 (generated 2026-11-12T21:01:57)

## Client binaries (Senbei output)

- `GameAssembly.unpack.dll`: 139313152 -> 139751424 bytes, **CODE CHANGED**; PE timestamp 2026-10-22T11:15:42Z -> 2026-11-06T05:22:10Z
  - section `.text`: changed, 1839 pages, None bytes
  - section `il2cpp`: changed, 21881 pages, None bytes
  - section `.rdata`: changed, 5870 pages, None bytes
  - section `.data`: changed, 1706 pages, None bytes
  - section `.pdata`: changed, 1224 pages, None bytes
  - section `_RDATA`: changed, 763 pages, None bytes
  - section `.reloc`: changed, 1 pages, 3702 bytes
- `MadokaExedra.unpack.exe`: 1044480 -> 1044480 bytes, **code identical** (only data/resource/debug sections differ); PE timestamp 2025-09-26T11:16:27Z -> 2025-09-26T11:16:27Z
  - section `.rsrc`: changed, 59 pages, 186548 bytes
  - section `.reloc`: changed, 1 pages, 2324 bytes
- `baselib.unpack.dll`: 610304 -> 610304 bytes, **code identical** (only data/resource/debug sections differ); PE timestamp 2025-09-26T11:16:23Z -> 2025-09-26T11:16:23Z
  - section `_RDATA`: changed, 27 pages, 73574 bytes
  - section `.reloc`: changed, 1 pages, 2816 bytes

## global-metadata.dat
- v31, 33638 string literals; version literals ['2.1.1', '2.1.2', '2.23.136', '3.2.6', '3.2.8', '3.24.0']
- vs 3.22.0's global-metadata.dat: changed sections ['stringLiteral', 'stringLiteralData', 'string', 'events', 'properties', 'methods', 'parameterDefaultValues', 'fieldDefaultValues', 'fieldAndParameterDefaultValueData', 'fieldMarshaledSizes', 'parameters', 'fields', 'genericParameters', 'genericParameterConstraints', 'genericContainers', 'nestedTypes', 'interfaces', 'vtableMethods', 'interfaceOffsets', 'typeDefinitions', 'images', 'assemblies', 'fieldRefs', 'referencedAssemblies', 'attributeData', 'attributeDataRange', 'unresolvedIndirectCallParameterTypes', 'unresolvedIndirectCallParameterRanges', 'exportedTypeDefinitions']
- literals gone since the old dump: [' .*[/|\\\\](?<file>.+):(?<line>\\d+)', '/Keyboard/', '13.13.0', '2.7.3-f4', '3.22.0', 'Finalized {0}', 'FirebaseStorage.OnAppDisposed()', 'UNIQUE_ELEMENT_BREAK', '\\s?\\(.*\\)']
- literals not in the old dump (178; Il2CppDumper omits unreferenced ones, so most of these are not new): [' (?:[^:]*(?:[a-zA-Z]:)?[^:]*[/|\\\\]|[^:]*(?:in|at) )(?<file>[^:]+):(?<line>\\d+)', '-app', '-app-gl', '13.17.1', '2.7.4-f1', '3.24.0', 'Background Direction Target Track {0}', 'Cannot release ownership as memory is not owned', 'CgkI1tiQ6qwTEAIQ1QE', 'CgkI1tiQ6qwTEAIQ1gE', 'CgkI1tiQ6qwTEAIQaQ', 'CgkI1tiQ6qwTEAIQag', 'CgkI1tiQ6qwTEAIQaw', 'CgkI1tiQ6qwTEAIQbA', 'CgkI1tiQ6qwTEAIQbQ', 'CgkI1tiQ6qwTEAIQbg', 'CgkI1tiQ6qwTEAIQbw', 'CgkI1tiQ6qwTEAIQcA', 'CgkI1tiQ6qwTEAIQcQ', 'CgkI1tiQ6qwTEAIQcg', 'CgkI1tiQ6qwTEAIQcw', 'CgkI1tiQ6qwTEAIQdA', 'CgkI1tiQ6qwTEAIQdQ', 'CgkI1tiQ6qwTEAIQdg', 'CgkI1tiQ6qwTEAIQdw', 'CgkI1tiQ6qwTEAIQeA', 'CgkI1tiQ6qwTEAIQeQ', 'CgkI1tiQ6qwTEAIQeg', 'CgkI1tiQ6qwTEAIQew', 'CgkI1tiQ6qwTEAIQfA', 'CgkI1tiQ6qwTEAIQfQ', 'CgkI1tiQ6qwTEAIQfg', 'CgkI1tiQ6qwTEAIQfw', 'CgkI1tiQ6qwTEAIQgAE', 'CgkI1tiQ6qwTEAIQgQE', 'CgkI1tiQ6qwTEAIQggE', 'CgkI1tiQ6qwTEAIQgwE', 'CgkI1tiQ6qwTEAIQhAE', 'CgkI1tiQ6qwTEAIQhQE', 'CgkI1tiQ6qwTEAIQhgE']

## Master data: `HEAD` -> `HEAD`

### Balance changes
- none (no existing skill/passive row changed)
### Effect types used by new skill/passive rows (engine coverage)
- 0 types; not plainly covered: none
### Per-file counts (+added -removed ~changed)

