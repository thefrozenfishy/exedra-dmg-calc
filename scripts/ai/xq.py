#!/usr/bin/env python3
"""xq - quick lookups for the Exedra battle-engine work (game 3.19.0).

One command instead of 5-10 ad-hoc greps/python snippets. Run from anywhere:

    python3 scripts/ai/xq.py <command> [args]

Game data (base_data):
  kit  <kioku name part> [--lvl N] [--all-levels]  full kit of a kioku: every slot, detail rows, decoded conditions
  skill <id> [--lvl N]            active skill detail rows (id = skillMstId base id, or id*100+lvl)
  passive <id> [--lvl N]          passive detail rows (ability/asc/support: id*100+lvl; crys/enemy: exact id)
  cond <setId[,setId...]>         decode condition SET(s) (csv = OR of sets, conditions inside a set = AND)
  cond c<condId> ...              one CONDITION row (the "[cond N]" ids inside a set) + which sets use it
  stage <questStageMstId>         waves, enemies, stats, break, skill sets, AI condition rows, form changes, raid info
  enemy <questEnemyAppearanceMstId>   one enemy appearance in full
  find <text>                     search kioku names, skill/passive names, stage names, enemy names
Effect types:
  effect <TYPE>                   who uses it (kits + enemy skills + wiki), decompile class/methods, TS references
Decompile / dump.cs:
  fn <substring> [--list] [--max N] [--raw]   decompiled function(s) whose header/C# line contains substring
                                  (cleaned: no locals/null-check traps; --raw = Ghidra text; decimal code: pipe into
                                  unpackedExedra/3.19.0/tools/decsimp.py)
  cls <ClassName> [--all]         class layout from dump.cs: fields with offsets, methods with RVAs
  enum <EnumName>                 enum values from dump.cs (cached)
  rva <0xRVA>                     which function is at / contains an RVA
TS engine:
  ts <symbol|TYPE> [--all]        where the TS engine references it (file:line [function] (kind)); --all adds comments,
                                  generated tables and the old ScoreAttack calculator
  --branch <name>  (any command)  scan that branch's src instead of the checkout, e.g. xq --branch battle-engine-3.19 effect X
Maintenance:
  build                           rebuild scripts/ai/cache/* and docs/ai/EFFECT_TYPES.md

Paths: the repo's sibling folders are used (E:\\unpackedExedra, E:\\Il2CppDumper, E:\\ma-ex-data on Windows;
$HOME/mnt/<same names> in the Cowork VM). Override with XQ_UNPACKED / XQ_DUMPER / XQ_MAEX env vars.
"""
import json, os, re, sys, glob, subprocess, collections, bisect
from functools import lru_cache

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", ".."))
MNT = os.path.dirname(REPO)
BASE = os.path.join(REPO, "src", "assets", "base_data")
SRC = os.environ.get("XQ_SRC") or os.path.join(REPO, "src")   # XQ_SRC: scan another checkout's src (e.g. a git archive of a branch)
MODELS = os.path.join(SRC, "models")
CACHE = os.path.join(HERE, "cache")


def _first(*cands):
    for c in cands:
        if c and os.path.exists(c):
            return c
    return cands[-1]


UNPACKED = _first(os.environ.get("XQ_UNPACKED"), os.path.join(MNT, "unpackedExedra"))
DECOMP = os.path.join(UNPACKED, "3.19.0", "decompiled")
DUMPER = _first(os.environ.get("XQ_DUMPER"), os.path.join(MNT, "Il2CppDumper"))
DUMP_CS = os.path.join(DUMPER, "dump.cs")
MAEX = _first(os.environ.get("XQ_MAEX"), os.path.join(MNT, "ma-ex-data"))
WIKI = os.path.join(MAEX, "wiki")

TIMINGS = {0: "NONE", 1: "BATTLE_START", 2: "WAVE_START", 3: "TURN_START", 4: "ATTACK_START", 5: "ATTACK_END",
           6: "TURN_END", 7: "WAVE_END", 8: "BATTLE_END", 9: "AFTER_PROCESS", 10: "SEASON_BUFF_ACTIVE(vanguard)"}
TARGETS = {1: "Self", 2: "Actor", 3: "MainTarget", 4: "AllTargets", 5: "FriendTeam", 6: "OpponentTeam", 7: "Others", 8: "EachTarget"}
OPS = {1: "==", 2: "!=", 3: ">", 4: ">=", 5: "<", 6: "<=", 7: "contains", 8: "not-contains"}
RANGES = {-1: "self", 1: "single", 2: "splash(main+adjacent)", 3: "all", 0: "-"}
ELEM = {0: "-", 1: "Flame", 2: "Aqua", 3: "Forest", 4: "Light", 5: "Dark", 6: "Void"}
ROLE = {0: "-", 1: "Attacker", 2: "Breaker", 3: "Defender", 4: "Buffer", 5: "Debuffer", 6: "Healer"}
SKILL_TYPE = {1: "ActiveSkill", 2: "SpecialAttack", 3: "NormalAttack", 4: "AdditionalSkill", 5: "EtherBlow"}


def out(*a):
    try:
        print(*a)
    except BrokenPipeError:
        sys.exit(0)


# ----------------------------------------------------------------------------------------------- data
@lru_cache(None)
def mst(name):
    p = os.path.join(BASE, name if name.endswith(".json") else f"get{name}MstList.json")
    d = json.load(open(p, encoding="utf-8"))
    return d if isinstance(d, list) else list(d.values())


@lru_cache(None)
def kioku_data():
    return json.load(open(os.path.join(BASE, "kioku_data.json"), encoding="utf-8"))


@lru_cache(None)
def by(name, key):
    m = collections.defaultdict(list)
    for r in mst(name):
        m[r.get(key)].append(r)
    return m


def uniq(name, key):
    return {k: v[0] for k, v in by(name, key).items()}


@lru_cache(None)
def enums():
    p = os.path.join(CACHE, "enums.json")
    if os.path.exists(p):
        return json.load(open(p, encoding="utf-8"))
    return {}


def content_name(v):
    cc = enums().get("CompareContent", {})
    return cc.get(str(v), f"content{v}")


def cond_line(c):
    tgt = TARGETS.get(c["compareTarget"], c["compareTarget"])
    return (f'[cond {c["battleConditionMstId"]}] {tgt}.{content_name(c["compareContent"])}({c["compareContent"]}) '
            f'{OPS.get(c["compareOperator"], c["compareOperator"])} "{c["compareValue"]}"   # {c.get("description", "")}')


def decode_sets(csv, indent="      "):
    csv = str(csv or "").strip()
    if not csv or csv == "0":
        return []
    sets = uniq("BattleConditionSet", "battleConditionSetMstId")
    conds = uniq("BattleCondition", "battleConditionMstId")
    lines = []
    ids = [s for s in csv.split(",") if s.strip()]
    for i, sid in enumerate(ids):
        s = sets.get(int(sid))
        if not s:
            lines.append(f"{indent}set {sid}: (missing)")
            continue
        lines.append(f"{indent}{'OR ' if i else ''}set {sid} 「{s.get('description', '')}」 (AND of):")
        for cid in str(s["battleConditionMstIdCsv"]).split(","):
            if cid.strip():
                c = conds.get(int(cid))
                lines.append(f"{indent}   " + (cond_line(c) if c else f"[{cid}] (missing)"))
    return lines


def fmt_timings(csv):
    csv = str(csv or "").strip()
    if not csv or csv == "0":
        return "-"
    return "+".join(TIMINGS.get(int(t), t) for t in csv.split(",") if t.strip())


def detail_rows(table, key, want):
    """rows of getSkillDetail/getPassiveSkillDetail whose key == want"""
    return by(table, key).get(want, [])


def levels_of(table, key, base):
    return sorted(k % 100 for k in by(table, key) if isinstance(k, int) and k // 100 == base)


def print_detail(r, active):
    vals = " ".join(f"v{i}={r.get(f'value{i}')}" for i in range(1, 6) if r.get(f"value{i}") not in (None, 0))
    extra = []
    if r.get("turn"): extra.append(f"turn={r['turn']}")
    if r.get("remainCount"): extra.append(f"remain={r['remainCount']}")
    if r.get("probability", 100) != 100 or r.get("isFixedProbability"):
        extra.append(f"prob={r.get('probability')}{' FIXED' if r.get('isFixedProbability') else ''}")
    extra.append(f"range={RANGES.get(r.get('range'), r.get('range'))}")
    if r.get("element"): extra.append(f"elem={ELEM.get(r['element'], r['element'])}")
    if r.get("role"): extra.append(f"role={ROLE.get(r['role'], r['role'])}")
    if not active:
        extra.append(f"timing={fmt_timings(r.get('startTimingIdCsv'))}")
    did = r.get("skillDetailMstId") or r.get("passiveSkillDetailMstId")
    out(f"    - {r['abilityEffectType']:<34} {vals:<40} {' '.join(extra)}   (detail {did})")
    desc = (r.get("description") or "").replace("\n", " ")
    if desc:
        out(f"      \"{desc[:160]}\"")
    for label, csv in (("start", r.get("startConditionSetIdCsv")), ("active", r.get("activeConditionSetIdCsv"))):
        lines = decode_sets(csv)
        if lines:
            out(f"      {label} condition {csv}:")
            for l in lines:
                out(l)
    t = r["abilityEffectType"]
    if ("SKILL_ACT" in t or t in ("SWITCH_SKILL",)) and r.get("value1"):
        out(f"      -> follow-up/linked skill id {r['value1']} (xq skill {r['value1']})")


def show_skill(base, lvl=None, title=""):
    lv = levels_of("SkillDetail", "skillMstId", base)
    exact = detail_rows("SkillDetail", "skillMstId", base)
    sk = uniq("Skill", "skillMstId")
    if exact and not lv:
        rows, used = exact, "exact id"
    elif lv:
        L = lvl if lvl in lv else lv[-1]
        rows, used = detail_rows("SkillDetail", "skillMstId", base * 100 + L), f"lvl {L} (levels {lv[0]}..{lv[-1]})"
    else:
        rows, used = [], "no rows"
    meta = sk.get(base) or sk.get(base * 100 + (lvl or 1))
    name = f'"{meta["name"]}" type={SKILL_TYPE.get(meta.get("type"), meta.get("type"))} sp={meta.get("sp")}' if meta else ""
    out(f"  {title}skill {base} {name} [{used}]")
    if meta and meta.get("description"):
        out(f"    desc: {meta['description'][:220]}")
    for r in sorted(rows, key=lambda r: r.get("skillDetailMstId", 0)):
        print_detail(r, True)
    return rows


def show_passive(pid, lvl=None, title="", exact_first=False):
    exact = detail_rows("PassiveSkillDetail", "passiveSkillMstId", pid)
    lv = levels_of("PassiveSkillDetail", "passiveSkillMstId", pid)
    if exact and (exact_first or not lv):
        rows, used = exact, "exact id"
    elif lv:
        L = lvl if lvl in lv else lv[-1]
        rows, used = detail_rows("PassiveSkillDetail", "passiveSkillMstId", pid * 100 + L), f"lvl {L} (levels {lv[0]}..{lv[-1]})"
    else:
        rows, used = [], "no rows"
    pb = uniq("PassiveSkill", "passiveSkillMstId")
    meta = pb.get(pid) or pb.get(pid * 100 + (lvl or 1))
    name = f'"{meta["name"]}"' if meta else ""
    out(f"  {title}passive {pid} {name} [{used}]")
    if meta and meta.get("description"):
        out(f"    desc: {meta['description'][:220]}")
    for r in sorted(rows, key=lambda r: r.get("passiveSkillDetailMstId", 0)):
        print_detail(r, False)
    return rows


def find_kioku(q):
    kd = kioku_data()
    ql = q.lower()
    hits = [k for k in kd if ql == k.lower()] or [k for k in kd if ql in k.lower()] or \
           [k for k, v in kd.items() if ql in str(v.get("character_en", "")).lower() or ql == str(v.get("id"))]
    return hits


def wiki_indexables(name):
    p = os.path.join(WIKI, "kioku_pages", f"{name}.wt")
    if not os.path.exists(p):
        return {}
    res = {}
    for line in open(p, encoding="utf-8", errors="replace"):
        m = re.match(r"\|(\w+)_indexable\s*=\s*(.*)", line.strip())
        if m:
            res[m.group(1)] = m.group(2).strip()
    return res


def cmd_kit(args):
    if not args:
        return out("usage: kit <name part> [--lvl N]")
    lvl = None
    if "--lvl" in args:
        i = args.index("--lvl"); lvl = int(args[i + 1]); args = args[:i] + args[i + 2:]
    hits = find_kioku(" ".join(args))
    if not hits:
        return out("no kioku matches; try: xq find <text>")
    if len(hits) > 1:
        out("several matches:", ", ".join(hits[:20])); out("(showing the first)")
    name = hits[0]
    k = kioku_data()[name]
    out(f"# {name}  (id {k.get('id')}, {k.get('character_en')}, {k.get('rarity')}*, {k.get('element')} {k.get('role')})")
    out(f"  base stats lvl120: hp {k.get('hp120')} atk {k.get('atk120')} def {k.get('def120')} spd {k.get('minSpd')}  ep {k.get('ep')}")
    out("  NOTE: detail rows are keyed id*100+lvl for skills/ability/ascension/support; crystalis ids are exact passive ids.")
    for slot in ("attack_id", "skill_id", "special_id"):
        if k.get(slot):
            show_skill(k[slot], lvl, f"[{slot[:-3]}] ")
    if k.get("ability_id"):
        show_passive(k["ability_id"], lvl, "[ability] ")
    for i in (1, 2, 3, 4):
        pid = k.get(f"ascension_{i}_effect_2_id")
        if pid:
            show_passive(pid, 1, f"[ascension {i}] ")
    if k.get("crystalis_id"):
        show_passive(k["crystalis_id"], None, "[crystalis (kit)] ", exact_first=True)
    sa = [r for r in mst("SelectionAbility") if r.get("styleMstId") == k.get("id")]
    for r in sa:
        out(f"  [EX crys {r['selectionAbilityMstId']}] \"{r['name']}\" -> passive {r['value1']}")
        if r["value1"] != k.get("crystalis_id"):
            show_passive(r["value1"], None, "   ", exact_first=True)
    if k.get("support_id"):
        show_passive(k["support_id"], lvl, f"[support, target={k.get('support_target')}] ")
    w = wiki_indexables(name)
    if w:
        out("  wiki effect types per slot:")
        for s, v in w.items():
            if v:
                out(f"    {s:<22} {v}")


def cmd_skill(args):
    lvl = None
    if "--lvl" in args:
        i = args.index("--lvl"); lvl = int(args[i + 1]); args = args[:i] + args[i + 2:]
    sid = int(args[0])
    if not detail_rows("SkillDetail", "skillMstId", sid) and not levels_of("SkillDetail", "skillMstId", sid) and sid > 100000:
        lvl = lvl or sid % 100; sid //= 100
    show_skill(sid, lvl)


def cmd_passive(args):
    lvl = None
    if "--lvl" in args:
        i = args.index("--lvl"); lvl = int(args[i + 1]); args = args[:i] + args[i + 2:]
    show_passive(int(args[0]), lvl, exact_first=lvl is None)


def cmd_cond(args):
    """cond <setId,...>  (condition SET ids)   |   cond c966 c1  (single CONDITION rows, the [n] ids)"""
    conds = uniq("BattleCondition", "battleConditionMstId")
    sets = [a for a in ",".join(args).split(",") if a.strip()]
    for a in sets:
        if a.startswith("c"):
            c = conds.get(int(a[1:]))
            out(cond_line(c) if c else f"condition {a[1:]}: missing")
            users = [s["battleConditionSetMstId"] for s in mst("BattleConditionSet") if a[1:] in str(s["battleConditionMstIdCsv"]).split(",")]
            out(f"   used by condition sets: {users[:20]}{' ...' if len(users) > 20 else ''}")
        else:
            for l in decode_sets(a, indent=""):
                out(l)


def enemy_block(a, verbose=True):
    en = uniq("Enemy", "enemyMstId").get(a["enemyMstId"], {})
    bm = uniq("Break", "breakMstId").get(a["breakMstId"], {})
    weak = [ELEM[a[f"weakElement{i}"]] for i in range(1, 7) if a.get(f"weakElement{i}")]
    res = {e: a.get(f"{e}ResistRate") for e in ("fire", "aqua", "forest", "light", "dark", "neutral") if a.get(f"{e}ResistRate")}
    aim = {e: a.get(f"{e}AimDamageRate") for e in ("fire", "aqua", "forest", "light", "dark", "neutral") if a.get(f"{e}AimDamageRate")}
    parry = {e: a.get(f"{e}ParryRate") for e in ("burn", "weakness", "poison", "stun", "curse", "bleed", "vortex") if a.get(f"{e}ParryRate")}
    flags = []
    if a.get("isMainTargetEnemy"): flags.append("MAIN TARGET")
    if a.get("conditionType"): flags.append(f"conditionType={a['conditionType']} value={a.get('conditionValue')} summonId={a.get('summonId')}")
    if a.get("hpGaugeCount"): flags.append(f"hpGauges={a['hpGaugeCount']} start={a.get('startHpGaugeCount')}")
    if a.get("linkHpWeight"): flags.append(f"linkHpWeight={a['linkHpWeight']}")
    out(f"  enemy {a['questEnemyAppearanceMstId']} \"{en.get('name', '?')}\" (enemyMst {a['enemyMstId']}) wave={a.get('wave')} {' '.join(flags)}")
    out(f"    hp {a['hp']} atk {a['atk']} def {a['def']} spd {a['speed']} crit {a['criticalRate']}/1000 critDmg {a['criticalDamageRate']}/1000"
        f"  hit {a.get('effectHitRate')} parry {a.get('effectParryRate')}")
    out(f"    break {a['breakMstId']}: gauge {bm.get('breakPoint')} regen/turn {bm.get('breakPointRecoveryPerTurn')}‰ slow {bm.get('breakTurnGaugeSlowRatio')}‰ "
        f"brokenRate init {bm.get('initialBreakedDamageReceiveRate')} max {bm.get('maxBreakedDamageReceiveRate')} inc {bm.get('breakedDamageReceiveRateIncreaseRate')}")
    if weak or res or aim or parry:
        out(f"    weak {weak}  resist‰ {res}  aim‰ {aim}  ailmentParry‰ {parry}")
    if not verbose:
        return
    if a.get("passiveSkillMstId"):
        show_passive(a["passiveSkillMstId"], None, "    [enemy passive] ", exact_first=True)
    ss = by("QuestEnemySkillSet", "enemySkillSetId").get(a["enemySkillSetId"], [])
    sk = uniq("Skill", "skillMstId")
    out(f"    skill set {a['enemySkillSetId']} (weight -1 = only via condition rows):")
    for s in ss:
        m = sk.get(s["skillMstId"], {})
        out(f"      {s['skillMstId']} w={s['weightValue']} hpGauge={s['hpGaugeValue']} type={SKILL_TYPE.get(m.get('type'), m.get('type'))} \"{m.get('name', '')}\"")
        for r in detail_rows("SkillDetail", "skillMstId", s["skillMstId"]):
            vals = " ".join(f"v{i}={r.get(f'value{i}')}" for i in range(1, 6) if r.get(f"value{i}"))
            out(f"         {r['abilityEffectType']:<30} {vals} turn={r.get('turn')} range={RANGES.get(r.get('range'), r.get('range'))}")
    rows = by("EnemyConditionSetsAndAction", "enemyConditionSkillSetId").get(a.get("enemyConditionSkillSetId"), [])
    if rows:
        out(f"    condition actions (set {a['enemyConditionSkillSetId']}, priority asc, first match wins):")
        for r in sorted(rows, key=lambda r: (r["priority"], r["enemyConditionSetsAndActionMstId"])):
            out(f"      p{r['priority']} row {r['enemyConditionSetsAndActionMstId']} skills {r['skillMstIdCsv']} "
                f"{'reusable' if r['isSkillReusable'] else 'ONE-SHOT'}{' BUNDLE' if r['isSkillBundle'] else ''}")
            for l in decode_sets(r["conditionSetMstIdCsv"], indent="         "):
                out(l)


def cmd_enemy(args):
    a = uniq("QuestEnemyAppearance", "questEnemyAppearanceMstId").get(int(args[0]))
    if not a:
        return out("not found")
    enemy_block(a)


def cmd_stage(args):
    sid = int(args[0])
    brief = "--brief" in args
    st = uniq("QuestStage", "questStageMstId").get(sid)
    if not st:
        return out("stage not found")
    out(f"# stage {sid} \"{st.get('name')}\" difficulty {st.get('difficulty')} group {st.get('questGroupMstId')} "
        f"judgeResultType {st.get('judgeResultType')} element {st.get('element')}")
    for w in by("QuestEnemyWave", "questStageMstId").get(sid, []):
        out(f"  wave meta: wave {w['wave']} linkHpType {w['linkHpType']} \"{w.get('linkHpName')}\"  tips: {w.get('enemyTipsText', '')[:120]}")
    for r in by("SoloRaidStage", "questStageMstId").get(sid, []):
        out(f"  SOLO RAID stage: limitRoundCount {r['limitRoundCount']} soloRaidMstId {r['soloRaidMstId']} diff {r['difficulty']}  {r.get('comment', '')[:200]}")
    for r in by("ScoreAttackStage", "questStageMstId").get(sid, []):
        out(f"  SCORE ATTACK stage: scoreAttackMstId {r['scoreAttackMstId']} difficulty {r['difficulty']}")
    apps = by("QuestEnemyAppearance", "questStageMstId").get(sid, [])
    mc = {r["questEnemyAppearanceMstId"]: r for r in mst("QuestEnemyModeChange")}
    for a in sorted(apps, key=lambda a: (a.get("wave", 0), a["questEnemyAppearanceMstId"])):
        enemy_block(a, verbose=not brief)
        if a["questEnemyAppearanceMstId"] in mc:
            r = mc[a["questEnemyAppearanceMstId"]]
            out(f"    FORM CHANGE step {r['step']} type {r['type']} threshold {r['thresholdValue']}‰ HP")


def cmd_find(args):
    q = " ".join(args).lower()
    for k in kioku_data():
        if q in k.lower() or q in str(kioku_data()[k].get("character_en", "")).lower():
            out(f"kioku: {k}")
    for r in mst("Skill"):
        if q in str(r.get("name", "")).lower():
            out(f"skill {r['skillMstId']}: {r['name']} (type {r.get('type')})")
    for r in mst("PassiveSkill"):
        if q in str(r.get("name", "")).lower():
            out(f"passive {r['passiveSkillMstId']}: {r['name']}")
    for r in mst("Enemy"):
        if q in str(r.get("name", "")).lower():
            out(f"enemyMst {r['enemyMstId']}: {r['name']}")
    for r in mst("QuestStage"):
        if q in str(r.get("name", "")).lower():
            out(f"stage {r['questStageMstId']}: {r['name']}")


# ----------------------------------------------------------------------------------------------- effect types
@lru_cache(None)
def kit_type_users():
    """TYPE -> {kioku: set(slots)} using the correct id*100+lvl keys, all levels, following *_SKILL_ACT links"""
    use = collections.defaultdict(lambda: collections.defaultdict(set))
    sd = by("SkillDetail", "skillMstId"); pd = by("PassiveSkillDetail", "passiveSkillMstId")

    def srows(i):
        r = list(sd.get(i, []))
        for l in range(1, 21):
            r += sd.get(i * 100 + l, [])
        return r

    def prows(i):
        r = list(pd.get(i, []))
        for l in range(1, 21):
            r += pd.get(i * 100 + l, [])
        return r

    def walk(rows, name, slot, seen):
        for r in rows:
            use[r["abilityEffectType"]][name].add(slot)
            v = r.get("value1")
            if "SKILL_ACT" in r["abilityEffectType"] and v and v not in seen:
                seen.add(v); walk(srows(v), name, slot + ">followup", seen)

    for name, k in kioku_data().items():
        seen = set()
        for s in ("attack_id", "skill_id", "special_id"):
            if k.get(s): walk(srows(k[s]), name, s[:-3], seen)
        for s in ("ability_id", "ascension_1_effect_2_id", "ascension_2_effect_2_id", "ascension_3_effect_2_id",
                  "ascension_4_effect_2_id", "crystalis_id", "support_id"):
            if k.get(s): walk(prows(k[s]), name, s.replace("_effect_2_id", "").replace("_id", ""), seen)
        for r in mst("SelectionAbility"):
            if r.get("styleMstId") == k.get("id"):
                walk(prows(r["value1"]), name, "EXcrys", seen)
    return use


@lru_cache(None)
def enemy_type_users():
    """TYPE -> set(questStageMstId) via enemy skill sets and enemy passives"""
    use = collections.defaultdict(set)
    sd = by("SkillDetail", "skillMstId"); pd = by("PassiveSkillDetail", "passiveSkillMstId")
    sets = by("QuestEnemySkillSet", "enemySkillSetId")
    for a in mst("QuestEnemyAppearance"):
        for s in sets.get(a["enemySkillSetId"], []):
            for r in sd.get(s["skillMstId"], []):
                use[r["abilityEffectType"]].add(a["questStageMstId"])
        for r in pd.get(a.get("passiveSkillMstId"), []):
            use[r["abilityEffectType"]].add(a["questStageMstId"])
    return use


@lru_cache(None)
def factories():
    p = os.path.join(DECOMP, "factories.json")
    return json.load(open(p, encoding="utf-8")) if os.path.exists(p) else {}


@lru_cache(None)
def json_side(fname):
    p = os.path.join(DECOMP, fname)
    return json.load(open(p, encoding="utf-8")) if os.path.exists(p) else {}


def factory_class(t):
    for fac, m in factories().items():
        if t in m:
            return fac, m[t]
    return None, None


@lru_cache(None)
def index_rows():
    p = os.path.join(DECOMP, "_index_targets.tsv")
    rows = []
    if os.path.exists(p):
        for line in open(p, encoding="utf-8", errors="replace"):
            parts = line.rstrip("\n").split("\t")
            if len(parts) >= 4:
                rows.append((int(parts[0], 16), parts[1], parts[2], parts[3]))
    return rows


TS_DECL = re.compile(r"^\s*(export\s+)?(async\s+)?(function\s+\w+|(public |private |protected |static |get |set )*\w+\s*(<[^>]*>)?\([^;]*\)\s*(:\s*[^{;=]+)?\{\s*$|(export\s+)?(const|let)\s+\w+\s*=\s*(\([^)]*\)|\w+)\s*(:\s*[^=]+)?=>|case\s+[\w.\"']+.*:|class\s+\w+)")


@lru_cache(None)
def ts_files():
    fs = sorted(glob.glob(os.path.join(MODELS, "*.ts"))) + sorted(glob.glob(os.path.join(SRC, "utils", "*.ts")))
    return {f: open(f, encoding="utf-8", errors="replace").read().split("\n") for f in fs}


SKIP_TS = ("EffectTargetSide.ts", "StateAddFilter.ts")  # generated tables list every type


QUOTED_TYPE = re.compile(r"[\"'`][A-Z][A-Z0-9_]{3,}[\"'`]")
AFFIX = re.compile(r"(startsWith|endsWith)\(\s*[\"'`]([A-Z0-9_]+)[\"'`]\s*\)")
TEMPLATE = re.compile(r"`([A-Z0-9_]*\$\{[^}]+\}[A-Z0-9_${}]*)`")


def _ref_kind(line, via_template=False):
    s = line.strip()
    if s.startswith("//") or s.startswith("*") or s.startswith("/*"):
        return "comment"
    if via_template:
        return "template"
    if len(QUOTED_TYPE.findall(s)) >= 3 and not re.search(r"\bcase\b|===|!==|startsWith|endsWith|\.includes\(|\.has\(", s):
        return "list"
    return "logic"


def ts_refs(sym, include_generated=False, old_calc=False, kinds=("logic", "template", "affix", "list")):
    """(file, line, enclosing fn, text, kind). kind: logic | template (`UP_${stat}_FIXED`) | list (a line enumerating
    many types, e.g. a side table) | comment."""
    pat = re.compile(r"\b%s\b" % re.escape(sym))
    res = []
    for f, lines in ts_files().items():
        b = os.path.basename(f)
        if not include_generated and b in SKIP_TS:
            continue
        if not old_calc and b in ("ScoreAttackTeam.ts", "ScoreAttackKioku.ts", "Kioku.ts", "MaxDamage.ts"):
            continue
        fn_stack = []
        for i, l in enumerate(lines):
            m = re.match(r"^(\s*)(export\s+)?(async\s+)?(function\s+(\w+)|class\s+(\w+)|(?:public |private |protected |static |get |set )*(\w+)\s*(?:<[^>]*>)?\(.*\)\s*(?::\s*[^{;=]+)?\{\s*$)", l)
            if m and not re.match(r"^\s*(if|for|while|switch|catch|return)\b", l):
                ind = len(m.group(1))
                fn_stack = [x for x in fn_stack if x[0] < ind]
                fn_stack.append((ind, m.group(5) or m.group(6) or m.group(7)))
            st = l.lstrip()
            if st.startswith("}"):
                ind = len(l) - len(st)
                fn_stack = [x for x in fn_stack if x[0] < ind]
            hit, via_t = bool(pat.search(l)), False
            if not hit:
                for t in TEMPLATE.findall(l):
                    rx = "^" + re.sub(r"\\\$\\\{[^}]*\\\}", "[A-Z0-9]+(?:_[A-Z0-9]+)*", re.escape(t)) + "$"
                    if re.match(rx, sym):
                        hit, via_t = True, True
                        break
            if not hit and not l.lstrip().startswith(("//", "*")):
                for fn_, lit in AFFIX.findall(l):
                    if len(lit.strip("_")) < 4:   # generic "UP_"/"DWN_"/"DMG_" tests say nothing about one type
                        continue
                    if (fn_ == "startsWith" and sym.startswith(lit)) or (fn_ == "endsWith" and sym.endswith(lit)):
                        hit, via_t = True, "affix"
                        break
            if hit:
                kind = "affix" if via_t == "affix" else _ref_kind(l, via_t)
                if kind not in kinds:
                    continue
                enclosing = [n for ind, n in fn_stack if n]
                where = ".".join(enclosing[-2:]) if enclosing else "top-level"
                res.append((os.path.join("src", os.path.relpath(f, SRC)), i + 1, where, l.strip()[:150], kind))
    return res


def cmd_effect(args):
    t = args[0].upper()
    fac, cls = factory_class(t)
    side = json_side("ability_side.json").get(t)
    direction = json_side("state_direction.json").get(t)
    out(f"# {t}")
    if fac:
        out(f"  class: {cls} (from {fac})")
    if direction:
        out(f"  state direction [class, direction(0 pos/1 neg/2 ailment?), extra]: {direction}")
    if side:
        out(f"  ability effect [class, targetSide 1=opponents 0=friends]: {side}")
    at = [r for r in mst("AbilityEffectType") if r.get("effectType") == t]
    for r in at:
        out(f"  AbilityEffectTypeMst: name \"{r.get('name')}\" category {r.get('category')} displayType {r.get('displayType')} paramEffectType {r.get('paramEffectType')} targetParams {r.get('targetParams')}")
    users = kit_type_users().get(t, {})
    out(f"  kiokus using it ({len(users)}):")
    for name, slots in sorted(users.items()):
        out(f"    {name}: {', '.join(sorted(slots))}")
    st = enemy_type_users().get(t, set())
    if st:
        qs = uniq("QuestStage", "questStageMstId")
        sample = sorted(st)[:8]
        out(f"  enemy stages using it: {len(st)} e.g. " + ", ".join(f"{s} ({qs.get(s, {}).get('name', '?')})" for s in sample))
    if cls:
        ms = [(rva, ns, c, sig) for rva, ns, c, sig in index_rows() if c == cls or c.startswith(cls + ".") or c.startswith(cls + "<")]
        out(f"  decompiled methods of {cls} ({len(ms)}):  -> xq fn '{cls}$$' to read them")
        for rva, ns, c, sig in ms[:25]:
            out(f"    0x{rva:x}  {ns}.c  {c}: {sig[:120]}")
    refs = ts_refs(t)
    out(f"  TS engine references ({len(refs)}, excluding generated tables and the old ScoreAttack calculator):")
    for f, ln, where, text, kind in refs[:40]:
        out(f"    {f}:{ln}  [{where}] ({kind})  {text}")
    if not refs:
        out("    (none: NOT IMPLEMENTED in the engine)")
    elif all(r[4] == "list" for r in refs):
        out("    (only listed in type tables: probably NOT IMPLEMENTED)")


# ----------------------------------------------------------------------------------------------- decompile
def iter_blocks(pats, list_only=False):
    for f in sorted(glob.glob(os.path.join(DECOMP, "*.c"))):
        txt = open(f, encoding="utf-8", errors="replace").read()
        pos = 0
        for block in re.split(r"\n(?=// ==== )", txt):
            head = "\n".join(block.split("\n")[:2])
            if any(p in head for p in pats):
                line = txt.count("\n", 0, txt.find(block[:200])) + 1 if list_only else 0
                yield os.path.basename(f), line, head, block


def clean_c(b):
    b = re.sub(r"\n *FUN_18067ce80\([^\n]*\);", "", b)
    b = re.sub(r"\n *if \(\*\(int \*\)\([^\n]*\+ 0xe0\) == 0\) \{\n *func_0x00018065d160\([^\n]*\);\n *\}", "", b)
    b = re.sub(r"\n *if \((?:cRam|DAT_)[0-9a-f]+ == .\\0.\) \{\n(?: *FUN_18067ce80\([^\n]*\);\n)* *(?:cRam|DAT_)[0-9a-f]+ = [^\n]*;\n *\}", "", b)
    # multi-line il2cpp lazy-init blocks: if (cRam.. == '\0') { FUN_18067ce80(&...); ... cRam.. = '\x01'; }
    b = re.sub(r"\n *if \((?:cRam|DAT_)[0-9a-f]+ == '\\0'\) \{\n(?:(?!\n *\}).)*?\n *(?:cRam|DAT_)[0-9a-f]+ = '\\x01';\n *\}", "", b, flags=re.S)
    b = re.sub(r"\n *func_0x00018067c210\([^;]*\);", "", b)   # GC write barrier
    b = re.sub(r"\n/\* WARNING: [^\n]*\*/", "", b)
    b = b.replace("func_0x000184b0a740", "Decimal_ctor_int").replace("func_0x000184b0b2a0", "Decimal_ctor_int2")
    b = b.replace("func_0x00018062af30", "il2cpp_new").replace("func_0x000184a98810", "Math_Pow")
    b = b.replace("func_0x0001807029f0", "Math_Ceiling").replace("func_0x000180702d68", "Math_Floor").replace("func_0x000184b08ae0", "Decimal_Negate")
    b = re.sub(r"\n\s*(?=\n)", "", b)
    return b.strip()


NOISE = [
    re.compile(r"^\s*(?:undefined\d?|code|bool|float|double|int|uint|char|longlong|ulonglong|undefined8|undefined4|undefined1|short|ushort|byte)\s+\**[A-Za-z_][\w]*(?:\s*\[\d+\])?;\s*$"),  # local declarations
    re.compile(r"^\s*(?:uStack_[0-9a-f]+|uVar\d+|puStack_[0-9a-f]+) = (?:0|\(undefined4 \*\)0x0);$"),
    re.compile(r"FUN_18067d0a0\(\);|pcVar\d+ = \(code \*\)swi\(3\);|\(\*pcVar\d+\)\(\);|FUN_180679060"),  # null-check trap
    re.compile(r"^\s*(?:uStack_[0-9a-f]+) = \*\(undefined4 \*\)"),
    re.compile(r"^\s*uVar\d+ = puVar\d+\[[1-3]\];$"),
    re.compile(r"^\s*(?:code_r0x[0-9a-f]+|LAB_[0-9a-f]+):\s*$"),
]


def brief_c(b):
    """cleaner view: drop local declarations, null-check traps, decimal stack copies (the flt.sh filters)."""
    return "\n".join(l for l in b.split("\n") if not any(p.search(l) for p in NOISE))


def cmd_fn(args):
    list_only = "--list" in args
    raw = "--raw" in args
    mx = 6
    if "--max" in args:
        i = args.index("--max"); mx = int(args[i + 1]); args = args[:i] + args[i + 2:]
    pats = [a for a in args if not a.startswith("--")]
    n = 0
    for f, line, head, block in iter_blocks(pats, list_only):
        n += 1
        if list_only:
            h = head.split("\n")
            out(f"{f}:{line}  {h[0][8:-5] if len(h) > 0 else ''}  |  {h[1][3:] if len(h) > 1 else ''}")
            continue
        if n > mx:
            continue
        out(f"/* {f} */")
        out(clean_c(block) if raw else brief_c(clean_c(block))); out("")
    if n > mx and not list_only:
        out(f"... {n - mx} more matches (use --list, or --max N)")
    if n == 0:
        out("no match. Tips: search the C# method name ('GetProcessedAtk'), the class ('BarrierUnitState$$'), or an RVA ('RVA 0x137cb10').")


def cmd_rva(args):
    v = int(args[0], 16)
    rows = sorted(index_rows())
    keys = [r[0] for r in rows]
    i = bisect.bisect_right(keys, v) - 1
    if i < 0:
        return out("before first function")
    rva, ns, c, sig = rows[i]
    out(f"0x{rva:x} {ns}.c {c}: {sig}  (+0x{v - rva:x})")


def grep_n(pattern, path, maxc=None):
    cmd = ["grep", "-n", "-E", pattern, path]
    if maxc:
        cmd[1:1] = ["-m", str(maxc)]
    r = subprocess.run(cmd, capture_output=True, text=True, errors="replace")
    return [(int(l.split(":", 1)[0]), l.split(":", 1)[1]) for l in r.stdout.splitlines() if ":" in l]


def read_lines(path, start, maxn=4000):
    res = []
    with open(path, encoding="utf-8", errors="replace") as fh:
        for i, l in enumerate(fh, 1):
            if i < start:
                continue
            res.append(l.rstrip("\n"))
            if l.startswith("}") or len(res) >= maxn:
                break
    return res


def cmd_cls(args):
    name = args[0]
    show_all = "--all" in args
    hits = grep_n(r"^(public|internal|private|protected)?[a-z ]*(class|struct|enum|interface) %s( |<|$)" % re.escape(name), DUMP_CS, 20)
    if not hits:
        hits = grep_n(r"(class|struct|enum|interface) [A-Za-z0-9_.]*%s( |<)" % re.escape(name), DUMP_CS, 20)
    if not hits:
        return out("class not found in dump.cs")
    for ln, text in hits[:3]:
        body = read_lines(DUMP_CS, max(1, ln - 1))
        out(f"dump.cs:{ln}")
        rva = None
        for l in body:
            s = l.strip()
            if s.startswith("// RVA:"):
                rva = s.split()[2]; continue
            if not show_all and (s.startswith("[") or s == "" or s.startswith("// Offset") or "CompilerGenerated" in s):
                continue
            if rva and "(" in s:
                out(f"  {s}   // RVA {rva}"); rva = None
            else:
                out("  " + s if not l.startswith(("public", "internal", "private", "protected", "//", "{", "}")) else l)


def build_enums():
    res = {}
    cur = None
    with open(DUMP_CS, encoding="utf-8", errors="replace") as fh:
        ns = ""
        for l in fh:
            if l.startswith("// Namespace:"):
                ns = l.split(":", 1)[1].strip(); continue
            m = re.match(r"^(?:public|internal|private|protected)?\s*enum (\w+)", l)
            if m and (ns.startswith("ReDriveBattleCore") or ns.startswith("Network.Definition")):
                cur = m.group(1); res.setdefault(cur, {}); continue
            if cur:
                m2 = re.match(r"\s*public const \w+(?:\.\w+)* (\w+) = (-?\d+);", l)
                if m2:
                    res[cur][m2.group(2)] = m2.group(1)
                elif l.startswith("}"):
                    cur = None
    return res


def cmd_enum(args):
    e = enums().get(args[0])
    if not e:
        return out("not in cache (run `xq build`) or unknown; cached: " + ", ".join(sorted(enums())[:80]))
    for k, v in sorted(e.items(), key=lambda kv: int(kv[0])):
        out(f"  {k:>6} {v}")


def cmd_ts(args):
    kinds = ("logic", "template", "affix", "list", "comment") if "--all" in args else ("logic", "template", "affix", "list")
    for f, ln, where, text, kind in ts_refs(args[0], include_generated="--all" in args, old_calc="--all" in args, kinds=kinds):
        out(f"{f}:{ln}  [{where}] ({kind})  {text}")


# ----------------------------------------------------------------------------------------------- build
def cmd_build(args):
    os.makedirs(CACHE, exist_ok=True)
    en = build_enums()
    json.dump(en, open(os.path.join(CACHE, "enums.json"), "w", encoding="utf-8"), indent=0, ensure_ascii=False)
    out(f"enums.json: {len(en)} enums")
    enums.cache_clear()
    # effect-type coverage table
    types = set()
    for fac, m in factories().items():
        types |= set(m)
    types |= set(kit_type_users()) | set(enemy_type_users())
    types |= {r["effectType"] for r in mst("AbilityEffectType") if r.get("effectType")}
    rows = []
    for t in sorted(types):
        fac, cls = factory_class(t)
        ku = kit_type_users().get(t, {})
        es = enemy_type_users().get(t, set())
        refs = ts_refs(t)
        files = sorted({os.path.basename(r[0]) for r in refs if r[4] != "list"})
        if any(r[4] == "logic" for r in refs):
            status = "yes"
        elif any(r[4] in ("template", "affix") for r in refs):
            status = "prefix/template?"
        elif not ku and not es:
            status = "-" if not refs else "listed"
        else:
            status = "**LISTED ONLY**" if refs else "**MISSING**"
        rows.append((t, cls or "", len(ku), len(es), status, ", ".join(files), ", ".join(sorted(ku)[:3])))
    p = os.path.join(REPO, "docs", "ai", "EFFECT_TYPES.md")
    with open(p, "w", encoding="utf-8") as fh:
        fh.write("# Effect types: data usage vs engine coverage (GENERATED - do not edit)\n\n")
        try:
            ref = subprocess.run(["git", "-C", REPO, "log", "-1", "--format=%h %ad", "--date=short"], capture_output=True, text=True).stdout.strip()
            br = subprocess.run(["git", "-C", REPO, "branch", "--show-current"], capture_output=True, text=True).stdout.strip()
            dirty = subprocess.run(["git", "--no-optional-locks", "-C", REPO, "status", "--porcelain", "--", "src/models"], capture_output=True, text=True).stdout.strip()
        except Exception:
            ref, br, dirty = "?", "?", ""
        if os.environ.get("XQ_REF_LABEL"):
            br, ref, dirty = os.environ["XQ_REF_LABEL"], "", ""
        fh.write(f"Built from `{br}{(' @ ' + ref) if ref else ''}`{' + uncommitted src/models changes' if dirty else ''}. "
                 "Regenerate after switching branches or changing the engine: `python3 scripts/ai/xq.py build`. "
                 "Details for one type: `python3 scripts/ai/xq.py effect <TYPE>`.\n\n")
        fh.write("- **kiokus** = kiokus in kioku_data.json whose kit uses it (all levels, id*100+lvl keys, follow-ups followed).\n")
        fh.write("- **stages** = quest stages whose enemies use it (skill sets + enemy passives).\n")
        fh.write("- **TS** = `yes` if the engine (src/models + src/utils, not the generated tables or the old ScoreAttack calculator) "
                 "compares/cases on it; `prefix/template?` = only matched by a template literal like `UP_${stat}_FIXED` or a `startsWith`/`endsWith` test (may over-match); `**LISTED ONLY**` = only appears in a type list "
                 "(e.g. target-side tables); `**MISSING**` = never mentioned. A reference is not proof of a full implementation: "
                 "check with `xq effect <TYPE>` (it lists each reference with its kind).\n\n")
        fh.write("| effect type | game class | kiokus | stages | TS | TS files | example kiokus |\n|---|---|---|---|---|---|---|\n")
        for r in rows:
            fh.write("| " + " | ".join(str(x) for x in r) + " |\n")
        miss = [r for r in rows if r[4] in ("**MISSING**", "**LISTED ONLY**")]
        fh.write(f"\n{len(rows)} types; {len(miss)} are used by data but have no logic reference in the engine: "
                 + ", ".join(r[0] for r in miss) + "\n")
    out(f"EFFECT_TYPES.md: {len(rows)} types, {len(miss)} missing/listed-only: " + " ".join(r[0] for r in miss))


CMDS = {"kit": cmd_kit, "skill": cmd_skill, "passive": cmd_passive, "cond": cmd_cond, "stage": cmd_stage, "enemy": cmd_enemy,
        "find": cmd_find, "effect": cmd_effect, "fn": cmd_fn, "cls": cmd_cls, "enum": cmd_enum, "rva": cmd_rva, "ts": cmd_ts,
        "build": cmd_build}

def use_branch(branch):
    """point the TS scans (ts, effect, build) at another branch without checking it out"""
    global SRC, MODELS
    h = subprocess.run(["git", "-C", REPO, "rev-parse", "--short", branch], capture_output=True, text=True).stdout.strip()
    if not h:
        sys.exit(f"unknown branch {branch}")
    dest = os.path.join(os.path.expanduser("~"), ".cache", "xq", h)
    if not os.path.isdir(os.path.join(dest, "src")):
        os.makedirs(dest, exist_ok=True)
        subprocess.run(f'git -C "{REPO}" archive {h} src | tar -x -C "{dest}"', shell=True, check=True)
    SRC = os.path.join(dest, "src"); MODELS = os.path.join(SRC, "models")
    os.environ.setdefault("XQ_REF_LABEL", f"{branch} @ {h}")


if __name__ == "__main__":
    if "--branch" in sys.argv:
        i = sys.argv.index("--branch"); use_branch(sys.argv[i + 1]); del sys.argv[i:i + 2]
    if len(sys.argv) < 2 or sys.argv[1] not in CMDS:
        out(__doc__); sys.exit(0)
    CMDS[sys.argv[1]](sys.argv[2:])
