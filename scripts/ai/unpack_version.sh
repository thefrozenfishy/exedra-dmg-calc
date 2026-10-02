#!/usr/bin/env bash
# Unpack the installed Steam client into E:\unpackedExedra\<version> (replaces the manual Senbei run + move).
# Cowork VM: bash scripts/ai/unpack_version.sh   (needs the Steam folder connected: $HOME/mnt/MadokaExedra)
#
# - version = the "x.y.z" string in MadokaExedra_Data/globalgamemanagers (Unity bundleVersion; 3.19.1 confirmed)
# - Senbei: E:\unpackedExedra\tools\senbei-linux, a Linux build of E:\Senbei-1.0.1 (cargo build --release in the
#   cloud container, glibc <= 2.34; output byte-identical to the Windows senbei.exe). It is run per file, ~6 s total.
# - also copies global-metadata.dat into the version folder, so the next version can diff metadata directly.
# Prints NEW <ver>, SAME <ver> (folder already holds identical files) or exits 1 on a problem.
set -euo pipefail
STEAM=${STEAM:-$HOME/mnt/MadokaExedra}
UNP=${UNP:-$HOME/mnt/unpackedExedra}
[ -d "$STEAM/MadokaExedra_Data" ] || { echo "Steam folder not connected: $STEAM (E:\\SteamLibrary\\steamapps\\common\\MadokaExedra)"; exit 1; }
VER=$(python3 -c "import re,sys; d=open(sys.argv[1],'rb').read(); m=[x.decode() for x in re.findall(rb'(?<![0-9.])([0-9]{1,2}\.[0-9]{1,3}\.[0-9]{1,3})(?![0-9.])', d) if not x.startswith(b'20')]; print(m[0] if m else '')" "$STEAM/MadokaExedra_Data/globalgamemanagers")
[ -n "$VER" ] || { echo "could not read the version from globalgamemanagers"; exit 1; }
BIN=$HOME/senbei-linux
cp "$UNP/tools/senbei-linux" "$BIN" && chmod +x "$BIN"
TMP=$(mktemp -d)
LOG="$TMP/senbei-$(date +%Y%m%d-%H%M%S).log"
for f in GameAssembly.dll baselib.dll MadokaExedra.exe; do
  "$BIN" "$STEAM/$f" --out "$TMP" --no-log --no-pause -q >> "$LOG" 2>&1
done
ls "$TMP"/GameAssembly.unpack.dll "$TMP"/baselib.unpack.dll "$TMP"/MadokaExedra.unpack.exe > /dev/null
DEST="$UNP/$VER"
if [ -f "$DEST/GameAssembly.unpack.dll" ] && cmp -s "$TMP/GameAssembly.unpack.dll" "$DEST/GameAssembly.unpack.dll"; then
  [ -f "$DEST/global-metadata.dat" ] || cp "$STEAM/MadokaExedra_Data/il2cpp_data/Metadata/global-metadata.dat" "$DEST/"
  echo "SAME $VER"; exit 0
fi
if [ -f "$DEST/GameAssembly.unpack.dll" ]; then
  echo "WARNING: $DEST exists with a different GameAssembly (hotfix without a version bump?) - writing to $DEST-b"; DEST="$DEST-b"
fi
mkdir -p "$DEST"
cp "$TMP"/*.unpack.* "$DEST/"
cp "$STEAM/MadokaExedra_Data/il2cpp_data/Metadata/global-metadata.dat" "$DEST/"
{ echo "Senbei 1.0.1 (senbei-linux, scripts/ai/unpack_version.sh)"; echo "input $STEAM"; echo "steam GameAssembly.dll mtime $(date -u -r "$STEAM/GameAssembly.dll" +%FT%TZ)"; cat "$LOG"; } > "$DEST/$(basename "$LOG")"
echo "NEW $(basename "$DEST")"
