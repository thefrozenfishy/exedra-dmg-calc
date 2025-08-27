import { Kioku } from "./Kioku";
import { EnemyTargetTypes, Enemy } from "../types/EnemyTypes";
import { getDescriptionOfCond, isActiveForScoreAttack } from "./BattleConditionParser";

const targetTypeAtPosition = [EnemyTargetTypes.OTHER, EnemyTargetTypes.PROXIMITY, EnemyTargetTypes.TARGET, EnemyTargetTypes.PROXIMITY, EnemyTargetTypes.OTHER]

export class Team {
    private team: Kioku[];
    private dps: Kioku;
    private all_effects: Record<string, number> = {};
    private extra_effects: Record<string, (Function | number | string)[]> = {};
    private debug: boolean;

    constructor(kiokus: Kioku[], debug = false) {
        this.team = kiokus;
        this.dps = kiokus.find(k => k.isDps)!;
        this.debug = debug;
        this.all_effects["DEF_MULTIPLIER_TOTAL"] = 1
        this.all_effects["CRIT_DAMAGE_TOTAL"] = 0
        this.setup();
    }

    private setup() {
        for (const kioku of this.team) {
            for (let [eff, val] of Object.entries(kioku.effects)) {
                for (const [v, condId] of val) {
                    if (["DWN_DEF_RATIO", "DWN_DEF_ACCUM_RATIO"].includes(eff)) {
                        eff = "DEF_MULTIPLIER_TOTAL"
                    } else if (["UP_CTD_FIXED", "UP_CTD_ACCUM_RATIO", "UP_CTD_RATIO"].includes(eff)) {
                        eff = "CRIT_DAMAGE_TOTAL"
                    }

                    const isActiveCond = isActiveForScoreAttack(condId)
                    if (typeof (isActiveCond) === 'boolean') {
                        if (!isActiveCond) continue;
                    } else {
                        if (eff in this.extra_effects) {
                            this.extra_effects[eff].push([isActiveCond, v])
                        } else {
                            this.extra_effects[eff] = [[isActiveCond, v]]
                        }
                    continue;
                    }

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
            }
        }

        if (this.debug) {
            console.log("Total effects", Object.fromEntries(Object.entries(this.all_effects).filter(
                ([key, _]) => (key in Kioku.knownBoosts)
            )));
        }

        const leftover = Object.keys(this.all_effects).filter(
            key => !(key in Kioku.knownBoosts) && !Kioku.skippable.has(key)
        );
        if (leftover.length > 0) {
            throw new Error(`Found unknown effects: ${leftover.join(", ")}`);
        }
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
        for (const i of [2, 1, 3, 0, 4]) {
            [dmg, critRate, debugText, enemyDied] = this.calculate_single_dmg(i, this.team[i], enemies[i], amountOfEnemies, atk_down)
            total_dmg += dmg
            if (enemies[i].enabled && enemyDied) amountOfEnemies -= 1
            debugTexts[i] = debugText
        }
        return [total_dmg, Math.round(critRate * 100), debugTexts]
    }

    getEffect(key: string, amountOfEnemies: number, maxBreak: number): number {
        let eff = this.all_effects[key]
        this.extra_effects[key]?.forEach(
            ([fun, e]) => {
                if (fun(amountOfEnemies, maxBreak)) eff += e

            }
        )
        return eff
    }

    calculate_single_dmg(
        idx: number,
        kiokuAtPosition: Kioku | undefined,
        enemy: Enemy,
        amountOfEnemies: number,
        atk_down: number,
    ): [number, number, string, boolean] {
        const [special, enemyDied] = this.dps.get_special_dmg(targetTypeAtPosition[idx], amountOfEnemies, enemy.maxBreak, enemy.hitsToKill);
        const atk_pluss =
            (this.getEffect("UP_ATK_RATIO", amountOfEnemies, enemy.maxBreak) || 0 +
                (this.getEffect("UP_ATK_ACCUM_RATIO", amountOfEnemies, enemy.maxBreak) || 0)) /
            1000;

        const atk_total =
            this.dps.getBaseAtk() * (1 + atk_pluss) * (1 - atk_down) +
            this.dps.atk_bonus_flat;

        const def_remaining = this.getEffect("DEF_MULTIPLIER_TOTAL", amountOfEnemies, enemy.maxBreak);
        const def_total = enemy.defense * (1 + enemy.defenseUp) * def_remaining;

        const crit_rate =
            (this.dps.critRate +
                (this.getEffect("UP_CTR_ACCUM_RATIO", amountOfEnemies, enemy.maxBreak) || 0) +
                (this.getEffect("UP_CTR_FIXED", amountOfEnemies, enemy.maxBreak) || 0)) /
            1000;

        const crit_dmg = (this.dps.critDamage + this.getEffect("CRIT_DAMAGE_TOTAL", amountOfEnemies, enemy.maxBreak) || 0) / 1000;
        const dmg_pluss = (this.getEffect("UP_GIV_DMG_RATIO", amountOfEnemies, enemy.maxBreak) || 0) / 1000;
        const elem_dmg_up =
            (this.getEffect("UP_WEAK_ELEMENT_DMG_RATIO", amountOfEnemies, enemy.maxBreak) || 0) / 1000;
        const dmg_taken = (this.getEffect("UP_RCV_DMG_RATIO", amountOfEnemies, enemy.maxBreak) || 0) / 1000;
        const elem_res_down =
            (this.getEffect("DWN_ELEMENT_RESIST_ACCUM_RATIO", amountOfEnemies, enemy.maxBreak) || 0) / 1000;

        const base_dmg =
            special *
            this.dps.getBaseAtk() *
            ((this.dps.getBaseAtk() / 124) ** 1.2 + 12) /
            20;

        const def_factor = Math.min(2, ((atk_total + 10) / (def_total + 10)) * 0.12);
        const crit_factor = 1 + (enemy.isCrit ? crit_dmg : 0);
        const dmg_dealt_factor = 1 + dmg_pluss;
        const dmg_taken_factor = 1 + dmg_taken;
        const elem_resist_factor = 1 + elem_res_down;
        const effect_elem_factor = 1 + (enemy.isWeak ? 0.2 + elem_dmg_up : 0);
        const break_factor = (enemy.isBreak ? enemy.maxBreak / 100 : 1);

        const total =
            enemy.enabled *
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
                }).map(k => {
                    let key = k
                    let val = kiokuAtPosition[k]
                    if (k.endsWith("Atk")) {
                        val |= 0
                    } else if (["crys_sub", "crys", "data", "support", "supportKey", "knownConditions", "effects"].includes(k)) {
                        return;
                    }

                    return `${["abilityLvl", "ascension"].includes(key) ? `\n${key}` : key} - ${val}`
                }).filter(Boolean)
                : [];

            const formatCondForKioku = (cond: string[]): string => {
                let outString = cond[0]
                if (cond[1]) {
                    outString += ` if\n    ${cond[1]} - `
                    let isActiveCond = isActiveForScoreAttack(cond[1])
                    if (typeof (isActiveCond) !== 'boolean') {
                        isActiveCond = isActiveCond(amountOfEnemies, enemy.maxBreak)
                    }
                    outString += isActiveCond ? "active" :"disabled"
                    outString += `\n    ${getDescriptionOfCond(cond[1]).match(/.{1,9}/g)?.join("\n    ")}`

                }
                return outString
            }

            const effects = kiokuAtPosition ? Object.keys(kiokuAtPosition["effects"]).sort().map(key => {
                if (Kioku.skippable.has(key)) return;
                return `${key} \n  ${kiokuAtPosition["effects"][key].map(formatCondForKioku).join("\n  ")}`
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
