#!/usr/bin/env python3
"""verdiff - what changed between two game versions (client binaries, il2cpp metadata, master data).

Run from the repo root (in the Cowork VM: cd $HOME/mnt/exedra-dmg-calc). Full procedure: docs/ai/VERSION_UPDATE.md.

  bin   <oldVerDir> <newVerDir>                  Senbei outputs (E:\\unpackedExedra\\<ver>): per-PE-section byte diff.
                                                 Verdict "CODE IDENTICAL" when .text / il2cpp / .data / .pdata match.
  meta  <global-metadata.dat> [--old-literals <stringliteral.json>]
                                                 parse metadata v29-31: string literals vs the old Il2CppDumper output,
                                                 the game-version literal, section sizes.
  funcs <oldDll> <newDll> <oldScriptJson> <newScriptJson> [--prefix ReDriveBattleCore] [--all]
                                                 per-method diff by name (needs Il2CppDumper's script.json for BOTH
                                                 versions). rel32 operands that only moved are ignored (heuristic).
  mst   <old> <new> [--md out.md] [--json out.json]
                                                 master data diff. <old>/<new> = a git ref of this repo (e.g. 4ea7254^,
                                                 HEAD) or a folder with get*MstList.json. Battle-relevant summary first
                                                 (new kiokus, crys, effect types + engine coverage, changed kit rows,
                                                 conditions, stages, raids), then per-file counts.
  report --old-ver 3.19.0 --new-ver 3.19.1 --mst-old <ref> --mst-new <ref> [--metadata <path>] --out <dir>
                                                 all of the above into <dir>/report.md + report.json
"""
import json, os, re, sys, struct, hashlib, subprocess, tempfile, collections, datetime

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", ".."))
MNT = os.path.dirname(REPO)
sys.path.insert(0, HERE)
BASE_REL = "src/assets/base_data"
CODE_SECTIONS = (".text", "il2cpp", ".data", ".pdata")


def out(*a):
    print(*a, flush=True)


# ---------------------------------------------------------------------------------------------- PE helpers
def pe_sections(d):
    pe = struct.unpack_from("<I", d, 0x3C)[0]
    n = struct.unpack_from("<H", d, pe + 6)[0]
    opt = struct.unpack_from("<H", d, pe + 20)[0]
    ts = struct.unpack_from("<I", d, pe + 8)[0]
    off = pe + 24 + opt
    secs = []
    for _ in range(n):
        name = d[off:off + 8].rstrip(b"\0").decode("latin1")
        vs, va, rs, ra = struct.unpack_from("<IIII", d, off + 8)
        secs.append({"name": name, "va": va, "vsize": vs, "raw": ra, "rsize": rs})
        off += 40
    return secs, ts


def rva_to_off(secs, rva):
    for s in secs:
        if s["va"] <= rva < s["va"] + max(s["vsize"], s["rsize"]):
            return rva - s["va"] + s["raw"]
    return None


def bin_diff(old_dir, new_dir):
    res = {}
    names = sorted(set(os.listdir(old_dir)) & set(os.listdir(new_dir)))
    for f in names:
        if not f.lower().endswith((".dll", ".exe")):
            continue
        a = open(os.path.join(old_dir, f), "rb").read()
        b = open(os.path.join(new_dir, f), "rb").read()
        r = {"old_size": len(a), "new_size": len(b), "identical": a == b, "sections": []}
        try:
            sa, ta = pe_sections(a)
            sb, tb = pe_sections(b)
            r["timestamp_old"] = datetime.datetime.utcfromtimestamp(ta).isoformat() + "Z"
            r["timestamp_new"] = datetime.datetime.utcfromtimestamp(tb).isoformat() + "Z"
            same_layout = [(s["name"], s["va"], s["rsize"]) for s in sa] == [(s["name"], s["va"], s["rsize"]) for s in sb]
            r["same_layout"] = same_layout
            for s in sa:
                t = next((x for x in sb if x["name"] == s["name"]), None)
                if not t:
                    r["sections"].append({"name": s["name"], "status": "removed"}); continue
                x = a[s["raw"]:s["raw"] + s["rsize"]]; y = b[t["raw"]:t["raw"] + t["rsize"]]
                if x == y:
                    r["sections"].append({"name": s["name"], "status": "identical", "size": len(x)}); continue
                ndiff = sum(1 for i in range(min(len(x), len(y))) if x[i] != y[i]) if len(x) == len(y) and len(x) < 40_000_000 else None
                pages = sum(1 for i in range(0, min(len(x), len(y)), 4096) if x[i:i + 4096] != y[i:i + 4096])
                r["sections"].append({"name": s["name"], "status": "changed", "size_old": len(x), "size_new": len(y),
                                      "pages_changed": pages, "bytes_changed": ndiff})
            code = [s for s in r["sections"] if s["name"] in CODE_SECTIONS]
            r["code_identical"] = bool(code) and all(s["status"] == "identical" for s in code)
        except Exception as e:  # not a PE or packed
            r["error"] = str(e)
        res[f] = r
    return res


def print_bin(res):
    for f, r in res.items():
        verdict = "IDENTICAL FILE" if r["identical"] else ("CODE IDENTICAL (only data/resource/debug sections differ)" if r.get("code_identical") else "CODE CHANGED")
        out(f"{f}: {r['old_size']} -> {r['new_size']} bytes, {verdict}")
        if "timestamp_old" in r:
            out(f"   PE timestamp {r['timestamp_old']} -> {r['timestamp_new']}")
        for s in r["sections"]:
            if s["status"] != "identical":
                out(f"   {s['name']}: {s['status']} {s.get('pages_changed', '')} pages / {s.get('bytes_changed', '?')} bytes")


# ---------------------------------------------------------------------------------------------- metadata
META_SECTIONS = ["stringLiteral", "stringLiteralData", "string", "events", "properties", "methods", "parameterDefaultValues",
                 "fieldDefaultValues", "fieldAndParameterDefaultValueData", "fieldMarshaledSizes", "parameters", "fields",
                 "genericParameters", "genericParameterConstraints", "genericContainers", "nestedTypes", "interfaces",
                 "vtableMethods", "interfaceOffsets", "typeDefinitions", "images", "assemblies", "fieldRefs",
                 "referencedAssemblies", "attributeData", "attributeDataRange", "unresolvedIndirectCallParameterTypes",
                 "unresolvedIndirectCallParameterRanges", "windowsRuntimeTypeNames", "windowsRuntimeStrings",
                 "exportedTypeDefinitions"]


def parse_metadata(path):
    d = open(path, "rb").read()
    sanity, ver = struct.unpack_from("<II", d, 0)
    if sanity != 0xFAB11BAF:
        raise SystemExit(f"{path}: not a decrypted global-metadata.dat (sanity {sanity:#x})")
    if ver < 29:
        out(f"warning: metadata v{ver}: section table assumed v29+ layout")
    secs = {}
    for i, n in enumerate(META_SECTIONS):
        o, s = struct.unpack_from("<ii", d, 8 + i * 8)
        secs[n] = (o, s)
    o, s = secs["stringLiteral"]; do, _ = secs["stringLiteralData"]
    lits = []
    for i in range(s // 8):
        ln, idx = struct.unpack_from("<Ii", d, o + i * 8)
        lits.append(d[do + idx:do + idx + ln].decode("utf8", "replace"))
    o, s = secs["string"]
    idents = d[o:o + s].split(b"\0")
    return {"version": ver, "size": len(d), "md5": hashlib.md5(d).hexdigest(),
            "sections": {n: {"size": s, "md5": hashlib.md5(d[o:o + s]).hexdigest()[:12]} for n, (o, s) in secs.items()},
            "literals": lits, "identifier_count": len(idents)}


def meta_diff(path, old_literals=None):
    m = parse_metadata(path)
    res = {"version": m["version"], "size": m["size"], "md5": m["md5"], "literal_count": len(m["literals"]),
           "identifier_count": m["identifier_count"], "sections": m["sections"]}
    res["version_literals"] = sorted({x for x in m["literals"] if re.fullmatch(r"\d+\.\d+\.\d+", x) and x.startswith(("2.", "3.", "4.", "5."))})
    if old_literals and os.path.exists(old_literals):
        old = [x["value"] for x in json.load(open(old_literals, encoding="utf8"))]
        so, sn = set(old), set(m["literals"])
        res["old_literal_count"] = len(old)
        res["literals_only_old"] = sorted(so - sn)
        # Il2CppDumper only lists literals referenced by code, so "only new" contains unreferenced literals too.
        res["literals_only_new"] = sorted(sn - so)
    return res


def print_meta(r):
    out(f"metadata v{r['version']}, {r['size']} bytes, {r['literal_count']} literals, {r['identifier_count']} identifier strings")
    out(f"   version-like literals: {', '.join(r['version_literals'])}")
    if "old_literal_count" in r:
        out(f"   vs old Il2CppDumper stringliteral.json ({r['old_literal_count']} referenced literals):")
        out(f"   only in old: {r['literals_only_old'][:30]}")
        out(f"   only in new ({len(r['literals_only_new'])}, includes literals no code references): {r['literals_only_new'][:30]}")


# ---------------------------------------------------------------------------------------------- functions
def funcs_diff(old_dll, new_dll, old_script, new_script, prefix="ReDriveBattleCore", all_=False):
    def load(dll, script):
        d = open(dll, "rb").read()
        secs, _ = pe_sections(d)
        ms = json.load(open(script, encoding="utf8"))["ScriptMethod"]
        addrs = sorted({m["Address"] for m in ms})
        nxt = {a: addrs[i + 1] if i + 1 < len(addrs) else a + 16 for i, a in enumerate(addrs)}
        fn = {}
        for m in ms:
            if not all_ and not m["Name"].startswith(prefix):
                continue
            key = m["Name"] + "|" + m["Signature"].split("(", 1)[-1]
            o = rva_to_off(secs, m["Address"])
            size = min(nxt[m["Address"]] - m["Address"], 1 << 20)
            fn[key] = (m["Address"], d[o:o + size] if o is not None else b"")
        return fn, len(d)

    a, size_a = load(old_dll, old_script)
    b, size_b = load(new_dll, new_script)
    image = max(size_a, size_b) * 2

    def relocated_only(ra, x, rb, y):
        if len(x) != len(y):
            return False
        i = 0
        while i < len(x):
            if x[i] == y[i]:
                i += 1; continue
            ok = False
            for j in range(max(0, i - 3), min(i, len(x) - 4) + 1):
                va = struct.unpack_from("<i", x, j)[0]; vb = struct.unpack_from("<i", y, j)[0]
                ta = ra + j + 4 + va; tb = rb + j + 4 + vb
                if 0 < ta < image and 0 < tb < image:
                    ok = True; i = j + 4; break
            if not ok:
                return False
        return True

    res = {"added": sorted(set(b) - set(a)), "removed": sorted(set(a) - set(b)), "changed": [], "moved_only": 0, "identical": 0}
    for k in sorted(set(a) & set(b)):
        (ra, x), (rb, y) = a[k], b[k]
        if x == y:
            res["identical"] += 1
        elif relocated_only(ra, x, rb, y):
            res["moved_only"] += 1
        else:
            res["changed"].append({"name": k.split("|")[0], "old_rva": hex(ra), "new_rva": hex(rb), "old_size": len(x), "new_size": len(y)})
    return res


# ---------------------------------------------------------------------------------------------- master data
def mst_dir(ref):
    if os.path.isdir(ref):
        return ref
    tmp = tempfile.mkdtemp(prefix=f"mst_{re.sub(r'[^A-Za-z0-9]', '_', ref)}_")
    subprocess.run(f'git -C "{REPO}" archive "{ref}" {BASE_REL} | tar -x -C "{tmp}"', shell=True, check=True)
    return os.path.join(tmp, BASE_REL)


def load_list(d, f):
    p = os.path.join(d, f)
    if not os.path.exists(p):
        return []
    x = json.load(open(p, encoding="utf8"))
    return x if isinstance(x, list) else []


def key_of(f, rows):
    stem = f[:-5]
    stem = stem[3:] if stem.startswith("get") else stem
    stem = stem.replace("MstList", "Mst").replace("ListDefaultAndClientDefined", "").replace("ListNonDefault", "")
    k = stem[0].lower() + stem[1:] + "Id"
    if rows and k in rows[0]:
        return k
    c = [x for x in rows[0] if x.endswith("MstId")] if rows else []
    return c[0] if len(c) == 1 else None


def rowkey(r, k):
    return r[k] if k else json.dumps(r, sort_keys=True, ensure_ascii=False)


def diff_file(od, nd, f):
    o, n = load_list(od, f), load_list(nd, f)
    k = key_of(f, n or o)
    om = {rowkey(r, k): r for r in o}; nm = {rowkey(r, k): r for r in n}
    added = [nm[i] for i in nm if i not in om]
    removed = [om[i] for i in om if i not in nm]
    changed = []
    for i in nm:
        if i in om and nm[i] != om[i]:
            fields = {fk: [om[i].get(fk), nm[i].get(fk)] for fk in set(om[i]) | set(nm[i]) if om[i].get(fk) != nm[i].get(fk)}
            changed.append({"key": i, "fields": fields, "row": nm[i]})
    return {"key": k, "added": added, "removed": removed, "changed": changed}


def coverage(types):
    """effect type -> engine status, via xq's TS scanner (same rules as EFFECT_TYPES.md)"""
    try:
        import xq
    except Exception:
        return {t: "?" for t in types}
    res = {}
    for t in types:
        refs = xq.ts_refs(t)
        if any(r[4] == "logic" for r in refs):
            res[t] = "yes"
        elif any(r[4] in ("template", "affix") for r in refs):
            res[t] = "prefix/template?"
        else:
            res[t] = "LISTED ONLY" if refs else "MISSING"
    return res


def compare_content_coverage():
    """CompareContent enum names in BattleConditionParser.ts -> handled? (referenced outside the enum and not only
    next to a [NOT IMPLEMENTED] comment)"""
    p = os.path.join(REPO, "src", "models", "BattleConditionParser.ts")
    if not os.path.exists(p):
        return {}
    src = open(p, encoding="utf8").read()
    enum = dict((int(v), k) for k, v in re.findall(r"^\s+([A-Z_0-9]+) = (\d+),", src, re.M))
    res = {}
    lines = src.split("\n")
    for num, name in enum.items():
        idx = [i for i, l in enumerate(lines) if f"CompareContent.{name}" in l]
        if not idx:
            res[num] = (name, "MISSING")
            continue
        notimpl = all(any("NOT IMPLEMENTED" in lines[j] for j in range(i, min(i + 5, len(lines)))) for i in idx)
        res[num] = (name, "NOT IMPLEMENTED" if notimpl else "yes")
    return res


def mst_diff(old_ref, new_ref):
    od, nd = mst_dir(old_ref), mst_dir(new_ref)
    files = sorted(f for f in set(os.listdir(nd)) | set(os.listdir(od)) if f.endswith(".json") and f not in ("kioku_data.json",))
    per = {}
    for f in files:
        if f == "get_config.json":
            continue
        try:
            dd = diff_file(od, nd, f)
        except Exception as e:
            per[f] = {"error": str(e)}; continue
        if dd["added"] or dd["removed"] or dd["changed"]:
            per[f] = dd
    N = lambda f: load_list(nd, f)
    get = lambda f: per.get(f, {"added": [], "removed": [], "changed": []})
    styles = {s["styleMstId"]: s for s in N("getStyleMstList.json")}
    passives = {p["passiveSkillMstId"]: p for p in N("getPassiveSkillMstList.json")}
    skills = {s["skillMstId"]: s for s in N("getSkillMstList.json")}
    enemies = {e["enemyMstId"]: e for e in N("getEnemyMstList.json")}
    stages = {s["questStageMstId"]: s for s in N("getQuestStageMstList.json")}
    groups = {g["questGroupMstId"]: g for g in N("getQuestGroupMstList.json")}
    S = {}
    S["new_kiokus"] = [{"id": s["styleMstId"], "name": s["name"], "rarity": s["rarity"], "element": s["element"], "role": s["role"],
                        "release": s.get("releaseTime"), "collectable": s.get("isCollectionDisp")} for s in get("getStyleMstList.json")["added"]]
    S["changed_kiokus"] = [{"id": c["key"], "name": c["row"].get("name"), "fields": c["fields"]} for c in get("getStyleMstList.json")["changed"]]
    S["new_cards"] = [{"id": c["cardMstId"], "name": c["name"], "rarity": c.get("rarity"),
                       "passives": [re.sub(r"<br>", " ", (passives.get(c.get(f"passiveSkill{i}") * 100 + 6) or passives.get(c.get(f"passiveSkill{i}")) or {}).get("description") or "")[:200]
                                    for i in (1, 2, 3) if c.get(f"passiveSkill{i}")]}
                      for c in get("getCardMstList.json")["added"]]
    S["new_effect_types"] = [{"type": r["effectType"], "name": r.get("name"), "category": r.get("category")} for r in get("getAbilityEffectTypeMstList.json")["added"]]
    # effect types used by new/changed detail rows
    used = collections.defaultdict(lambda: {"new_rows": 0, "changed_rows": 0, "examples": []})
    for f, idk in (("getSkillDetailMstList.json", "skillDetailMstId"), ("getPassiveSkillDetailMstList.json", "passiveSkillDetailMstId")):
        for r in get(f)["added"]:
            u = used[r["abilityEffectType"]]; u["new_rows"] += 1
            if len(u["examples"]) < 3: u["examples"].append(r[idk])
        for c in get(f)["changed"]:
            u = used[c["row"]["abilityEffectType"]]; u["changed_rows"] += 1
    cov = coverage(sorted(set(used) | {e["type"] for e in S["new_effect_types"]}))
    S["effect_types_in_new_rows"] = [{"type": t, **v, "engine": cov.get(t, "?")} for t, v in sorted(used.items(), key=lambda x: -x[1]["new_rows"])]
    for e in S["new_effect_types"]:
        e["engine"] = cov.get(e["type"], "?")
        e["used_by_new_rows"] = used.get(e["type"], {}).get("new_rows", 0)
    # balance changes: changed kit rows (value/condition fields)
    bal = []
    for f, idk, parent, names in (("getSkillDetailMstList.json", "skillDetailMstId", "skillMstId", skills),
                                  ("getPassiveSkillDetailMstList.json", "passiveSkillDetailMstId", "passiveSkillMstId", passives)):
        for c in get(f)["changed"]:
            pid = c["row"].get(parent)
            nm = names.get(pid, {}).get("name") or names.get(pid // 100 if pid else 0, {}).get("name")
            bal.append({"file": f, "id": c["key"], "parent": pid, "name": nm, "type": c["row"]["abilityEffectType"], "fields": c["fields"]})
    S["changed_kit_rows"] = bal
    S["changed_skills"] = [{"id": c["key"], "name": c["row"].get("name"), "fields": c["fields"]} for c in get("getSkillMstList.json")["changed"]]
    S["changed_passives"] = [{"id": c["key"], "name": c["row"].get("name"), "fields": c["fields"]} for c in get("getPassiveSkillMstList.json")["changed"]]
    # conditions
    old_contents = {r["compareContent"] for r in load_list(od, "getBattleConditionMstList.json")}
    ccov = compare_content_coverage()
    S["new_conditions"] = [{"id": r["battleConditionMstId"], "content": r["compareContent"],
                            "content_name": ccov.get(r["compareContent"], ("?", "?"))[0],
                            "engine": ccov.get(r["compareContent"], ("?", "MISSING"))[1],
                            "new_content": r["compareContent"] not in old_contents, "target": r["compareTarget"],
                            "op": r["compareOperator"], "value": r["compareValue"], "description": r.get("description")}
                           for r in get("getBattleConditionMstList.json")["added"]]
    # stages and modes
    ns = collections.defaultdict(list)
    for s in get("getQuestStageMstList.json")["added"]:
        ns[s.get("questGroupMstId")].append(s)
    S["new_stages"] = [{"group": g, "group_name": groups.get(g, {}).get("name"), "count": len(v),
                        "ids": [s["questStageMstId"] for s in v][:60], "names": [s["name"] for s in v][:8]} for g, v in ns.items()]
    S["new_enemies"] = [{"id": e["enemyMstId"], "name": e.get("name")} for e in get("getEnemyMstList.json")["added"]]
    S["new_solo_raids"] = [{**{k: r.get(k) for k in ("soloRaidMstId", "startTime", "battleEndTime", "endTime")},
                            "stages": [{"stage": s["questStageMstId"], "name": stages.get(s["questStageMstId"], {}).get("name"),
                                        "difficulty": s["difficulty"], "rounds": s.get("limitRoundCount")}
                                       for s in N("getSoloRaidStageMstList.json") if s["soloRaidMstId"] == r["soloRaidMstId"]],
                            "comment": next((s.get("comment") for s in N("getSoloRaidStageMstList.json") if s["soloRaidMstId"] == r["soloRaidMstId"]), "")}
                           for r in get("getSoloRaidMstList.json")["added"]]
    S["new_score_attacks"] = [{k: r.get(k) for k in ("scoreAttackMstId", "name", "startTime", "endTime", "comment")} for r in get("getScoreAttackMstList.json")["added"]]
    S["new_multi_raids"] = [{k: r.get(k) for k in ("multiRaidMstId", "startTime", "endTime", "seasonId")} for r in get("getMultiRaidMstList.json")["added"]]
    S["new_story_events"] = [{k: r.get(k) for k in ("storyEventMstId", "title", "name", "startTime", "endTime")} for r in get("getStoryEventMstList.json")["added"]]
    S["new_unique_states"] = [{"id": r["uniqueStatePatternMstId"], "name": r.get("name")} for r in get("getUniqueStatePatternMstList.json")["added"]]
    S["new_selection_abilities"] = [{"id": r["selectionAbilityMstId"], "name": r.get("name"), "style": styles.get(r.get("styleMstId"), {}).get("name"),
                                     "description": r.get("description")} for r in get("getSelectionAbilityMstList.json")["added"]]
    S["new_banners"] = [r.get("name") or r.get("imageName") for r in get("getBannerMstList.json")["added"]]
    S["new_items"] = [r.get("name") for r in get("getItemMstList.json")["added"]]
    counts = {f: {"added": len(v.get("added", [])), "removed": len(v.get("removed", [])), "changed": len(v.get("changed", [])),
                  "changed_fields": dict(collections.Counter(fk for c in v.get("changed", []) for fk in c["fields"]).most_common(6))}
              for f, v in per.items() if "error" not in v}
    return {"old": old_ref, "new": new_ref, "summary": S, "files": counts,
            "only_in_new": sorted(set(os.listdir(nd)) - set(os.listdir(od))), "only_in_old": sorted(set(os.listdir(od)) - set(os.listdir(nd)))}


ELEM = {0: "-", 1: "Flame", 2: "Aqua", 3: "Forest", 4: "Light", 5: "Dark", 6: "Void"}
ROLE = {1: "Attacker", 2: "Breaker", 3: "Healer", 4: "Buffer", 5: "Debuffer", 6: "Defender"}


def mst_md(r):
    S = r["summary"]; L = []
    L.append(f"## Master data: `{r['old']}` -> `{r['new']}`\n")
    if S["new_kiokus"]:
        L.append("### New kiokus")
        for k in S["new_kiokus"]:
            L.append(f"- **{k['name']}** ({k['id']}) {k['rarity']}* {ELEM.get(k['element'])} {ROLE.get(k['role'])}, release {k['release']}{'' if k['collectable'] else ' (not collectable)'}")
    if S["changed_kiokus"]:
        L.append("### Changed kiokus (StyleMst)")
        for k in S["changed_kiokus"]:
            L.append(f"- {k['name']} ({k['id']}): " + "; ".join(f"{f} {a} -> {b}" for f, (a, b) in k["fields"].items()))
    if S["changed_kit_rows"] or S["changed_skills"] or S["changed_passives"]:
        L.append("### Balance changes (changed skill / passive rows)")
        for c in S["changed_kit_rows"][:200]:
            L.append(f"- {c['name']} [{c['type']}] {c['file'].replace('get', '').replace('MstList.json', '')} {c['id']}: "
                     + "; ".join(f"{f} {a} -> {b}" for f, (a, b) in c["fields"].items()))
        for c in S["changed_skills"] + S["changed_passives"]:
            L.append(f"- {c['name']} ({c['id']}): " + "; ".join(f"{f}: {str(a)[:80]} -> {str(b)[:80]}" for f, (a, b) in c["fields"].items()))
    else:
        L.append("### Balance changes\n- none (no existing skill/passive row changed)")
    if S["new_effect_types"]:
        L.append("### New effect types")
        for e in S["new_effect_types"]:
            L.append(f"- `{e['type']}` \"{e['name']}\": engine **{e['engine']}**, used by {e['used_by_new_rows']} new rows")
    L.append("### Effect types used by new skill/passive rows (engine coverage)")
    miss = [e for e in S["effect_types_in_new_rows"] if e["engine"] != "yes"]
    L.append(f"- {len(S['effect_types_in_new_rows'])} types; not plainly covered: " + (", ".join(f"`{e['type']}` ({e['engine']})" for e in miss) or "none"))
    if S["new_conditions"]:
        newc = [c for c in S["new_conditions"] if c["new_content"]]
        gaps = [c for c in S["new_conditions"] if c["engine"] != "yes"]
        L.append(f"### New conditions: {len(S['new_conditions'])} rows, {len(newc)} with a compareContent never seen before")
        for c in newc + [g for g in gaps if g not in newc]:
            L.append(f"- cond {c['id']} content {c['content']} {c['content_name']} (engine: {c['engine']}) \"{c['description']}\"")
    if S["new_stages"]:
        L.append("### New stages")
        for g in S["new_stages"]:
            L.append(f"- group {g['group']} {g['group_name'] or ''}: {g['count']} stages ({', '.join(map(str, g['ids'][:6]))}{'...' if g['count'] > 6 else ''}) e.g. {', '.join(g['names'][:4])}")
    if S["new_enemies"]:
        L.append("### New enemies\n" + "\n".join(f"- {e['name']} ({e['id']})" for e in S["new_enemies"]))
    for key, title in (("new_solo_raids", "Solo Raid"), ("new_score_attacks", "Score Attack"), ("new_multi_raids", "Multi Raid"), ("new_story_events", "Story events")):
        if S[key]:
            L.append(f"### New {title}")
            for x in S[key]:
                L.append("- " + json.dumps(x, ensure_ascii=False)[:600])
    if S["new_cards"]:
        L.append("### New crys / portraits\n" + "\n".join(f"- {c['name']} ({c['id']}) {c['rarity']}*: {', '.join(p for p in c['passives'] if p)}" for c in S["new_cards"]))
    if S["new_selection_abilities"]:
        L.append("### New EX crys (selection abilities)\n" + "\n".join(f"- {c['name']} for {c['style']}: {re.sub('<br>', ' ', c['description'] or '')}" for c in S["new_selection_abilities"]))
    if S["new_unique_states"]:
        L.append("### New unique state patterns\n" + "\n".join(f"- {u['id']} {u['name']}" for u in S["new_unique_states"]))
    if S["new_banners"]:
        L.append("### New banners\n- " + "; ".join(str(b) for b in S["new_banners"]))
    L.append("### Per-file counts (+added -removed ~changed)")
    for f, c in r["files"].items():
        L.append(f"- {f}: +{c['added']} -{c['removed']} ~{c['changed']}" + (f" fields {c['changed_fields']}" if c["changed_fields"] else ""))
    if r["only_in_new"] or r["only_in_old"]:
        L.append(f"- files only in new: {r['only_in_new']}; only in old: {r['only_in_old']}")
    return "\n".join(L) + "\n"


# ---------------------------------------------------------------------------------------------- main
def arg(name, default=None):
    if name in sys.argv:
        i = sys.argv.index(name); v = sys.argv[i + 1]; del sys.argv[i:i + 2]; return v
    return default


def main():
    if len(sys.argv) < 2:
        out(__doc__); return
    cmd = sys.argv[1]
    if cmd == "bin":
        print_bin(bin_diff(sys.argv[2], sys.argv[3]))
    elif cmd == "meta":
        old = arg("--old-literals")
        print_meta(meta_diff(sys.argv[2], old))
    elif cmd == "funcs":
        prefix = arg("--prefix", "ReDriveBattleCore"); all_ = "--all" in sys.argv
        r = funcs_diff(*sys.argv[2:6], prefix=prefix, all_=all_)
        out(f"identical {r['identical']}, moved only {r['moved_only']}, changed {len(r['changed'])}, added {len(r['added'])}, removed {len(r['removed'])}")
        for c in r["changed"]:
            out(f"  CHANGED {c['name']} {c['old_rva']} ({c['old_size']} B) -> {c['new_rva']} ({c['new_size']} B)")
        for k in r["added"][:200]:
            out(f"  ADDED {k.split('|')[0]}")
        for k in r["removed"][:200]:
            out(f"  REMOVED {k.split('|')[0]}")
    elif cmd == "mst":
        md, js = arg("--md"), arg("--json")
        r = mst_diff(sys.argv[2], sys.argv[3])
        text = mst_md(r)
        if md:
            open(md, "w", encoding="utf8").write(text)
        if js:
            json.dump(r, open(js, "w", encoding="utf8"), ensure_ascii=False, indent=1, default=str)
        out(text)
    elif cmd == "report":
        ov, nv = arg("--old-ver"), arg("--new-ver")
        mo, mn = arg("--mst-old"), arg("--mst-new", "HEAD")
        meta = arg("--metadata"); outdir = arg("--out")
        unpacked = os.environ.get("XQ_UNPACKED") or os.path.join(MNT, "unpackedExedra")
        dumper = os.environ.get("XQ_DUMPER") or os.path.join(MNT, "Il2CppDumper")
        os.makedirs(outdir, exist_ok=True)
        rep = {"old_version": ov, "new_version": nv, "generated": datetime.datetime.now().isoformat(timespec="seconds")}
        rep["bin"] = bin_diff(os.path.join(unpacked, ov), os.path.join(unpacked, nv))
        if meta:
            old_lits = next((p for p in (os.path.join(unpacked, ov, "dump", "stringliteral.json"), os.path.join(dumper, "stringliteral.json")) if os.path.exists(p)), None)
            m = meta_diff(meta, old_lits)
            m.pop("sections", None)
            rep["meta"] = m
        if mo:
            rep["mst"] = mst_diff(mo, mn)
        json.dump(rep, open(os.path.join(outdir, "report.json"), "w", encoding="utf8"), ensure_ascii=False, indent=1, default=str)
        L = [f"# Version diff {ov} -> {nv} (generated {rep['generated']})\n", "## Client binaries (Senbei output)\n"]
        for f, r in rep["bin"].items():
            verdict = "identical file" if r["identical"] else ("**code identical** (only data/resource/debug sections differ)" if r.get("code_identical") else "**CODE CHANGED**")
            L.append(f"- `{f}`: {r['old_size']} -> {r['new_size']} bytes, {verdict}; PE timestamp {r.get('timestamp_old')} -> {r.get('timestamp_new')}")
            for s in r["sections"]:
                if s["status"] != "identical":
                    L.append(f"  - section `{s['name']}`: {s['status']}, {s.get('pages_changed')} pages, {s.get('bytes_changed')} bytes")
        if "meta" in rep:
            m = rep["meta"]
            L.append(f"\n## global-metadata.dat\n- v{m['version']}, {m['literal_count']} string literals; version literals {m['version_literals']}")
            if "literals_only_old" in m:
                L.append(f"- literals gone since the old dump: {m['literals_only_old']}")
                L.append(f"- literals not in the old dump ({len(m['literals_only_new'])}; Il2CppDumper omits unreferenced ones, so most of these are not new): {m['literals_only_new'][:40]}")
        if "mst" in rep:
            L.append("\n" + mst_md(rep["mst"]))
        open(os.path.join(outdir, "report.md"), "w", encoding="utf8").write("\n".join(L) + "\n")
        out("\n".join(L))
    else:
        out(__doc__)


if __name__ == "__main__":
    main()
