import { EnemyTargetTypes, Kioku } from "./Kioku";


export class Team {
    private team: Kioku[];
    private dps: Kioku;
    private all_effects: Record<string, number> = {};
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
            if (this.debug) {
                console.log(kioku);
            }
            for (const [eff, val] of Object.entries(kioku.effects)) {
                for (const v of val) {
                    if (["DWN_DEF_RATIO", "DWN_DEF_ACCUM_RATIO"].includes(eff)) {
                        this.all_effects["DEF_MULTIPLIER_TOTAL"] *= 1 - v / 1000;
                    } else if (["UP_CTD_FIXED", "UP_CTD_ACCUM_RATIO", "UP_CTD_RATIO"].includes(eff)) {
                        this.all_effects["CRIT_DAMAGE_TOTAL"] += v;
                    } else {
                        if (eff in this.all_effects) {
                            this.all_effects[eff] += v
                        } else {
                            this.all_effects[eff] = v;
                        }
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
        base_defs: number[],
        max_breaks: number[],
        target_order: EnemyTargetTypes[],
        def_up: number[] = [0, 0, 0, 0, 0],
        atk_down = 0,
        is_break = true,
        is_elemt_weak = true,
        does_crit = true
    ): [number, number] {
        let dmg;
        let total_dmg = 0;
        let crit_rate = 0;
        console.log(target_order)
        for (let i = 0; i < base_defs.length; i++) {
            [dmg, crit_rate] = this.calculate_single_dmg(target_order[i], base_defs[i], max_breaks[i], def_up[i], atk_down, is_break, is_elemt_weak, does_crit)
            total_dmg += dmg
        }
        return [total_dmg, crit_rate]
    }

    calculate_single_dmg(
        target_type: EnemyTargetTypes,
        base_def: number,
        max_break: number,
        def_up: number,
        atk_down: number,
        is_break: boolean,
        is_elemt_weak: boolean,
        does_crit: boolean
    ): [number, number] {
        const special = this.dps.get_special_dmg(target_type);

        const atk_pluss =
            (this.all_effects["UP_ATK_RATIO"] || 0 +
                (this.all_effects["UP_ATK_ACCUM_RATIO"] || 0)) /
            1000;

        const atk_total =
            this.dps.base_atk * (1 + atk_pluss) * (1 - atk_down) +
            this.dps.atk_bonus_flat;

        const def_remaining = this.all_effects["DEF_MULTIPLIER_TOTAL"];
        const def_total = base_def * (1 + def_up) * def_remaining;

        const crit_rate =
            0.1 +
            // TODO cr move to magia calc
            ((this.all_effects["UP_CTR_ACCUM_RATIO"] || 0) +
                (this.all_effects["UP_CTR_FIXED"] || 0)) /
            1000;

        const crit_dmg = 0.2 + (this.all_effects["CRIT_DAMAGE_TOTAL"] || 0) / 1000;
        // TODO cd move to magia calc
        const dmg_pluss = (this.all_effects["UP_GIV_DMG_RATIO"] || 0) / 1000;
        const elem_dmg_up =
            (this.all_effects["UP_WEAK_ELEMENT_DMG_RATIO"] || 0) / 1000;
        const dmg_taken = (this.all_effects["UP_RCV_DMG_RATIO"] || 0) / 1000;
        const elem_res_down =
            (this.all_effects["DWN_ELEMENT_RESIST_ACCUM_RATIO"] || 0) / 1000;

        const base_dmg =
            special *
            this.dps.base_atk *
            ((this.dps.base_atk / 124) ** 1.2 + 12) /
            20;

        const def_factor = Math.min(2, ((atk_total + 10) / (def_total + 10)) * 0.12);
        const crit_factor = 1 + (does_crit ? crit_dmg : 0);
        const dmg_dealt_factor = 1 + dmg_pluss;
        const dmg_taken_factor = 1 + dmg_taken;
        const elem_resist_factor = 1 + elem_res_down;
        const effect_elem_factor = 1 + (is_elemt_weak ? 0.2 + elem_dmg_up : 0);
        const break_factor = (is_break ? max_break : 1);

        const total =
            base_dmg *
            def_factor *
            crit_factor *
            dmg_dealt_factor *
            dmg_taken_factor *
            elem_resist_factor *
            effect_elem_factor *
            break_factor;

        if (this.debug) {
            console.log(`
Derived for ${target_type}:
Ability Multiplier          ${special * 100 | 0}
Base Attack                 ${this.dps.base_atk | 0}
Atk Up %                    ${atk_pluss * 100}%
Atk Up flat                 ${this.dps.atk_bonus_flat | 0}
Total Atk                   ${atk_total | 0}
Def down%                   ${(1 - def_remaining) * 100}%
Total def                   ${def_total | 0}
Crit dmg                    ${crit_dmg * 100}%
Dmg Dealt                   ${dmg_pluss * 100}%
Elem dmg up                 ${elem_dmg_up * 100}%
Dmg Taken                   ${dmg_taken * 100}%
Elem Res                    ${elem_res_down * 100}%
break                       ${max_break}%

Formula:
Ability Damage Base         ${base_dmg | 0}
Defense Factor              ${def_factor * 100 | 0}%
Critical Factor             ${crit_factor * 100}%
Damage Dealt Factor         ${dmg_dealt_factor * 100}%
Damage Taken Factor         ${dmg_taken_factor * 100}%
Elemental Resistance Factor ${elem_resist_factor * 100}%
Effective Element Factor    ${effect_elem_factor * 100}%
Break Factor                ${break_factor * 100}%
Result                      ${total | 0}
`);
        }

        return [total | 0, crit_rate];
    }
}
