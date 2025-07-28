from __future__ import annotations
import subprocess
import sys
from collections import defaultdict
from itertools import combinations
from math import comb
from functools import lru_cache
import json
import gzip
import os
import argparse

try:
    __import__("tqdm")
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "tqdm"])
from tqdm import tqdm

max_break = 0
amount_enemies = 0

os.makedirs("results", exist_ok=True)
os.makedirs("history", exist_ok=True)


def get_idx(obj: dict) -> int:
    if "passiveSkillMstId" in obj:
        return obj["passiveSkillMstId"]
    return obj["skillMstId"]


def get_data(file: str, primary_id: str):
    with open(os.path.join("base_data", f"{file}.json"), encoding="utf-8") as f:
        return {char[primary_id]: char for char in json.load(f)}


element_map = {1: "Flame", 2: "Aqua", 3: "Forest", 4: "Light", 5: "Dark", 6: "Void"}
battle_conditions: dict[int, dict] = get_data(
    "getBattleConditionSetMstList", "battleConditionSetMstId"
)
portraits: dict[str, dict] = get_data("getCardMstList", "name")
protrait_levels: dict[int, dict] = get_data(
    "getCardLimitBreakMstList", "cardLimitBreakMstId"
)
passive_details = get_data("getPassiveSkillDetailMstList", "passiveSkillDetailMstId")
skill_details = get_data(
    "getSkillDetailMstList",
    "skillDetailMstId",
)
with open(
    os.path.join("base_data", "kioku_data.json"), "r", encoding="utf-8", newline="\n"
) as f:
    kioku_data = json.load(f)


def find_all_details(is_passive: bool, skill_id: int, is_unique) -> dict:
    if skill_id < 1000:
        return {}
    if is_passive:
        details = passive_details
        key = "passiveSkillMstId"
    else:
        details = skill_details
        key = "skillMstId"

    this_skill = {
        k: v
        for k, v in details.items()
        if v[key] // (1 if is_unique else 100) == skill_id
    }
    sub_skills = {}
    for skill in this_skill.values():
        for i in range(8):
            if f"value{i}" in skill:
                sub_skills |= find_all_details(
                    False, skill[f"value{i}"] // 100, is_unique=False
                )
                sub_skills |= find_all_details(
                    True, skill[f"value{i}"] // 100, is_unique=False
                )

    return this_skill | sub_skills


class Kioku:
    available_dps_crys = ["ATK%-25", "CD-20", "Elem-24", "Dmg-20", "ATK-125", "EX"]
    known_boosts = {
        "UP_ATK_RATIO": "Atk%1",
        "UP_ATK_ACCUM_RATIO": "Atk%2",
        "def%": "Def%",
        "DWN_DEF_RATIO": "Def%1",
        "WEAKNESS": "Def%3",
        "DWN_DEF_ACCUM_RATIO": "Def%2",
        "UP_CTR_FIXED": "CR+",
        "UP_CTR_ACCUM_RATIO": "CR+",
        "UP_CTD_FIXED": "CD1+",
        "UP_CTD_RATIO": "CD3+",
        "UP_CTD_ACCUM_RATIO": "CD2+",
        "cd": "CD+",
        "UP_GIV_DMG_RATIO": "DMG Dealt+",
        "UP_RCV_DMG_RATIO": "DMG Taken+",
        "UP_AIM_RCV_DMG_RATIO": "Elem DMG Taken+",
        "DWN_ELEMENT_RESIST_ACCUM_RATIO": "Elem Resist-",
        "UP_WEAK_ELEMENT_DMG_RATIO": "Elem Dmg+",
    }
    non_boosts = {
        "DWN_RCV_DMG_RATIO",
        "DMG_ATK",
        "UP_DEF_RATIO",
        "ADDITIONAL_TURN_UNIT_ACT",
        "GAIN_EP_RATIO",
        "HASTE",
        "UP_SPD_RATIO",
        "UP_EP_RECOVER_RATE_RATIO",
        "GAIN_EP_FIXED",
        "UP_DEF_ACCUM_RATIO",
        "BLEED_ATK",
        "BARRIER",
        "DMG_DEF",
        "RECOVERY_HP_ATK",
        "CONTINUOUS_RECOVERY",
        "UP_HEAL_RATE_RATIO",
        "CUTOUT",
        "RECOVERY_HP",
        "REMOVE_ALL_ABNORMAL",
        "CHARGE",
        "SHIELD",
        "REMOVE_ALL_BUFF",
        "GAIN_CHARGE_POINT",
        "CONSUME_CHARGE_POINT",
        "STUN",
        "SLOW",
        "IMM_SLIP_DMG",
        "POISON_ATK",
        "DWN_SPD_RATIO",
        "DWN_ATK_RATIO",
        "REFLECTION_RATIO",
        "UP_GIV_BREAK_POINT_DMG_FIXED",
        "ADDITIONAL_SKILL_ACT",
        "UP_SPD_FIXED",
        "ADD_BUFF_TURN",
        "UNIQUE_10030301",
        "UP_SPD_ACCUM_RATIO",
        "CURSE_ATK",
        "BURN_ATK",
    }
    # Return true if should skip
    known_conditions = {
        "9": lambda: False,  # "HPが50%以上のとき",
        "476": lambda: False,  # "HPが50%未満のとき",
        "1562": lambda: True,  # "自身のHPが50%未満かつ36%以上のとき", # We take the lowest bonus and skip this
        "1563": lambda: True,  # "自身のHPが35%未満かつ11%以上のとき", # We take the lowest bonus and skip this
        "1564": lambda: False,  # "自身のHPが10%未満のとき",
        "330": lambda: amount_enemies < 2,  # "敵が2体以上のとき",
        "439": lambda: amount_enemies < 3,  # "敵が3体以上のとき",
        "440": lambda: amount_enemies < 4,  # "敵が4体以上のとき",
        "441": lambda: amount_enemies < 5,  # "敵が5体以上のとき",
        "1569": lambda: amount_enemies < 3,
        # "敵が3体以上+行動タイプは必殺技+行動者は自身",
        "1538": lambda: False,  # "自分にシールドが付与されているとき",
        "38": lambda: False,  # "HPが80%以上のとき",
        "773": lambda: max_break <= 3.5,
        # "ブレイク倍率が350%以上の敵に対して必殺技を発動したとき",
        "331": lambda: max_break <= 2,
        # "ブレイクボーナスが200%以上の敵に対して",
        "451": lambda: max_break <= 2,
        # "ブレイクボーナスが200%以上の敵に対して、必殺技の",
        "1178": lambda: False,  # "継続回復効果が付与されているとき",
        "310": lambda: False,  # "行動対象がブレイク状態のとき",
        "1277": lambda: False,  # "カットアウトが付与されているとき",
        "266": lambda: False,  # "必殺技の",
        "317": lambda: False,  # "必殺技の",
        "7": lambda: False,  # "必殺技の",
        "512": lambda: False,  # "魔力が1以上のとき",
        "428": lambda: False,  # "魔力が5個のとき",
        "1535": lambda: False,  # "トークンが3以上のとき",
        "1542": lambda: False,  # "魔力が5個で必殺技を使用したとき",
        "1543": lambda: False,  # "自身が固有バフ(水着マミ)状態の場合+HP80%以上",
        "1580": lambda: False,  # "自身が固有バフ(水着マミ)状態の場合+HP85%以上",
        "1544": lambda: False,  # "自身が固有バフ(水着マミ)状態の場合+HP90%以上",
        "1581": lambda: False,  # "自身が固有バフ(水着マミ)状態の場合+HP95%以上",
        "1545": lambda: False,  # "自身が固有バフ(水着マミ)状態の場合+HP100%",
        "337": lambda: False,  # "対象が「毒」のとき%",
    }

    max_lvl = 120
    max_magic_lvl = 130
    max_ascension = 5
    max_heartphial_lvl = 50

    def __init__(
        self,
        name: str,
        dps_element: str | None = None,
        support: Kioku | None = None,
        portrait: str | None = None,
        is_dps=False,
        ascension=max_ascension,
        support_lvl=10,
        kioku_lvl=max_lvl,
        magic_lvl=max_magic_lvl,
        heartphial_lvl=max_heartphial_lvl,
        skill_lvl=10,
        ability_lvl=10,
        special_lvl=10,
        crys: tuple | None = None,
        crys_sub: tuple = (
            "CD-10",
            "CD-10",
            "CD-10",
            "ATK-60",
            "ATK-60",
            "ATK-60",
        ),
    ) -> None:
        self.name = name
        self.support = support
        self.portrait = portrait
        self.is_dps = is_dps
        self.ascension = ascension
        self.support_lvl = support_lvl
        self.kioku_lvl = kioku_lvl
        self.magic_lvl = magic_lvl  # Use this to reduce max stats?
        self.heartphial_lvl = heartphial_lvl  # Use this to reduce max stats?
        self.skill_lvl = skill_lvl
        self.ability_lvl = ability_lvl
        self.special_lvl = special_lvl
        self.actual_special_lvl = self.special_lvl
        if self.ascension < 5:
            self.actual_special_lvl = min(self.actual_special_lvl, 7)
        if self.ascension < 3:
            self.actual_special_lvl = min(self.actual_special_lvl, 4)
        self.crys_key = crys
        self.crys = ["EX"] if crys is None else list(crys)
        self.crys_sub = list(crys_sub)
        self.data = kioku_data[name]
        self.dps_element = dps_element
        self.effects = defaultdict(int)
        self.atk_per_magic_rank = 36 if self.data["rarity"] == 5 else 32

        self.setup()

    def setup(self):

        atk_delta = (self.data["atk100"] - self.data["minAtk"]) / (Kioku.max_lvl - 1)
        self.base_atk = self.data["maxAtk"] - atk_delta * (
            Kioku.max_lvl - self.kioku_lvl
        )

        if self.magic_lvl < 129:
            self.base_atk -= self.atk_per_magic_rank
        if self.magic_lvl < 126:
            self.base_atk -= self.atk_per_magic_rank
        if self.magic_lvl < 123:
            self.base_atk -= self.atk_per_magic_rank
        if self.magic_lvl < 121:
            self.base_atk -= self.atk_per_magic_rank
        if self.heartphial_lvl < 45:
            self.base_atk -= 20
        if self.heartphial_lvl < 39:
            self.base_atk -= 20
        if self.heartphial_lvl < 33:
            self.base_atk -= 20
        if self.heartphial_lvl < 27:
            self.base_atk -= 20
        if self.heartphial_lvl < 21:
            self.base_atk -= 20
        if self.heartphial_lvl < 15:
            self.base_atk -= 10
        if self.heartphial_lvl < 9:
            self.base_atk -= 10

        if self.support:
            self.base_atk += 0.16 * self.support.base_atk

        self.atk_bonus_flat = 0
        for cry in self.crys + self.crys_sub:
            if "EX" != cry and self.is_dps:
                val, eff = cry.split("-")
                if val == "ATK":
                    self.atk_bonus_flat += int(eff)
                elif val == "ATK%":
                    self.effects["UP_ATK_RATIO"] += 10 * int(eff)
                elif val == "CD":
                    self.effects["UP_CTD_FIXED"] += int(10 * float(eff))
                elif val == "Elem":
                    self.effects["UP_WEAK_ELEMENT_DMG_RATIO"] += int(10 * float(eff))
                elif val == "Dmg":
                    self.effects["UP_GIV_DMG_RATIO"] += int(10 * float(eff))

        self.buff_mult = 1
        self.debuff_mult = 1

        for i in range(1, 1 + self.ascension):
            if asc_id := self.data.get(f"ascension_{i}_effect_2_id"):
                if not asc_id:
                    continue
                details = find_all_details(True, asc_id, is_unique=False)

                for sub_d in details.values():
                    if sub_d["abilityEffectType"] == "UP_BUFF_EFFECT_VALUE":
                        self.buff_mult += sub_d["value1"] / 1000
                    elif sub_d["abilityEffectType"] == "UP_DEBUFF_EFFECT_VALUE":
                        self.debuff_mult += sub_d["value1"] / 1000

        if self.support:
            supp_target, supp_eff = self.support.get_support_effect()

            if self.is_valid_support(supp_target):
                for sub_d in supp_eff.values():
                    if sub_d["abilityEffectType"] == "UP_BUFF_EFFECT_VALUE":
                        self.buff_mult += sub_d["value1"] / 1000
                    elif sub_d["abilityEffectType"] == "UP_DEBUFF_EFFECT_VALUE":
                        self.debuff_mult += sub_d["value1"] / 1000

                ## MULT addition done
                self.add_effects(supp_eff, True, 10)
        for i in range(1, 1 + self.ascension):
            if asc_id := self.data.get(f"ascension_{i}_effect_2_id"):
                if not asc_id:
                    continue
                details = find_all_details(True, asc_id, is_unique=False)
                self.add_effects(details, True, 10)

        if self.portrait:
            port_info = portraits[self.portrait]
            port_eff = find_all_details(
                is_passive=True,
                skill_id=port_info["passiveSkill1"],
                is_unique=False,
            )
            self.base_atk += protrait_levels[port_info["cardMstId"] * 10 + 5]["atk"]
            self.add_effects(
                {1: port_eff[max(port_eff.keys())]},
                True,
                1,
            )

        for is_passive, skill_id, is_unique, lvl in (
            (False, "skill_id", False, self.skill_lvl),
            (False, "attack_id", False, 10),
            (True, "ability_id", False, self.ability_lvl),
            (False, "special_id", False, self.actual_special_lvl),
            (True, "crystalis_id", True, 0),
        ):
            if skill_id == "crystalis_id" and "EX" not in self.crys:
                continue
            details = find_all_details(
                is_passive=is_passive, skill_id=self.data[skill_id], is_unique=is_unique
            )
            self.add_effects(
                details, is_unique, lvl, ignore_buff_mult=skill_id == "crystalis_id"
            )

    def is_valid_support(self, target):
        return target in (self.data["role"], self.data["element"])

    def get_support_effect(self):
        supp_eff = find_all_details(
            is_passive=True, skill_id=self.data["support_id"], is_unique=False
        )
        skill_details = {
            k: v
            for k, v in supp_eff.items()
            if int(str(get_idx(v))[-2:]) == self.support_lvl
        }
        return self.data["support_target"], skill_details

    def get_special_dmg(self):
        # TODO: Make this work for multi targets (need to also make break gauge and def be different for each opponent)
        #  range 1 == Target,
        #  range 2 == proximity with value2 being the proximity dmg
        #  range 3 == aoe
        # TODO: Add "startConditionSetIdCsv" condition (Example Oriko dmg)
        return (
            sum(
                (
                    v["value1"]
                    for v in find_all_details(
                        is_passive=False,
                        skill_id=self.data["special_id"],
                        is_unique=False,
                    ).values()
                    if int(str(get_idx(v))[-2:]) == self.actual_special_lvl
                    and v["abilityEffectType"] in ("DMG_ATK", "DMG_DEF")
                )
            )
            / 1000
        )

    def __repr__(self) -> str:
        return f"""{self.name} A{self.ascension}
  Stats:    base_atk={self.base_atk:.0f}, atk_bonus_flat={self.atk_bonus_flat:.0f}, buff_mult={self.buff_mult:.1f}, debuff_mul={self.debuff_mult:.1f}
  Support:  {self.support.name if self.support else None}
  Portrait: {self.portrait}
  Effect:   {({Kioku.known_boosts[k]: v for k, v in self.effects.items() if k in Kioku.known_boosts})}
"""

    def add_effects(self, details: dict, is_unique, lvl, ignore_buff_mult=False):
        conds = {}

        skill_details = [
            v
            for v in details.values()
            if (is_unique or int(str(get_idx(v))[-2:]) == lvl)
            and (self.is_dps or v["range"] not in (-1,))
        ]
        for skill in skill_details:
            if not skill["activeConditionSetIdCsv"]:
                continue
            start_cond = (
                int(skill["startConditionSetIdCsv"])
                if skill["startConditionSetIdCsv"] != ""
                else 0
            )
            if conds.get(skill["activeConditionSetIdCsv"], 0) < start_cond:
                conds[skill["activeConditionSetIdCsv"]] = start_cond

        for skill in skill_details:
            cond_id: str = skill["activeConditionSetIdCsv"]
            cond_id_int = int(cond_id or 0)
            if (
                cond_id in conds
                and int(skill["startConditionSetIdCsv"]) != conds[cond_id]
            ):
                continue

            if cond_id == "" or cond_id_int not in battle_conditions:
                pass
            else:
                try:
                    if Kioku.known_conditions[cond_id]():
                        continue
                except KeyError as exc:
                    raise KeyError(
                        "Unknown condition: ",
                        (
                            battle_conditions[cond_id_int]
                            if cond_id_int in battle_conditions
                            else cond_id_int
                        ),
                    ) from exc

            eff = skill["value1"]
            if (times_applied := skill.get("value2", 0)) != 0:
                eff *= times_applied
            if skill["abilityEffectType"] in (
                "DWN_DEF_RATIO",
                "DWN_DEF_ACCUM_RATIO",
                "UP_RCV_DMG_RATIO",
            ):
                eff *= self.debuff_mult
            else:
                if not ignore_buff_mult:
                    eff *= self.buff_mult

            if skill["element"] and element_map[skill["element"]] != self.dps_element:
                pass
            elif skill["abilityEffectType"] in (
                "DWN_DEF_RATIO",
                "DWN_DEF_ACCUM_RATIO",
            ):
                if skill["abilityEffectType"] not in self.effects:
                    self.effects[skill["abilityEffectType"]] = [eff]  # type: ignore
                else:
                    self.effects[skill["abilityEffectType"]].append(eff)  # type: ignore

            elif skill["abilityEffectType"] == "UP_ELEMENT_DMG_RATE_RATIO":
                self.effects["UP_GIV_DMG_RATIO"] += eff

            elif skill["abilityEffectType"] == "WEAKNESS":
                if "DWN_DEF_RATIO" in self.effects:
                    self.effects["DWN_DEF_RATIO"].append(eff)  # type: ignore
                else:
                    self.effects["DWN_DEF_RATIO"] = [eff]  # type: ignore

            else:
                self.effects[skill["abilityEffectType"]] += eff

    def get_key(self):
        return (
            self.name,
            self.dps_element,
            self.kioku_lvl,
            self.magic_lvl,
            self.heartphial_lvl,
            self.portrait,
            self.support.get_key() if self.support else None,
            self.is_dps,
            self.crys_key,
            self.ascension,
            self.special_lvl,
        )

    @classmethod
    def from_key(cls, key):
        (
            name,
            dps_element,
            kioku_lvl,
            magic_lvl,
            heartphial_lvl,
            portrait,
            support_key,
            is_dps,
            crys,
            ascension,
            special_lvl,
        ) = key
        return get_kioku(
            name=name,
            dps_element=dps_element,
            kioku_lvl=kioku_lvl,
            magic_lvl=magic_lvl,
            heartphial_lvl=heartphial_lvl,
            portrait=portrait,
            support_key=support_key,
            is_dps=is_dps,
            crys=crys,
            ascension=ascension,
            special_lvl=special_lvl,
        )


@lru_cache(maxsize=None)
def get_kioku(
    name: str,
    dps_element: str | None = None,
    kioku_lvl=Kioku.max_lvl,
    magic_lvl=Kioku.max_magic_lvl,
    heartphial_lvl=Kioku.max_heartphial_lvl,
    portrait: str | None = None,
    support_key=None,
    is_dps=False,
    crys=None,
    ascension=Kioku.max_ascension,
    special_lvl=10,
):
    support = Kioku.from_key(support_key) if support_key else None
    return Kioku(
        name,
        dps_element=dps_element,
        kioku_lvl=kioku_lvl,
        magic_lvl=magic_lvl,
        heartphial_lvl=heartphial_lvl,
        portrait=portrait,
        support=support,
        is_dps=is_dps,
        crys=crys,
        ascension=ascension,
        special_lvl=special_lvl,
    )


class Team:
    def __init__(self, kiokus: list[Kioku], debug=False) -> None:
        self.team = kiokus
        self.dps = [kioku for kioku in kiokus if kioku.is_dps][0]
        self.supports = [kioku for kioku in kiokus if not kioku.is_dps]
        self.all_effects = defaultdict(int)
        self.all_effects["def%"] = 1
        self.debug = debug
        self.setup()

    def setup(self):
        for kioku in self.team:
            if self.debug:
                print(kioku)
            for eff, val in kioku.effects.items():
                if eff in (
                    "DWN_DEF_RATIO",
                    "DWN_DEF_ACCUM_RATIO",
                ):
                    for v in val:  # type: ignore
                        self.all_effects["def%"] *= 1 - (v / 1000)
                elif eff in ("UP_CTD_FIXED", "UP_CTD_ACCUM_RATIO", "UP_CTD_RATIO"):
                    self.all_effects["cd"] += val
                else:
                    self.all_effects[eff] += val
        if self.debug:
            print(
                f"Total effects: {({k: v for k, v in self.all_effects.items() if k in Kioku.known_boosts})}"
            )

        if leftover := (
            self.all_effects.keys() - Kioku.known_boosts.keys() - Kioku.non_boosts
        ):
            raise ValueError("Found unknown effects", leftover)

    def calculate_max_dmg(
        self,
        base_def=1300,
        def_up=0,
        atk_down=0,
        is_break=True,
        is_elemt_weak=True,
        does_crit=True,
    ):
        special = self.dps.get_special_dmg()

        # Dmg formula copied from https://docs.google.com/spreadsheets/d/1AZhIqAazG_B99bxPWBbsMxKJ_hF24wwiXProgSshsmk/edit?gid=557838793#gid=557838793
        atk_pluss = (
            self.all_effects["UP_ATK_RATIO"] + self.all_effects["UP_ATK_ACCUM_RATIO"]
        ) / 1000
        atk_total = (
            self.dps.base_atk * (1 + atk_pluss) * (1 - atk_down)
            + self.dps.atk_bonus_flat
        )
        def_remaining = self.all_effects["def%"]
        def_total = base_def * (1 + def_up) * def_remaining
        crit_rate = 0.1 + (
            (self.all_effects["UP_CTR_ACCUM_RATIO"] + self.all_effects["UP_CTR_FIXED"])
            / 1000
        )
        crit_dmg = 0.2 + self.all_effects["cd"] / 1000
        dmg_pluss = self.all_effects["UP_GIV_DMG_RATIO"] / 1000
        elem_dmg_up = self.all_effects["UP_WEAK_ELEMENT_DMG_RATIO"] / 1000
        dmg_taken = self.all_effects["UP_RCV_DMG_RATIO"] / 1000
        elem_res_down = self.all_effects["DWN_ELEMENT_RESIST_ACCUM_RATIO"] / 1000

        base_dmg = (
            special * self.dps.base_atk * (((self.dps.base_atk / 124) ** 1.2) + 12) / 20
        )
        def_factor = min(2, (atk_total + 10) / (def_total + 10) * 0.12)
        crit_factor = 1 + does_crit * crit_dmg
        dmg_dealt_factor = 1 + dmg_pluss
        dmg_taken_factor = 1 + dmg_taken
        elem_resist_factor = 1 + elem_res_down
        effect_elem_factor = 1 + is_elemt_weak * (0.2 + elem_dmg_up)
        break_factor = is_break * max_break + (1 - is_break)

        total = (
            base_dmg
            * def_factor
            * crit_factor
            * dmg_dealt_factor
            * dmg_taken_factor
            * elem_resist_factor
            * effect_elem_factor
            * break_factor
        )

        if self.debug:
            print(
                f"""
Derived:
Ability Multiplier          {special:.2f}
Base Attack                 {self.dps.base_atk:.0f}
Atk Up %                    {atk_pluss:.2f}
Atk Up flat                 {self.dps.atk_bonus_flat:.0f}
Total Atk                   {atk_total:.0f}
Def down%                   {1-def_remaining:.2f}
Total def                   {def_total:.0f}
Crit dmg                    {crit_dmg:.2f}
Dmg Dealt                   {dmg_pluss:.2f}
Elem dmg up                 {elem_dmg_up:.2f}
Dmg Taken                   {dmg_taken:.2f}
Elem Res                    {elem_res_down:.2f}
break                       {max_break:.2f}

Formula:
Ability Damage Base         {base_dmg:.0f}
Defense Factor              {def_factor:.2f}
Critical Factor             {crit_factor:.2f}
Damage Dealt Factor         {dmg_dealt_factor:.2f}
Damage Taken Factor         {dmg_taken_factor:.2f}
Elemental Resistance Factor {elem_resist_factor:.2f}
Effective Element Factor    {effect_elem_factor:.2f}
Break Factor                {break_factor:.2f}
Result                      {total:.0f}"""
            )

        return total, crit_rate


def find_available_kioku(
    show3star=False,
    dps_element=None,
    sout=True,
):
    if not dps_element:
        dps_element = ["Flame", "Aqua", "Forest", "Light", "Dark", "Void"]
    all_ks = {
        3: defaultdict(list),
        4: defaultdict(list),
        5: defaultdict(list),
    }
    for name, k in kioku_data.items():
        if not show3star and k["rarity"] == 3:
            continue
        if k["role"] == "Attacker" and k["element"] not in dps_element:
            continue
        all_ks[k["rarity"]][k["role"]].append((name, k["element"]))

    if sout:
        for rank, xx in all_ks.items():
            print(rank)
            for role, chars in xx.items():
                print(role)
                for c in chars:
                    print(" ", c[0])
            print()
    return all_ks


dmg_pluss_portrait = {
    "Flame": "A Reluctant Coach Steps Up",
    "Aqua": "Futures Felt in Photographs",
    "Forest": "Special Stage Persona",
    "Light": "High Five for Harmony",
    "Dark": "One Time Team-up!",
    "Void": "Pride on the Line",
}


def find_best_team(
    available_kioku: dict,
    old_res: list,
    base_def: int,
    kioku_lvl: int,
    magic_lvl: int,
    include_4star_attackers: bool,
    include_4star_sustains: bool,
    include_4star_supports: bool,
    use_my_team: bool,
    my_chars5: dict,
    sustains_to_consider=("Healer",),  # "Breaker" ,"Defender")
    heartphial_lvl=Kioku.max_heartphial_lvl,
    ascension=Kioku.max_ascension,
):
    if not old_res:
        old_res = []
    old_res_clean = {
        (a, p, sa, s, su1, su2, su3)
        for _, _, a, p, sa, k1, k2, k3, s, su1, su1s, su2, su2s, su3, su3s in old_res
    }

    attackers = [
        a
        for a in available_kioku[5]["Attacker"]
        if not use_my_team or a[0] in my_chars5
    ]

    if include_4star_attackers:
        attackers += available_kioku[4]["Attacker"]

    sustains = [
        c
        for role in sustains_to_consider
        for c, _ in available_kioku[5][role]
        if not use_my_team or c in my_chars5
    ]
    if include_4star_sustains:
        sustains += [
            c
            for role in sustains_to_consider
            for c, _ in available_kioku[4][role]
            if c
            not in (
                "Circle Of Fire",  # Yuma and reira both do nothing, remove one of them
            )
        ]

    supports = [
        (c, True)
        for c, _ in available_kioku[5]["Buffer"]
        if not use_my_team or c in my_chars5
    ] + [
        (c, False)
        for c, _ in available_kioku[5]["Debuffer"]
        if not use_my_team or c in my_chars5
    ]
    if include_4star_supports:
        supports += [
            (c, True)
            for c, _ in available_kioku[4]["Buffer"]
            if c
            not in ("Nightmare Stinger", "Meteor Punch")  # it's never mao or hanna...
        ] + [(c, False) for c, _ in available_kioku[4]["Debuffer"]]

    print(
        f"Finding best team, considering {len(attackers)} attackers, {len(sustains)} sustains, and {len(supports)} supporting\n"
    )

    configs = [tuple(r) for r in old_res]
    if configs:
        print(f"Starts with {len(configs)} known permutations")

    def get_ascension(name) -> int:
        if use_my_team:
            return my_chars5.get(name, ascension)
        return ascension

    if use_my_team and "Flame Waltz" not in my_chars5:
        tsuruno = None
    else:
        tsuruno = get_kioku(
            "Flame Waltz",
            kioku_lvl=kioku_lvl,
            magic_lvl=magic_lvl,
            ascension=get_ascension("Flame Waltz"),
            heartphial_lvl=heartphial_lvl,
        )

    for attacker, atk_elem in tqdm(attackers, desc="Attackers"):
        atk_supports = [
            i
            for i in {"The Universe's Edge", "Oracle Ray", "Fiore Finale"} - {attacker}
            if i in my_chars5
        ]
        if not atk_supports:
            atk_supports = ("Ryushin Spiral Fury",)

        for attacker_support in tqdm(
            atk_supports,
            desc=f"Attacker Supp ({attacker})",
            leave=False,
        ):
            for attacker_portrait in tqdm(
                (
                    "A Dream of a Little Mermaid",
                    "The Savior's Apostle",
                    dmg_pluss_portrait[atk_elem],
                ),
                desc=f"Portrait ({attacker_support})",
                leave=False,
            ):
                for sustain in tqdm(
                    sustains,
                    desc=f"Sustains ({attacker_portrait})",
                    leave=False,
                ):
                    something_new = False
                    for support_list in tqdm(
                        combinations(supports, 3),
                        desc=f"Supports ({sustain})",
                        leave=False,
                        total=comb(len(supports), 3),
                    ):
                        supp_list = [s for s, _ in support_list]
                        if (
                            attacker,
                            attacker_portrait,
                            attacker_support,
                            sustain,
                            *supp_list,
                        ) in old_res_clean:
                            continue

                        support_supports = []
                        if "Flame Waltz" not in supp_list:
                            support_supports = [
                                [tsuruno if j == i else None for j in range(3)]
                                for i in range(3)
                                if support_list[i][1]
                            ]

                        if not support_supports:
                            support_supports = [[None, None, None]]

                        for attacker_crys in combinations(Kioku.available_dps_crys, 3):
                            for support_support in support_supports:
                                something_new = True
                                team = Team(
                                    [
                                        Kioku(
                                            attacker,
                                            dps_element=atk_elem,
                                            portrait=attacker_portrait,
                                            crys=attacker_crys,
                                            support=get_kioku(
                                                attacker_support, kioku_lvl=104
                                            ),
                                            is_dps=True,
                                            kioku_lvl=kioku_lvl,
                                            magic_lvl=magic_lvl,
                                            heartphial_lvl=heartphial_lvl,
                                            ascension=get_ascension(attacker),
                                        ),
                                        get_kioku(
                                            sustain,
                                            dps_element=atk_elem,
                                            kioku_lvl=kioku_lvl,
                                            magic_lvl=magic_lvl,
                                            heartphial_lvl=heartphial_lvl,
                                            ascension=get_ascension(sustain),
                                        ),
                                        get_kioku(
                                            supp_list[0],
                                            support_key=(
                                                support_support[0].get_key()
                                                if support_support[0]
                                                else None
                                            ),
                                            dps_element=atk_elem,
                                            kioku_lvl=kioku_lvl,
                                            magic_lvl=magic_lvl,
                                            heartphial_lvl=heartphial_lvl,
                                            ascension=get_ascension(supp_list[0]),
                                        ),
                                        get_kioku(
                                            supp_list[1],
                                            support_key=(
                                                support_support[1].get_key()
                                                if support_support[1]
                                                else None
                                            ),
                                            dps_element=atk_elem,
                                            kioku_lvl=kioku_lvl,
                                            magic_lvl=magic_lvl,
                                            heartphial_lvl=heartphial_lvl,
                                            ascension=get_ascension(supp_list[1]),
                                        ),
                                        get_kioku(
                                            supp_list[2],
                                            support_key=(
                                                support_support[2].get_key()
                                                if support_support[2]
                                                else None
                                            ),
                                            dps_element=atk_elem,
                                            kioku_lvl=kioku_lvl,
                                            magic_lvl=magic_lvl,
                                            heartphial_lvl=heartphial_lvl,
                                            ascension=get_ascension(supp_list[2]),
                                        ),
                                    ]
                                )

                                dmg, crit_rate = team.calculate_max_dmg(
                                    base_def=base_def
                                )
                                configs.append(
                                    (
                                        int(dmg),
                                        round(100 * crit_rate, 0),
                                        attacker,
                                        attacker_portrait,
                                        attacker_support,
                                        *attacker_crys,
                                        sustain,
                                        *[
                                            item
                                            for pair in zip(
                                                supp_list,
                                                [
                                                    (
                                                        "any supp"
                                                        if s is None
                                                        else "Tsuruno"
                                                    )
                                                    for s in support_support
                                                ],
                                            )
                                            for item in pair
                                        ],
                                    )
                                )
                    if something_new:
                        yield sorted(configs, reverse=True)


def run(
    base_def: int,
    max_break_mult: int,
    enemies_on_stage: int,
    kioku_lvl: int,
    magic_lvl: int,
    use_my_team: bool,
    include_4star_attackers: bool,
    include_4star_sustains: bool,
    include_4star_supports: bool,
    name: str,
    stage_weak_elements: list,
    overwrite_default=False,
):
    default_file_name = (
        f"def_{base_def}_break_{max_break_mult}_ml_{magic_lvl}_kl_{kioku_lvl}.json"
    )
    file_name = (
        f"{(name + "_") if name else ""}dmg_calc_{"custom_" if use_my_team else ""}"
        + default_file_name
    )

    print(
        f"""\
Running with config: 
base_def = {base_def}
max_break_mult = {max_break_mult}%
kioku_lvl = {kioku_lvl}
magic_lvl = {magic_lvl}
use_my_team = {use_my_team}
include_4star_attackers = {include_4star_attackers}
include_4star_sustains = {include_4star_sustains}
include_4star_supports = {include_4star_supports}
name = {name}
stage_weak_elements = {stage_weak_elements}
"""
    )

    with open(
        f"my_team{("_" + name) if name else ""}.json", "r", encoding="utf-8"
    ) as f:
        my_chars5: dict = json.load(f)
    try:
        with open(
            os.path.join("history", f"prev_team{("_" + name) if name else ""}.json"),
            "r",
            encoding="utf-8",
        ) as f:
            prev_chars5: dict = json.load(f)
    except FileNotFoundError:
        prev_chars5 = {}

    if magic_lvl < 120:
        print("WARNING: magic lvl below 120 not accounted for in ATK or ability levels")
    first = True
    global max_break, amount_enemies
    amount_enemies = enemies_on_stage
    max_break = max_break_mult / 100
    available_kioku = find_available_kioku(dps_element=stage_weak_elements, sout=False)

    try:
        with open(
            os.path.join("results", "a_" + file_name), "r", encoding="utf-8"
        ) as f:
            r1 = json.load(f)
    except (FileNotFoundError, json.decoder.JSONDecodeError):
        r1 = []
    try:
        with open(
            os.path.join("results", "b_" + file_name), "r", encoding="utf-8"
        ) as f:
            r2 = json.load(f)
    except (FileNotFoundError, json.decoder.JSONDecodeError):
        r2 = []

    res = r1 if len(r1) > len(r2) else r2
    if not res:
        print("Loading default data from", default_file_name)
        try:
            with gzip.open(
                os.path.join("base_data", default_file_name),
                "rt",
                encoding="utf-8",
            ) as f:
                res = json.load(f)
            with open(
                os.path.join("base_data", "default_team.json"),
                "r",
                encoding="utf-8",
            ) as f:
                prev_chars5: dict = json.load(f)
        except FileNotFoundError:
            res = []
            prev_chars5 = {}

    remove_from_precomputed = [
        k for k, v in my_chars5.items() if k in prev_chars5 and v != prev_chars5[k]
    ] + list(set(prev_chars5) - set(my_chars5))
    if remove_from_precomputed:
        print("Removing precomputed runs with:", remove_from_precomputed)

    res = [r for r in res if all(rs not in remove_from_precomputed for rs in r)]

    flip = True
    for res in find_best_team(
        available_kioku=available_kioku,
        old_res=res,
        base_def=base_def,
        kioku_lvl=kioku_lvl,
        magic_lvl=magic_lvl,
        include_4star_attackers=include_4star_attackers,
        include_4star_sustains=include_4star_sustains,
        include_4star_supports=include_4star_supports,
        use_my_team=use_my_team,
        my_chars5=my_chars5,
    ):
        flip = not flip
        with open(
            os.path.join("results", ("a_" if flip else "b_") + file_name),
            "w",
            encoding="utf-8",
        ) as f:
            json.dump(res, f, sort_keys=False, indent=2, ensure_ascii=False)
        if first:
            first = False
            with open(
                os.path.join(
                    "history", f"prev_team{("_" + name) if name else ""}.json"
                ),
                "w",
                encoding="utf-8",
                newline="\n",
            ) as f:
                json.dump(my_chars5, f, indent=4, sort_keys=True, ensure_ascii=False)

    res = [i for i in res if i[8] not in ("Baldamente Fortissimo",)]
    # Filter sustain not wanted to be displayed
    print(
        f"""Considered {len(res)} permutations dealing from {res[-1][0]:,.0f} to {res[0][0]:,.0f} dmg \
against an opponent with {base_def} def and in {max_break_mult:.0f}% break.
Config: Kioku lvl={kioku_lvl}, Magic lvl={magic_lvl}, and 3 * CD+10% and ATK+60 crys stats on attacker. {"Custom Kioku selection with custom ascensions" if use_my_team else "All Kioku with A5"}"""
    )
    per_attacker_lists = (
        (a, [r for r in res if r[2] == a][:5])
        for a, _ in available_kioku[5]["Attacker"]
        + (available_kioku[4]["Attacker"] if include_4star_attackers else [])
    )
    per_attacker_lists = [(t, r) for t, r in per_attacker_lists if r]
    for title, r in (
        ("Total", res[:25]),
        *per_attacker_lists,
    ):
        print(f"{title}:")
        for (
            dmg,
            crit_rate,
            attacker,
            portrait,
            atk_supp,
            attacker_crys1,
            attacker_crys2,
            attacker_crys3,
            sustain,
            supp1,
            supp1supp,
            supp2,
            supp2supp,
            supp3,
            supp3supp,
        ) in r:
            print(
                f"{dmg:13,.0f} dmg {crit_rate:.0f}% CR: '{attacker:30}' w '{portrait:30}' port "
                + f"+ '{atk_supp:20}' supp + '{attacker_crys1+"+"+attacker_crys2+"+"+attacker_crys3:25}' crys. Team: '{sustain:20}' as sustain, "
                + f"'{supp1:22}' w '{supp1supp:8}', '{supp2:22}' w '{supp2supp:8}', '{supp3:22}' w '{supp3supp:8}'"
            )
        print()
    (
        dmg,
        crit_rate,
        attacker,
        portrait,
        atk_supp,
        attacker_crys1,
        attacker_crys2,
        attacker_crys3,
        sustain,
        supp1,
        supp1supp,
        supp2,
        supp2supp,
        supp3,
        supp3supp,
    ) = res[0]
    print(
        f"""Your Best team:
{kioku_data[attacker]["character_en"].split(" ", 1)[0]} {crit_rate:.0f}% crit rate w '{portrait}' portait & {kioku_data[atk_supp]["character_en"].split(" ", 1)[0]} as supp. {attacker_crys1}, {attacker_crys2}, {attacker_crys3} as crys. 
Team: {kioku_data[sustain]["character_en"].split(" ", 1)[0]}, {kioku_data[supp1]["character_en"].split(" ", 1)[0]}{" w Tsuruno support" if supp1supp == "Tsuruno" else ""}, {kioku_data[supp2]["character_en"].split(" ", 1)[0]}{" w Tsuruno support" if supp2supp == "Tsuruno" else ""}, and {kioku_data[supp3]["character_en"].split(" ", 1)[0]}{" w Tsuruno support" if supp3supp == "Tsuruno" else ""}.
"""
    )
    if overwrite_default:
        with gzip.open(
            os.path.join("base_data", default_file_name + ".gz"),
            "wt",
            encoding="utf-8",
        ) as f:
            json.dump(res, f)

        with open(
            os.path.join("base_data", "default_team.json"),
            "w",
            encoding="utf-8",
            newline="\n",
        ) as f:
            json.dump(my_chars5, f, indent=4, sort_keys=True, ensure_ascii=False)


def run_single(team: Team, base_def: int, max_break_mult: int, enemy_count: int):
    global max_break, amount_enemies
    max_break = max_break_mult / 100
    amount_enemies = enemy_count

    dmg, crit_rate = team.calculate_max_dmg(base_def=base_def)
    print(f"{dmg:,.0f} with {crit_rate*100:.0f}% Crit rate")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run simulation on boss")
    parser.add_argument(
        "--custom",
        action=argparse.BooleanOptionalAction,
        default=False,
        help="True to simulate using your team in ``my_team.json``, False to run all 5* as A5. This adds custom to the results filename",
    )
    parser.add_argument(
        "--atk",
        action=argparse.BooleanOptionalAction,
        default=False,
        help="If 4* attackers should be included in the simulator",
    )
    parser.add_argument(
        "--sus",
        action=argparse.BooleanOptionalAction,
        default=False,
        help="If 4* breakers, healers, and shielders should be included in the simulator",
    )
    parser.add_argument(
        "--supp",
        action=argparse.BooleanOptionalAction,
        default=False,
        help="If 4* buffers and debuffers should be included in the simulator",
    )
    parser.add_argument(
        "--name",
        default="",
        help='Name of the run, creates a separate file in ``results`` with the name prefixed after a_ or b_. When using this the team file will look like ``my_team_"name".json``',
    )
    parser.add_argument(
        "--maxbreak",
        default=300,
        type=int,
        help="Max break of the boss as a percentage",
    )
    parser.add_argument(
        "--deff", default=1500, type=int, help="Defense of the boss (check wiki)"
    )
    parser.add_argument(
        "--enemies", default=1, type=int, help="Enemies on stage when using ultimate"
    )
    parser.add_argument("--kiokulvl", default=105, type=int, help="Kioku level")
    parser.add_argument("--magiclvl", default=120, type=int, help="Magic level")
    parser.add_argument(
        "--weak",
        default=["Aqua", "Forest", "Flame"],
        type=list,
        help="The weakness of the stage (what attackers will be considered)",
    )
    parser.add_argument(
        "--default",
        action=argparse.BooleanOptionalAction,
        default=False,
        help="For updating base_data, don't use",
    )
    args = parser.parse_args()

    print(
        "WARNING: This is still very experimental, if the numbers seem way of please reach out to TFF. Also this only takes into account solo enemy bosses for now (Summer SA)"
    )
    run(
        magic_lvl=args.magiclvl,
        kioku_lvl=args.kiokulvl,
        use_my_team=args.custom,
        include_4star_attackers=args.atk,
        include_4star_sustains=args.sus,
        include_4star_supports=args.supp,
        name=args.name,
        base_def=args.deff,
        max_break_mult=args.maxbreak,
        enemies_on_stage=args.enemies,
        stage_weak_elements=args.weak,
        overwrite_default=args.default,
    )
