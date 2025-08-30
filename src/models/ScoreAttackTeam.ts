import { Kioku } from "./Kioku";
import { EnemyTargetTypes, Enemy } from "../types/EnemyTypes";
import { getDescriptionOfCond, isActiveConditionRelevantForScoreAttack, isStartCondRelevantForScoreAttack } from "./BattleConditionParser";
import { KiokuElement } from "../types/KiokuTypes";

const targetTypeAtPosition = [EnemyTargetTypes.L_OTHER, EnemyTargetTypes.L_PROXIMITY, EnemyTargetTypes.TARGET, EnemyTargetTypes.R_PROXIMITY, EnemyTargetTypes.R_OTHER]

const knownBoosts = {
    UP_ATK_RATIO: "Atk%1",
    UP_ATK_ACCUM_RATIO: "Atk%2",
    DEF_MULTIPLIER_TOTAL: "Def% total",
    DWN_DEF_RATIO: "Def%1",
    WEAKNESS: "Def%3",
    DWN_DEF_ACCUM_RATIO: "Def%2",
    UP_CTR_FIXED: "CR1+",
    UP_CTR_ACCUM_RATIO: "CR2+",
    UP_CTD_FIXED: "CD1+",
    UP_CTD_RATIO: "CD3+",
    UP_CTD_ACCUM_RATIO: "CD2+",
    CRIT_DAMAGE_TOTAL: "CD+ total",
    UP_GIV_DMG_RATIO: "DMG Dealt+",
    UP_RCV_DMG_RATIO: "DMG Taken+",
    UP_AIM_RCV_DMG_RATIO: "Elem DMG Taken+",
    DWN_ELEMENT_RESIST_ACCUM_RATIO: "Elem Resist-",
    UP_WEAK_ELEMENT_DMG_RATIO: "Elem Dmg+",
};

const skippable = new Set([
    "ADD_BUFF_TURN",
    "ADD_DEBUFF_TURN",
    "ADDITIONAL_SKILL_ACT",
    "ADDITIONAL_TURN_UNIT_ACT",
    "BARRIER", "DMG_DEF",
    "BLEED_ATK",
    "BURN_ATK",
    "CHARGE",
    "CONSUME_CHARGE_POINT",
    "CONTINUOUS_RECOVERY",
    "CUTOUT",
    "DMG_ATK",
    "DMG_RANDOM",
    "DOWN_SPD_RATIO",
    "DWN_ATK_RATIO",
    "DWN_RCV_DMG_RATIO",
    "DWN_SPD_RATIO",
    "GAIN_CHARGE_POINT",
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
    "UNIQUE_10030301",
    "UP_ABNORMAL_HIT_RATE_RATIO",
    "UP_BREAK_DAMAGE_RECEIVE_RATIO",
    "UP_BREAK_EFFECT",
    "UP_BUFF_EFFECT_VALUE",
    "UP_BUFF_EFFECT_VALUE",
    "UP_DEBUFF_EFFECT_VALUE",
    "UP_DEF_ACCUM_RATIO",
    "UP_DEF_RATIO",
    "UP_EP_RECOVER_RATE_RATIO",
    "UP_GIV_BREAK_POINT_DMG_FIXED",
    "UP_GIV_VORTEX_DMG_RATIO",
    "UP_HEAL_RATE_RATIO",
    "UP_HP_RATIO",
    "UP_RCV_BREAK_POINT_DMG_RATIO",
    "UP_SPD_ACCUM_RATIO", "CURSE_ATK",
    "UP_SPD_FIXED",
    "UP_SPD_RATIO",
    "VORTEX_ATK", // TODO: Make vortex work
]);

export class Team {
    private team: Kioku[];
    private dps: Kioku;
    private all_effects: Record<string, number> = {};
    private extra_effects: Record<string, [Function, number][]> = {};
    private debug: boolean;

    constructor(dps: Kioku, team: Kioku[], debug = false) {
        this.team = team;
        this.dps = dps;
        this.debug = debug;
        this.all_effects["DEF_MULTIPLIER_TOTAL"] = 1
        this.all_effects["CRIT_DAMAGE_TOTAL"] = 0
        console.log(dps, team)
        this.setup();
    }

    private setup() {
        const members: [boolean, Kioku][] = [
            [true, this.dps],
            ...this.team.map(t => [false, t] as [boolean, Kioku])
        ];
        for (const [isDps, kioku] of members) {
            for (let [eff, val] of Object.entries(kioku.effects)) {
                for (const [v, activeCondId, startCondIdCsv, range, element] of val) {
                    if (!isDps && range < 2) continue
                    if (element && element !== this.dps.element) continue
                    if (["DWN_DEF_RATIO", "DWN_DEF_ACCUM_RATIO"].includes(eff)) {
                        eff = "DEF_MULTIPLIER_TOTAL"
                    } else if (["UP_CTD_FIXED", "UP_CTD_ACCUM_RATIO", "UP_CTD_RATIO"].includes(eff)) {
                        eff = "CRIT_DAMAGE_TOTAL"
                    }

                    if (!startCondIdCsv.split(",").every(startCondId =>
                        isStartCondRelevantForScoreAttack(startCondId, kioku.maxMagicStacks))
                    ) continue;

                    const isActiveCond = isActiveConditionRelevantForScoreAttack(activeCondId)
                    if (typeof (isActiveCond) === 'boolean') {
                        if (isActiveCond) {
                            if (eff in this.all_effects) {
                                if (eff === "DEF_MULTIPLIER_TOTAL") {
                                    this.all_effects[eff] *= 1 - v / 1000;
                                } else {
                                    this.all_effects[eff] += v
                                }
                            } else {
                                this.all_effects[eff] = v;
                            }
                        }
                    } else {
                        if (eff in this.extra_effects) {
                            this.extra_effects[eff].push([isActiveCond, v])
                        } else {
                            this.extra_effects[eff] = [[isActiveCond, v]]
                        }
                    }
                }
            }
        }

        if (this.debug) {
            console.log("Total effects", Object.fromEntries(Object.entries(this.all_effects).filter(
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
    ): [number, number, string[]] {
        let dmg;
        let total_dmg = 0;
        let critRate = 0;
        let debugText = ""
        let enemyDied: boolean
        let amountOfEnemies = enemies.filter(e => e.enabled).length
        const debugTexts = ["", "", "", "", ""];
        for (const i of [EnemyTargetTypes.TARGET, EnemyTargetTypes.L_PROXIMITY, EnemyTargetTypes.R_PROXIMITY, EnemyTargetTypes.L_OTHER, EnemyTargetTypes.R_OTHER]) {
            [dmg, critRate, debugText, enemyDied] = this.calculate_single_dmg(i, this.memberForLog(i), enemies[i], amountOfEnemies, atk_down)
            total_dmg += dmg
            if (enemies[i].enabled && enemyDied) amountOfEnemies -= 1
            debugTexts[i] = debugText
        }
        return [total_dmg, Math.round(critRate * 100), debugTexts]
    }

    getEffect(eff: string, amountOfEnemies: number, maxBreak: number): number {
        let val = this.all_effects[eff] || 0
        this.extra_effects[eff]?.forEach(
            ([fun, v]) => {
                if (fun(amountOfEnemies, maxBreak)) {
                    if (eff === "DEF_MULTIPLIER_TOTAL") {
                        val *= 1 - v / 1000;
                    } else {
                        val += v
                    }
                }
            })
        return val
    }

    calculate_single_dmg(
        idx: number,
        kiokuAtPosition: Kioku,
        enemy: Enemy,
        amountOfEnemies: number,
        atk_down: number,
    ): [number, number, string, boolean] {
        const [special, enemyDied] = this.dps.get_special_dmg(targetTypeAtPosition[idx], amountOfEnemies, enemy.maxBreak, enemy.hitsToKill);
        const atk_pluss =
            (this.getEffect("UP_ATK_RATIO", amountOfEnemies, enemy.maxBreak) +
                (this.getEffect("UP_ATK_ACCUM_RATIO", amountOfEnemies, enemy.maxBreak))) /
            1000;
        const atk_total = this.dps.getBaseAtk() * (1 + atk_pluss) * (1 - atk_down) + this.dps.atk_bonus_flat;

        const def_remaining = this.getEffect("DEF_MULTIPLIER_TOTAL", amountOfEnemies, enemy.maxBreak);
        const def_total = enemy.defense * (1 + enemy.defenseUp / 100) * def_remaining;

        const crit_rate =
            (this.dps.critRate +
                (this.getEffect("UP_CTR_ACCUM_RATIO", amountOfEnemies, enemy.maxBreak)) +
                (this.getEffect("UP_CTR_FIXED", amountOfEnemies, enemy.maxBreak))) /
            1000;

        const crit_dmg = (this.dps.critDamage + this.getEffect("CRIT_DAMAGE_TOTAL", amountOfEnemies, enemy.maxBreak)) / 1000;
        const dmg_pluss = (this.getEffect("UP_GIV_DMG_RATIO", amountOfEnemies, enemy.maxBreak)) / 1000;
        const elem_dmg_up = (this.getEffect("UP_WEAK_ELEMENT_DMG_RATIO", amountOfEnemies, enemy.maxBreak)) / 1000;
        const dmg_taken = (this.getEffect("UP_RCV_DMG_RATIO", amountOfEnemies, enemy.maxBreak)) / 1000;
        const elem_res_down = (this.getEffect("DWN_ELEMENT_RESIST_ACCUM_RATIO", amountOfEnemies, enemy.maxBreak)) / 1000;
        const base_dmg = special * this.dps.getBaseAtk() * ((this.dps.getBaseAtk() / 124) ** 1.2 + 12) / 20;

        const def_factor = Math.min(2, ((atk_total + 10) / (def_total + 10)) * 0.12);
        const crit_factor = 1 + (enemy.isCrit ? crit_dmg : 0);
        const dmg_dealt_factor = 1 + dmg_pluss;
        const dmg_taken_factor = 1 + dmg_taken;
        const elem_resist_factor = 1 + elem_res_down;
        const effect_elem_factor = 1 + (enemy.isWeak ? 0.2 + elem_dmg_up : 0);
        const break_factor = (enemy.isBreak ? enemy.maxBreak / 100 : 1);

        const total =
            Number(enemy.enabled) *
            base_dmg *
            def_factor *
            crit_factor *
            dmg_dealt_factor *
            dmg_taken_factor *
            elem_resist_factor *
            effect_elem_factor *
            break_factor;

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
                    if (key.endsWith("Atk")) {
                        val |= 0
                    } else if (["crys_sub", "crys", "data", "support", "supportKey", "knownConditions", "effects"].includes(key)) {
                        return;
                    }

                    return `${["abilityLvl", "ascension"].includes(key) ? `\n${key}` : key} - ${val}`
                }).filter(Boolean)
                : [];

            const formatCondForKioku = ([eff, activeCondId, startCondIdCsv, range, element]: [number, string, string, number, undefined | KiokuElement], idx: number): string => {
                if (element && element !== this.dps.element) return ""
                if (idx !== EnemyTargetTypes.TARGET && range < 2) return ""
                let outString = eff.toString()
                if (activeCondId) {
                    outString += ` if\n    ${activeCondId}${startCondIdCsv ? ` & ${startCondIdCsv}` : ""} - `
                    let isActiveCond = isActiveConditionRelevantForScoreAttack(activeCondId)
                    if (typeof (isActiveCond) !== 'boolean') {
                        isActiveCond = isActiveCond(amountOfEnemies, enemy.maxBreak)
                    }
                    isActiveCond &&= startCondIdCsv.split(",").every((startCondId: string) => isStartCondRelevantForScoreAttack(startCondId, kiokuAtPosition.maxMagicStacks))
                    outString += isActiveCond ? "active" : "disabled"
                    outString += `\n    ${getDescriptionOfCond(activeCondId).match(/.{1,9}/g)?.join("\n    ")}`
                    if (startCondIdCsv) {
                        outString += `\n    & `
                        outString += `\n    ${getDescriptionOfCond(startCondIdCsv).match(/.{1,9}/g)?.join("\n    ")}`
                    }

                }
                return outString
            }

            const effects = kiokuAtPosition ? Object.keys(kiokuAtPosition["effects"]).sort().map(key => {
                if (skippable.has(key)) return;
                return `${key} \n  ${kiokuAtPosition["effects"][key].map(formatCondForKioku).filter(Boolean).join("\n  ")}`
            }).filter(Boolean) : []

            debugText = ` 
DMG CALC MULTIPLIERS:
Ability Mult - ${special * 100 | 0}%
Base Attack  - ${(this.dps.getBaseAtk() | 0).toLocaleString()}
Atk Up %     - ${atk_pluss * 100 | 0}%
Atk Up flat  - ${this.dps.atk_bonus_flat | 0}
Total Atk    - ${(atk_total | 0).toLocaleString()}
Def down%    - ${(1 - def_remaining) * 100 | 0}%
Total def    - ${(def_total | 0).toLocaleString()}
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

        return [total | 0, crit_rate, debugText, enemyDied];
    }
}
