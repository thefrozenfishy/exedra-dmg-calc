import { Kioku } from "./Kioku";
import { EnemyTargetTypes, Enemy } from "../types/EnemyTypes";
import { isActiveConditionRelevantForScoreAttack, isStartCondRelevantForScoreAttack } from "./BattleConditionParser";
import { elementMap, SkillDetail } from "../types/KiokuTypes";

const targetTypeAtPosition = [EnemyTargetTypes.L_OTHER, EnemyTargetTypes.L_PROXIMITY, EnemyTargetTypes.TARGET, EnemyTargetTypes.R_PROXIMITY, EnemyTargetTypes.R_OTHER]

const knownBoosts = {
    UP_ATK_FIXED: "FlatAtk",
    UP_ATK_RATIO: "Atk%1",
    UP_ATK_ACCUM_RATIO: "Atk%2",
    DWN_DEF_RATIO: "Def%1",
    WEAKNESS: "Def%3",
    DWN_DEF_ACCUM_RATIO: "Def%2",
    UP_CTR_FIXED: "CR1+",
    UP_CTR_RATIO: "CR3+",
    UP_CTR_ACCUM_RATIO: "CR2+",
    UP_CTD_FIXED: "CD1+",
    UP_CTD_RATIO: "CD3+",
    UP_CTD_ACCUM_RATIO: "CD2+",
    UP_GIV_DMG_RATIO: "DMG Dealt+",
    UP_ELEMENT_DMG_RATE_RATIO: "Dmg Dealt+ (Elem only)",
    UP_RCV_DMG_RATIO: "DMG Taken+",
    UP_AIM_RCV_DMG_RATIO: "Elem DMG Taken+",
    DWN_ELEMENT_RESIST_ACCUM_RATIO: "Elem Resist-",
    UP_WEAK_ELEMENT_DMG_RATIO: "Elem Dmg+",
    FLAT_ATK: "Flat atk",
};

const skippable = new Set([
    "CONSUME_COUNT_POINT", // TODO: Verify bowmura is correct
    "ADD_BUFF_TURN",
    "ADD_DEBUFF_TURN",
    "ADDITIONAL_SKILL_ACT",
    "ADDITIONAL_TURN_UNIT_ACT",
    "BARRIER",
    "BLEED_ATK",
    "BURN_ATK",
    "CHARGE",
    "CONSUME_CHARGE_POINT",
    "CONTINUOUS_RECOVERY",
    "COUNT", 
    "CURSE_ATK",
    "CUTOUT",
    "DMG_ATK",
    "DMG_DEF",
    "DMG_RANDOM",
    "DOWN_SPD_RATIO",
    "DWN_ATK_RATIO",
    "DWN_RCV_DMG_RATIO",
    "DWN_SPD_RATIO",
    "GAIN_CHARGE_POINT",
    "GAIN_COUNT_POINT",
    "GAIN_EP_FIXED",
    "GAIN_EP_RATIO",
    "GAIN_SP_FIXED",
    "HASTE",
    "IMM_SLIP_DMG",
    "POISON_ATK",
    "RECOVERY_HP_ATK",
    "RECOVERY_HP",
    "REFLECTION_RATIO",
    "REMOVE_ALL_ABNORMAL",
    "REMOVE_ALL_BUFF",
    "SHIELD",
    "SLOW",
    "STUN",
    "SWITCH_SKILL",
    "TSUBAME_CORE", //  Make Ui work
    "TSUBAME_LINK", // TODO: Make Ui work
    "UNIQUE_10030301",
    "UP_ABNORMAL_HIT_RATE_RATIO",
    "UP_BREAK_DAMAGE_RECEIVE_RATIO",
    "UP_BREAK_EFFECT",
    "UP_BUFF_EFFECT_VALUE",
    "UP_BUFF_EFFECT_VALUE",
    "UP_DEBUFF_EFFECT_VALUE",
    "UP_DEF_ACCUM_RATIO",
    "UP_DEF_FIXED",
    "UP_DEF_RATIO",
    "UP_EFFECT_HIT_RATE_RATIO",
    "UP_EFFECT_PARRY_RATE_RATIO",
    "UP_EP_RECOVER_RATE_RATIO",
    "UP_GIV_BREAK_POINT_DMG_FIXED",
    "UP_GIV_SLIP_DMG_RATIO",
    "UP_GIV_VORTEX_DMG_RATIO",
    "UP_HEAL_RATE_RATIO",
    "UP_HP_FIXED",
    "UP_HP_RATIO",
    "UP_RCV_BREAK_POINT_DMG_RATIO",
    "UP_SPD_ACCUM_RATIO",
    "UP_SPD_FIXED",
    "UP_SPD_RATIO",
    "VORTEX_ATK", // TODO: Make vortex work
]);

export class ScoreAttackTeam {
    private team: Kioku[];
    private dps: Kioku;
    private all_effects: Record<string, number> = {};
    private extra_effects: Record<string, [Function, number][]> = {};
    private debug: boolean;
    private debugTexts: Record<string, Record<string, [SkillDetail, number][]>> = {}

    constructor(dps: Kioku, team: Kioku[], debug = false) {
        this.team = team;
        this.dps = dps;
        this.debug = debug;
        this.all_effects["DWN_DEF_ACCUM_RATIO"] = 1
        this.all_effects["DWN_DEF_RATIO"] = 1
        this.setup();
    }

    private setup() {
        const members: [boolean, Kioku][] = [
            [true, this.dps],
            ...this.team.map(t => [false, t] as [boolean, Kioku])
        ];
        for (const [isDps, kioku] of members) {
            this.debugTexts[kioku.name] = {}
            for (let [skill_id, details] of Object.entries(kioku.effects)) {
                for (let detail of details) {
                    if (skippable.has(detail.abilityEffectType)) continue
                    if (!isDps && detail.range < 1) continue
                    if (detail.element && elementMap[detail.element] !== this.dps.element) continue

                    if (detail.startConditionSetIdCsv.split(",").some(startCondId =>
                        !isStartCondRelevantForScoreAttack(startCondId, kioku.maxMagicStacks))
                    ) continue;

                    let valueTotal = detail.value1
                    // For multi-value skills, value2 is the max multiplier 
                    valueTotal *= detail.value2 || 1

                    detail.activeConditionSetIdCsv.split(",").forEach(activeCondId => {
                        const isActiveCond = isActiveConditionRelevantForScoreAttack(activeCondId)
                        if (typeof (isActiveCond) === 'boolean') {
                            if (isActiveCond) {
                                if (detail.abilityEffectType in this.all_effects) {
                                    if (["DWN_DEF_RATIO", "DWN_DEF_ACCUM_RATIO"].includes(detail.abilityEffectType)) {
                                        this.all_effects[detail.abilityEffectType] *= 1 - valueTotal / 1000;
                                    } else {
                                        this.all_effects[detail.abilityEffectType] += valueTotal
                                    }
                                } else {
                                    this.all_effects[detail.abilityEffectType] = valueTotal;
                                }
                                if (!(detail.abilityEffectType in this.debugTexts[kioku.name])) {
                                    this.debugTexts[kioku.name][detail.abilityEffectType] = []
                                }
                                this.debugTexts[kioku.name][detail.abilityEffectType].push([detail, valueTotal])
                            }
                        } else {
                            if (!(detail.abilityEffectType in this.extra_effects)) {
                                this.extra_effects[detail.abilityEffectType] = []
                            }
                            this.extra_effects[detail.abilityEffectType].push([isActiveCond, valueTotal])
                        }
                    })
                }
            }
        }

        if (this.debug) {
            console.log("Total effects", Object.fromEntries(Object.entries(this.all_effects).filter(
                ([key, _]) => (key in knownBoosts)
            )));
            console.log("Extra effects", Object.fromEntries(Object.entries(this.extra_effects).filter(
                ([key, _]) => (key in knownBoosts)
            )));
        }

        const leftover = Object.keys(this.all_effects).filter(
            key => !(key in knownBoosts) && !skippable.has(key)
        );
        if (leftover.length > 0) {
            throw new Error(`Found unknown effects: ${leftover.join(", ")}`);
        }
    }

    memberForLog = (idx: number): Kioku => {
        if (idx === EnemyTargetTypes.TARGET) return this.dps
        if (idx < EnemyTargetTypes.TARGET) return this.team[idx]
        return this.team[idx - 1]
    }

    calculate_max_dmg(
        enemies: Enemy[],
        atk_down = 0,
    ): [number, number, number, string[]] {
        let dmg, avg_dmg, enemyDied;
        let total_dmg = 0;
        let average_dmg = 0;
        let critRate = 0;
        let debugText = ""
        let amountOfEnemies = enemies.filter(e => e.enabled).length
        const debugTexts = ["", "", "", "", ""];
        for (const i of [EnemyTargetTypes.TARGET, EnemyTargetTypes.L_PROXIMITY, EnemyTargetTypes.R_PROXIMITY, EnemyTargetTypes.L_OTHER, EnemyTargetTypes.R_OTHER]) {
            [dmg, avg_dmg, critRate, debugText, enemyDied] = this.calculate_single_dmg(i, this.memberForLog(i), enemies[i], amountOfEnemies, atk_down)
            total_dmg += dmg | 0
            average_dmg += avg_dmg | 0
            if (enemies[i].enabled && enemyDied) amountOfEnemies -= 1
            debugTexts[i] = debugText
        }
        return [total_dmg, average_dmg, Math.round(critRate * 100), debugTexts]
    }

    getEffect(eff: string, amountOfEnemies: number, maxBreak: number): number {
        let val = this.all_effects[eff] || 0
        this.extra_effects[eff]?.forEach(
            ([fun, v]) => {
                if (fun(amountOfEnemies, maxBreak)) {
                    if (["DWN_DEF_RATIO", "DWN_DEF_ACCUM_RATIO"].includes(eff)) {
                        val *= 1 - v / 1000;
                    } else {
                        val += v
                    }
                }
            })
        return val
    }

    get_special_dmg(targetType: EnemyTargetTypes, amountOfEnemies: number, maxBreak: number, nrHitThatKills: number): [number, boolean] {
        let total_dmg = 0;
        for (const detail of Object.values(this.dps.effects[this.dps.data.special_id])) {
            let delta_dmg = 0
            if (!detail.abilityEffectType.startsWith("DMG_")) continue
            detail.activeConditionSetIdCsv.split(",").forEach(activeCondId => {
                const isActiveCond = isActiveConditionRelevantForScoreAttack(activeCondId)
                if (typeof (isActiveCond) === 'boolean') {
                    if (!isActiveCond) return
                } else {
                    if (!isActiveCond(nrHitThatKills > 1 ? amountOfEnemies : amountOfEnemies - 1, maxBreak)) return;
                }

                if (detail.abilityEffectType === "DMG_RANDOM" && targetType === EnemyTargetTypes.TARGET) delta_dmg = detail.value1 * detail.value2;
                // We make random only hit lowest def for simplicity, since this is max dmg
                else if (detail.range === 3) delta_dmg = detail.value1; // 3 is all enemies
                else if (detail.range === 2 && (targetType === EnemyTargetTypes.L_PROXIMITY || targetType === EnemyTargetTypes.R_PROXIMITY)) delta_dmg = detail.value2;
                else if (targetType === EnemyTargetTypes.TARGET) delta_dmg = detail.value1;

                if (!(detail.abilityEffectType in this.debugTexts[this.dps.name])) {
                    this.debugTexts[this.dps.name][detail.abilityEffectType] = []
                }
                this.debugTexts[this.dps.name][detail.abilityEffectType].push([detail, delta_dmg])
            })
            total_dmg += delta_dmg
        }
        return [total_dmg / 1000, nrHitThatKills < 1]
    }

    calculate_single_dmg(
        idx: number,
        kiokuAtPosition: Kioku,
        enemy: Enemy,
        amountOfEnemies: number,
        atk_down: number,
    ): [number, number, number, string, boolean] {
        const [special, enemyDied] = this.get_special_dmg(targetTypeAtPosition[idx], amountOfEnemies, enemy.maxBreak, enemy.hitsToKill);
        const atk_pluss =
            (this.getEffect("UP_ATK_RATIO", amountOfEnemies, enemy.maxBreak) +
                (this.getEffect("UP_ATK_ACCUM_RATIO", amountOfEnemies, enemy.maxBreak))) /
            1000;
        const flat_atk = this.getEffect("UP_ATK_FIXED", amountOfEnemies, enemy.maxBreak)
        const atk_total = this.dps.getBaseAtk() * (1 + atk_pluss) * (1 - atk_down) + flat_atk

        let def_remaining = (
            this.getEffect("DWN_DEF_ACCUM_RATIO", amountOfEnemies, enemy.maxBreak) *
            this.getEffect("DWN_DEF_RATIO", amountOfEnemies, enemy.maxBreak)
        );
        if ("WEAKNESS" in this.all_effects) { // Weakness may be applied only once, and acts as -10% def
            def_remaining *= 0.9
        }
        const def_total = enemy.defense * (1 + enemy.defenseUp / 100) * def_remaining;

        const uncapped_crit_rate = (this.dps.critRate +
            (this.getEffect("UP_CTR_ACCUM_RATIO", amountOfEnemies, enemy.maxBreak)) +
            (this.getEffect("UP_CTR_FIXED", amountOfEnemies, enemy.maxBreak)) +
            (this.getEffect("UP_CTR_RATIO", amountOfEnemies, enemy.maxBreak))) /
            1000

        const crit_rate = Math.min(1, uncapped_crit_rate)

        const crit_dmg = (this.dps.critDamage +
            this.getEffect("UP_CTD_FIXED", amountOfEnemies, enemy.maxBreak) +
            this.getEffect("UP_CTD_RATIO", amountOfEnemies, enemy.maxBreak) +
            this.getEffect("UP_CTD_ACCUM_RATIO", amountOfEnemies, enemy.maxBreak)
        ) / 1000;
        const dmg_pluss = (
            this.getEffect("UP_GIV_DMG_RATIO", amountOfEnemies, enemy.maxBreak) +
            this.getEffect("UP_ELEMENT_DMG_RATE_RATIO", amountOfEnemies, enemy.maxBreak)
        ) / 1000;
        const elem_dmg_up = (this.getEffect("UP_WEAK_ELEMENT_DMG_RATIO", amountOfEnemies, enemy.maxBreak)) / 1000;
        const dmg_taken = (this.getEffect("UP_RCV_DMG_RATIO", amountOfEnemies, enemy.maxBreak)) / 1000;
        const elem_res_down = (this.getEffect("DWN_ELEMENT_RESIST_ACCUM_RATIO", amountOfEnemies, enemy.maxBreak)) / 1000;
        const base_dmg = special * this.dps.getBaseAtk() * ((this.dps.getBaseAtk() / 124) ** 1.2 + 12) / 20;

        const def_factor = Math.min(2, ((atk_total + 10) / (def_total + 10)) * 0.12);
        const crit_factor = 1 + (enemy.isCrit ? crit_dmg : 0);
        const crit_average = 1 + (crit_rate * crit_dmg);
        const dmg_dealt_factor = 1 + dmg_pluss;
        const dmg_taken_factor = 1 + dmg_taken;
        const elem_resist_factor = 1 + elem_res_down;
        const effect_elem_factor = 1 + (enemy.isWeak ? 0.2 + elem_dmg_up : 0);
        const break_factor = (enemy.isBreak ? enemy.maxBreak / 100 : 1);

        const before_crit_total =
            Number(enemy.enabled) *
            base_dmg *
            def_factor *
            dmg_dealt_factor *
            dmg_taken_factor *
            elem_resist_factor *
            effect_elem_factor *
            break_factor;
        const total = before_crit_total * crit_factor
        const average_total = before_crit_total * crit_average

        let debugText = "";
        if (this.debug) {

            const lines = kiokuAtPosition
                ? Object.keys(kiokuAtPosition).sort().sort((a, b) => {
                    if (a.endsWith("Atk")) return -1;
                    if (b.endsWith("Atk")) return 1;
                    if (a.endsWith("Lvl")) return -1;
                    if (b.endsWith("Lvl")) return 1;
                    return 0
                }).map(key => {
                    let val = (kiokuAtPosition as any)[key]
                    if (key === "portraitStats") {
                        val = val?.["atk"]
                        key = "PortraitAtk"
                    }
                    if (key === "support") {
                        val = val?.getBaseAtk()
                        key = "SupportAtk"
                    }
                    if (key.endsWith("Atk") || key.endsWith("Def") || key.endsWith("Hp")) {
                        val |= 0
                    } else if (["name", "role", "element", "portrait", "crys_sub", "crys", "data", "support", "supportKey", "knownConditions", "effects"].includes(key)) {
                        return;
                    }

                    return `${["abilityLvl", "ascension"].includes(key) ? `\n${key}` : key} - ${val}`
                }).filter(Boolean)
                : [];

            const effects = kiokuAtPosition ? Object.keys(this.debugTexts[kiokuAtPosition.name]).sort().map(key =>
                `${key} \n ${this.debugTexts[kiokuAtPosition.name][key].sort((a, b) => a[1] - b[1]).map(([d, n]) => {
                    let st = ""
                    if (d.activeConditionSetIdCsv.length) {
                        st += "A" + d.activeConditionSetIdCsv
                    }
                    if (d.startConditionSetIdCsv.length) {
                        if (st.length) {
                            st += " & "
                        }
                        st += "S" + d.startConditionSetIdCsv
                    }
                    let outString = `${n / 10}`
                    if (st.length) {
                        outString += " => " + st
                    }
                    const desc = d.description.match(/.{1,18}/g)?.join("\n   ")
                    outString += `${desc ? `\n  ${desc}` : ''}`
                    return outString
                }
                ).join("\n ")}`
            ).filter(Boolean) : []


            debugText = ` 
DMG CALC MULTIPLIERS:
DPS stats:
Ability Mult - ${special * 100 | 0}%
Base Attack  - ${(this.dps.getBaseAtk() | 0).toLocaleString()}
Atk Up %     - ${atk_pluss * 100 | 0}%
Atk Up flat  - ${flat_atk | 0}
Total Atk    - ${(atk_total | 0).toLocaleString()}
Def down%    - ${(1 - def_remaining) * 100 | 0}%
Total def    - ${(def_total | 0).toLocaleString()}
Crit rate    - ${uncapped_crit_rate * 100 | 0}%
Crit dmg     - ${crit_dmg * 100 | 0}%
Dmg Dealt    - ${dmg_pluss * 100 | 0}%
Elem dmg up  - ${elem_dmg_up * 100 | 0}%
Dmg Taken    - ${dmg_taken * 100 | 0}%
Elem Res     - ${elem_res_down * 100 | 0}%
atk down     - ${atk_down * 100 | 0}%

FORMULA:
Ability dmg  - ${(base_dmg | 0).toLocaleString()}
Def Factor   - ${def_factor * 100 | 0}%
Crit Factor  - ${crit_factor * 100 | 0}%
Dmg Dlt Fact - ${dmg_dealt_factor * 100 | 0}%
Dmg Tkn Fact - ${dmg_taken_factor * 100 | 0}%
Elem ResFact - ${elem_resist_factor * 100 | 0}%
EffElem Fact - ${effect_elem_factor * 100 | 0}%
Break Factor - ${break_factor * 100 | 0}%
Result       - ${(total | 0).toLocaleString()}
AverageDmg   - ${(average_total | 0).toLocaleString()}

ENEMY STATS:
enemiesAlive - ${amountOfEnemies}    
base_def     - ${enemy.defense.toLocaleString()}    
break        - ${enemy.maxBreak}% 
def_up       - ${enemy.defenseUp}%  
is_break     - ${enemy.isBreak}    
is_elemt_weak- ${enemy.isWeak}         
does_crit    - ${enemy.isCrit}         
enabled      - ${enemy.enabled}
died         - ${enemyDied}

KIOKU STATS:
${lines.join("\n")}

KIOKU EFFECTS:
${effects.join("\n")}`;
        }

        return [total | 0, average_total, crit_rate, debugText, enemyDied];
    }
}
