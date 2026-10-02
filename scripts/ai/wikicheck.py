#!/usr/bin/env python3
"""wikicheck - does the ma-ex-data wiki generator decode every condition and effect value of the current data?

Checks ../ma-ex-data/wiki/condition_parser.py (get_parsed_condition) and wiki_helpers.py (_formatValue) against
every row in ../ma-ex-data/gamedata/manifests/en-Latn (the newest downloaded data). Needs Python 3.12 (the wiki code
uses nested f-string quotes); in the Cowork VM: `pip install uv && ~/.local/bin/uv python install 3.12` once, then

    cd $HOME/mnt/ma-ex-data && ~/.local/bin/python3.12 $HOME/mnt/exedra-dmg-calc/scripts/ai/wikicheck.py

Reports, worst first:
  COND MISSING   a compareContent the parser has no name for (-> "__MISSING COND__" on the wiki)
  COND ERROR     the parser raised (bad value shape)
  COND RAW       the parser fell through to "Content op v1,v2" with a csv value (unformatted)
  VALUE ERROR    _formatValue raised: an effect type / value slot with no rule (generator logs an error)
  VALUE UNKNOWN  slot shown as "ValueN" (known unknowns)
  VALUE UNITS    the description text suggests the other unit (per-mille % vs raw) for a slot, >= 60% of rows
Fix them in condition_parser.py (COMPARE_CONTENT_NAMES + the match) and wiki_helpers._formatValue, using the engine's
knowledge (exedra-dmg-calc docs/ai/MECHANICS.md, `xq enum CompareContent`, `xq effect <TYPE>`).
"""
import collections, json, logging, os, re, sys

sys.path.insert(0, os.getcwd())
if not os.path.isdir("wiki") or not os.path.isdir("gamedata"):
    sys.exit("run from the ma-ex-data root")
logging.disable(logging.CRITICAL)
from wiki import condition_parser as cp, wiki_helpers as wh  # noqa: E402

SRC = "gamedata/manifests/en-Latn"
L = lambda f: json.load(open(f"{SRC}/{f}.json", encoding="utf-8"))["payload"]["mstList"]
out = []

# conditions
by = collections.defaultdict(list)
for cid, c in cp.battle_conditions.items():
    content = c["compareContent"]
    if content not in cp.COMPARE_CONTENT_NAMES:
        by[("COND MISSING", content)].append(cid); continue
    try:
        txt = cp.get_parsed_condition(cid)
    except Exception as e:  # noqa: BLE001
        by[("COND ERROR", content)].append((cid, str(e))); continue
    if txt == "__MISSING COND__":
        by[("COND MISSING", content)].append(cid)
    elif "," in str(c["compareValue"]) and str(c["compareValue"]) in txt:
        by[("COND RAW", content)].append((cid, txt))
for (kind, content), rows in sorted(by.items()):
    ex = cp.battle_conditions[rows[0][0] if isinstance(rows[0], tuple) else rows[0]]
    out.append(f"{kind:13} content {content}: {len(rows)} rows, e.g. {rows[0]} value '{ex['compareValue']}' \"{ex.get('description', '')}\"")

# effect values
sk = {s["skillMstId"]: s for s in L("getSkillMstList")}
ps = {s["passiveSkillMstId"]: s for s in L("getPassiveSkillMstList")}
nums = lambda t: set(re.findall(r"\d+(?:\.\d+)?", re.sub(r"<[^>]+>", " ", t or "")))
stat = collections.defaultdict(lambda: {"n": 0, "pct": 0, "raw": 0, "fmt": None, "ex": None})
for f, pk, par in (("getSkillDetailMstList", "skillMstId", sk), ("getPassiveSkillDetailMstList", "passiveSkillMstId", ps)):
    for d in L(f):
        desc = (d.get("description") or "") + " " + (par.get(d[pk]) or {}).get("description", "")
        ns = nums(desc)
        for i in range(1, 6):
            v = d.get(f"value{i}")
            if not v:
                continue
            s = stat[(d["abilityEffectType"], i)]
            s["n"] += 1
            if s["ex"] is None:
                s["ex"] = (d.get("skillDetailMstId") or d.get("passiveSkillDetailMstId"), v, re.sub(r"<[^>]+>", " ", desc)[:100])
            if isinstance(v, int) and ns:
                s["pct"] += f"{v / 10:g}" in ns
                s["raw"] += str(v) in ns
            if s["fmt"] is None:
                try:
                    key, fmt = wh._formatValue(d["abilityEffectType"], i)
                    s["fmt"] = "unknown" if key.startswith("Value") else ("pct" if fmt is True else "raw" if fmt is False else "custom")
                except ValueError:
                    s["fmt"] = "error"
for (t, i), s in sorted(stat.items()):
    if s["fmt"] == "error":
        out.append(f"VALUE ERROR   {t} value{i}: {s['n']} rows, e.g. {s['ex']}")
for (t, i), s in sorted(stat.items()):
    if s["fmt"] == "unknown":
        out.append(f"VALUE UNKNOWN {t} value{i}: {s['n']} rows, e.g. {s['ex']}")
for (t, i), s in sorted(stat.items()):
    if s["fmt"] in ("pct", "raw") and s["n"] >= 3:
        other = "raw" if s["fmt"] == "pct" else "pct"
        if s[other] >= 0.6 * s["n"] and s[other] > s[s["fmt"]]:
            out.append(f"VALUE UNITS   {t} value{i}: shown as {s['fmt']}, description matches {other} in {s[other]}/{s['n']} rows, e.g. {s['ex']}")
print("\n".join(out) if out else "OK: every condition and effect value has a rule")
print(f"({len(cp.battle_conditions)} conditions, {sum(s['n'] for s in stat.values())} effect values checked)")
