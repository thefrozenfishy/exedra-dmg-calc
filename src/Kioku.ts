import { SkillDetail, KiokuData, battleConditions, portraits, portraitLevels, passiveDetails, skillDetails, kiokuData, elementMap } from './helpers';

export function getIdx(obj: SkillDetail): number {
    return "passiveSkillMstId" in obj ? obj.passiveSkillMstId : obj.skillMstId;
}

/**
 * Recursively find all subskills for a given skill ID.
 */
export function find_all_details(
    is_passive: boolean,
    skill_id: number,
    is_unique: boolean = false
): Record<string, SkillDetail> {
    if (skill_id < 1000) return {};

    const details = is_passive ? passiveDetails : skillDetails;
    const key = is_passive ? "passiveSkillMstId" : "skillMstId";

    // filter top-level skills
    const this_skill: Record<string, SkillDetail> = {};
    for (const [k, v] of Object.entries(details)) {
        const vKey = Math.floor(v[key] / (is_unique ? 1 : 100));
        if (vKey === skill_id) this_skill[k] = v;
    }

    // recursively add sub-skills
    let sub_skills: Record<string, SkillDetail> = {};
    for (const skill of Object.values(this_skill)) {
        for (let i = 1; i <= 5; i++) {
            const valKey = `value${i}`;
            if (valKey in skill) {
                const subId = Math.floor(skill[valKey] / 100);
                sub_skills = {
                    ...sub_skills,
                    ...find_all_details(false, subId),
                    ...find_all_details(true, subId),
                };
            }
        }
    }

    return { ...this_skill, ...sub_skills };
}


export class Kioku {

    static knownBoosts = {
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

    static skippable = new Set([
        "DWN_RCV_DMG_RATIO", "DMG_ATK", "VORTEX_ATK", "UP_DEF_RATIO", "ADDITIONAL_TURN_UNIT_ACT",
        "GAIN_EP_RATIO", "HASTE", "UP_SPD_RATIO", "UP_EP_RECOVER_RATE_RATIO", "GAIN_EP_FIXED",
        "UP_DEF_ACCUM_RATIO", "BLEED_ATK", "BARRIER", "DMG_DEF", "RECOVERY_HP_ATK", "CONTINUOUS_RECOVERY",
        "UP_HEAL_RATE_RATIO", "CUTOUT", "RECOVERY_HP", "REMOVE_ALL_ABNORMAL", "CHARGE", "SHIELD",
        "REMOVE_ALL_BUFF", "GAIN_CHARGE_POINT", "CONSUME_CHARGE_POINT", "STUN", "SLOW", "IMM_SLIP_DMG",
        "POISON_ATK", "DWN_SPD_RATIO", "DWN_ATK_RATIO", "REFLECTION_RATIO",
        "UP_GIV_BREAK_POINT_DMG_FIXED", "UP_RCV_BREAK_POINT_DMG_RATIO", "ADDITIONAL_SKILL_ACT",
        "UP_SPD_FIXED", "ADD_BUFF_TURN", "UNIQUE_10030301", "UP_SPD_ACCUM_RATIO", "CURSE_ATK",
        "BURN_ATK", "SWITCH_SKILL", "UP_BUFF_EFFECT_VALUE", "ADD_DEBUFF_TURN", "GAIN_SP_FIXED",
        "UP_ABNORMAL_HIT_RATE_RATIO", "DMG_RANDOM", "UP_GIV_VORTEX_DMG_RATIO",
    ]);

    // prettier-ignore-start
    knownConditions = {
        "9": () => false,  // "HPが50%以上のとき",
        "476": () => false,  // "HPが50%未満のとき",
        "1562": () => true,  // "自身のHPが50%未満かつ36%以上のとき", // We take the lowest bonus and skip this
        "1563": () => true,  // "自身のHPが35%未満かつ11%以上のとき", // We take the lowest bonus and skip this
        "1564": () => false,  // "自身のHPが10%未満のとき",
        "330": () => this.amountEnemies < 2,  // "敵が2体以上のとき",
        "1663": () => this.amountEnemies < 2, // "敵が2体以上のとき(自ターン問わず)",
        "439": () => this.amountEnemies < 3,  // "敵が3体以上のとき",
        "1664": () => this.amountEnemies < 3, // "敵が3体以上のとき(自ターン問わず)",
        "1569": () => this.amountEnemies < 3, // "敵が3体以上+行動タイプは必殺技+行動者は自身",
        "440": () => this.amountEnemies < 4,  // "敵が4体以上のとき",
        "1665": () => this.amountEnemies < 4, // "敵が4体以上のとき(自ターン問わず)",
        "441": () => this.amountEnemies < 5,  // "敵が5体以上のとき",
        "1666": () => this.amountEnemies < 5, // "敵が5体以上のとき(自ターン問わず)",
        "1538": () => false,  // "自分にシールドが付与されているとき",
        "38": () => false,  // "HPが80%以上のとき",
        "773": () => this.maxBreak <= 3.5,      // "ブレイク倍率が350%以上の敵に対して必殺技を発動したとき",
        "331": () => this.maxBreak <= 2,        // "ブレイクボーナスが200%以上の敵に対して",
        "451": () => this.maxBreak <= 2,        // "ブレイクボーナスが200%以上の敵に対して、必殺技の",
        "1178": () => false,  // "継続回復効果が付与されているとき",
        "310": () => false,  // "行動対象がブレイク状態のとき",
        "1277": () => false,  // "カットアウトが付与されているとき",
        "266": () => false,  // "必殺技の",
        "317": () => false,  // "必殺技の",
        "7": () => false,  // "必殺技の",
        "512": () => false,  // "魔力が1以上のとき",
        "428": () => false,  // "魔力が5個のとき",
        "1535": () => false,  // "トークンが3以上のとき",
        "1542": () => false,  // "魔力が5個で必殺技を使用したとき",
        "1543": () => false,  // "自身が固有バフ(水着マミ)状態の場合+HP80%以上",
        "1580": () => false,  // "自身が固有バフ(水着マミ)状態の場合+HP85%以上",
        "1544": () => false,  // "自身が固有バフ(水着マミ)状態の場合+HP90%以上",
        "1581": () => false,  // "自身が固有バフ(水着マミ)状態の場合+HP95%以上",
        "1545": () => false,  // "自身が固有バフ(水着マミ)状態の場合+HP100%",
        "337": () => false,  // "対象が「毒」のとき%",
        "591": () => false,  // "【追撃】の",
        "438": () => false,  // "自身にシールドが張られているとき",
        "319": () => false,  // 自身が行動可能で魔力が5のとき
        "1565": () => this.amountEnemies == 1,  // 敵が1体の場合
        "1456": () => this.amountEnemies == 2,  // 敵が2体の場合
        "1457": () => this.amountEnemies == 3,  // 敵が3体の場合
        "1458": () => this.amountEnemies == 4,  // 敵が4体の場合
        "1566": () => this.amountEnemies == 5,  // 敵が5体の場合
        "352": () => false,  // "対象が裂傷状態のとき",
        "1604": () => false,  // "水刃の敵が1体以上いるとき",
        "939": () => false,  // "デバフが1個以上ある敵に対して",
        "1568": () => false,  // "行動者のデバフが1以上+行動者は敵",
    }


    private name: string;
    private dpsElement: string;
    private supportKey: any[] | undefined;
    private support: Kioku | null;
    private portrait: string | null;
    isDps: boolean;
    private ascension: number;
    private supportLvl: number;
    private kiokuLvl: number;
    private magicLvl: number;
    private heartphialLvl: number;
    private skillLvl: number;
    private abilityLvl: number;
    private attackLvl: number;
    private specialLvl: number;
    private crys: string[];
    private crys_sub: string[];
    private data: KiokuData;
    effects: Record<string, number[]> = {};
    private atkPerMagicRank: number;
    base_atk: number = 0;
    atk_bonus_flat: number = 0;
    private buff_mult: number = 1;
    private debuff_mult: number = 1;
    private maxBreak: number = 0;
    private amountEnemies: number = 0;

    add_to_effects(key: string, value: number) {
        if (key in this.effects) {
            this.effects[key].push(value);
        } else {
            this.effects[key] = [value];
        }
    }

    constructor({
        name,
        dpsElement,
        supportKey,
        portrait,
        isDps,
        ascension,
        kiokuLvl,
        magicLvl,
        heartphialLvl,
        specialLvl,
        crys,
    }: KiokuGeneratorArgs) {
        this.name = name;
        this.portrait = portrait;
        this.isDps = isDps;
        this.ascension = ascension;
        this.kiokuLvl = kiokuLvl;
        this.magicLvl = magicLvl;
        this.heartphialLvl = heartphialLvl;
        this.specialLvl = specialLvl;
        this.dpsElement = dpsElement;
        this.crys = crys;
        this.data = kiokuData[name];

        this.crys_sub = Array(3).fill([KiokuConstants.availableSubCrys.CD, KiokuConstants.availableSubCrys.ATK_FLAT]).flat()

        this.supportKey = supportKey;
        this.support = supportKey ? Kioku.fromKey(supportKey) ?? null : null;

        this.atkPerMagicRank = this.data.rarity === 5 ? 36 : 32;
        const atk_delta = (this.data.atk100 - this.data.minAtk) / (KiokuConstants.maxKiokuLvl - 1);
        this.base_atk = this.data.maxAtk - atk_delta * (KiokuConstants.maxKiokuLvl - this.kiokuLvl);

        if (this.support) this.base_atk += 0.16 * this.support.base_atk;

        // TODO: Just read this from mst. set atk and ability lvl etc based on this too
        if (this.magicLvl < 129) this.base_atk -= this.atkPerMagicRank;
        if (this.magicLvl < 126) this.base_atk -= this.atkPerMagicRank;
        if (this.magicLvl < 123) this.base_atk -= this.atkPerMagicRank;
        if (this.magicLvl < 121) this.base_atk -= this.atkPerMagicRank;
        this.supportLvl = 10;
        this.skillLvl = 10;
        this.abilityLvl = 10;
        this.attackLvl = 10;

        // TODO: Same here, just read from mst
        for (const [k, v] of Object.entries(KiokuConstants.heartphialAtkRewardLvls)) {
            if (this.heartphialLvl < parseInt(k)) this.base_atk -= v;
        }

        this.setupEffects();
    }

    setupEffects(): void {
        for (const cry of [...this.crys, ...this.crys_sub]) {
            if (cry === KiokuConstants.availableCrys.EX || !this.isDps) continue;
            const eff = parseInt(cry.split("-")[1]);
            switch (cry) {
                case KiokuConstants.availableCrys.ATK_FLAT:
                case KiokuConstants.availableSubCrys.ATK_FLAT:
                    this.atk_bonus_flat += eff;
                    break;
                case KiokuConstants.availableCrys.ATK:
                    this.add_to_effects("UP_ATK_RATIO", 10 * eff);
                    break;
                case KiokuConstants.availableCrys.CD:
                case KiokuConstants.availableSubCrys.CD:
                    this.add_to_effects("UP_CTD_FIXED", 10 * eff);
                    break;
                case KiokuConstants.availableCrys.WEAK:
                    this.add_to_effects("UP_WEAK_ELEMENT_DMG_RATIO", 10 * eff);
                    break;
                case KiokuConstants.availableCrys.DMG:
                    this.add_to_effects("UP_GIV_DMG_RATIO", 10 * eff);
                    break;
            }
        }
        // First add buff mult then later add the effects themselves
        // Ascension buffs
        for (let i = 1; i <= this.ascension; i++) {
            const ascId = (this.data as any)[`ascension_${i}_effect_2_id`] as number;
            if (!ascId) continue;
            const details = find_all_details(true, ascId);
            for (const sub_d of Object.values(details)) {
                if (sub_d.abilityEffectType === "UP_BUFF_EFFECT_VALUE") this.buff_mult += sub_d.value1 / 1000;
                else if (sub_d.abilityEffectType === "UP_DEBUFF_EFFECT_VALUE") this.debuff_mult += sub_d.value1 / 1000;
            }
        }
        // Crys buffs
        for (const sub_d of Object.values(find_all_details(true, this.data.crystalis_id, true))) {
            if (sub_d.abilityEffectType === "UP_BUFF_EFFECT_VALUE") this.buff_mult += sub_d.value1 / 1000;
            else if (sub_d.abilityEffectType === "UP_DEBUFF_EFFECT_VALUE") this.debuff_mult += sub_d.value1 / 1000;
        }

        // Support effects
        if (this.support) {
            const [supp_target, supp_eff] = this.support.get_support_effect();
            if (this.is_valid_support(supp_target)) {
                for (const sub_d of Object.values(supp_eff)) {
                    if (sub_d.abilityEffectType === "UP_BUFF_EFFECT_VALUE") this.buff_mult += sub_d.value1 / 1000;
                    else if (sub_d.abilityEffectType === "UP_DEBUFF_EFFECT_VALUE") this.debuff_mult += sub_d.value1 / 1000;
                }
                // After mult is applied, start adding effects
                this.add_effects(supp_eff, true, 10);
            }
        }

        // Ascension effects
        for (let i = 1; i <= this.ascension; i++) {
            const ascId = (this.data as any)[`ascension_${i}_effect_2_id`] as number;
            if (!ascId) continue;
            this.add_effects(find_all_details(true, ascId), true, 10);
        }

        // Portrait effects
        if (this.portrait) {
            const port_info = portraits[this.portrait];
            const port_eff = find_all_details(true, port_info.passiveSkill1);
            this.base_atk += portraitLevels[port_info.cardMstId * 10 + 5].atk;
            this.add_effects({ 1: port_eff[Math.max(...Object.keys(port_eff).map(Number))] }, true, 1);
            // Math.max to find highest level effect of portrait (Always assume LB5 portrait), and format into expected format
        }

        // Skills effects
        const skillTuples: [boolean, string, number][] = [
            [false, "skill_id", this.skillLvl],
            [false, "attack_id", this.attackLvl],
            [true, "ability_id", this.abilityLvl],
            [false, "special_id", this.specialLvl],
            [true, "crystalis_id", 0],
        ];

        for (const [is_passive, skill_id, lvl] of skillTuples) {
            const isCrys = skill_id === "crystalis_id"
            if (isCrys && !this.crys.includes(KiokuConstants.availableCrys.EX)) continue;
            const details = find_all_details(
                is_passive,
                (this.data as any)[skill_id],
                isCrys
            );
            this.add_effects(details, isCrys, lvl, isCrys);
        }
    }

    is_valid_support(target: string) {
        return target === this.data.role || target === this.data.element;
    }

    get_support_effect(): [string, Record<string, SkillDetail>] {
        const supp_eff = find_all_details(true, this.data.support_id);
        const lvl_details: Record<string, SkillDetail> = {};
        for (const [k, v] of Object.entries(supp_eff)) {
            if (parseInt(String(getIdx(v)).slice(-2)) === this.supportLvl) {
                lvl_details[k] = v;
            }
        }
        return [this.data.support_target, lvl_details];
    }

    get_special_dmg(targetType: EnemyTargetTypes): number {
        let total_dmg = 0;
        for (const v of Object.values(find_all_details(false, this.data.special_id))) {
            if (parseInt(String(getIdx(v)).slice(-2)) !== this.specialLvl || !v.abilityEffectType.startsWith("DMG_")) continue;

            if (v.startConditionSetIdCsv && !Object.keys(battleConditions).includes(v.startConditionSetIdCsv)) continue; // TODO is this correct?

            if (v.abilityEffectType === "DMG_RANDOM" && targetType === EnemyTargetTypes.TARGET) total_dmg += v.value1 * v.value2;
            // We make random only hit lowest def for simplicity, since this is max dmg
            else if (v.range === 3) total_dmg += v.value1; // 3 is all enemies
            else if (v.range === 2 && targetType === EnemyTargetTypes.PROXIMITY) total_dmg += v.value2;
            else if (targetType === EnemyTargetTypes.TARGET) total_dmg += v.value1;
        }
        return total_dmg / 1000;
    }

    add_effects(details: Record<string, any>, is_unique: boolean, lvl: number, ignore_buff_mult = false) {
        const conds: Record<string, number> = {};
        // TODO: What's the logic of conds again, this seems weird, document it better
        const lvl_details = Object.values(details).filter(
            (v: any) =>
                (is_unique || parseInt(String(getIdx(v)).slice(-2)) === lvl) &&
                (this.isDps || v.range !== -1)
        );

        for (const skill of lvl_details) {
            if (!skill.activeConditionSetIdCsv) continue;
            const start_cond = skill.startConditionSetIdCsv ? parseInt(skill.startConditionSetIdCsv) : 0;
            if ((conds[skill.activeConditionSetIdCsv] || 0) < start_cond) conds[skill.activeConditionSetIdCsv] = start_cond;
        }

        for (const skill of lvl_details) {
            const cond_id = skill.activeConditionSetIdCsv || "";
            const cond_id_int = parseInt(cond_id || "0");

            if (cond_id && cond_id_int in battleConditions) {
                try {
                    if ((this.knownConditions as any)[cond_id]?.()) continue;
                } catch (exc) {
                    throw new Error(`Unknown condition: ${cond_id_int}`);
                }
            }

            let eff = skill.value1;
            // For multi-value skills, value2 is the max multiplier 
            if (skill.value2) {
                eff *= skill.value2;
            }

            if (!ignore_buff_mult) {
                // Mult doesn't affect crys. TODO: Does it affect portrat, support? 
                if (
                    ["DWN_DEF_RATIO", "DWN_DEF_ACCUM_RATIO", "UP_RCV_DMG_RATIO"].includes(
                        skill.abilityEffectType
                    )
                ) {
                    eff *= this.debuff_mult;
                } else {

                    eff *= this.buff_mult;
                }
            }

            if (
                skill.element &&
                elementMap[skill.element] !== this.dpsElement
            ) {
                // Boosts dmg etc for a different element, skip
                continue;
            }
            if (skill.abilityEffectType === "WEAKNESS") { // Weakness works like a 10% def%-
                skill.abilityEffectType = "DWN_DEF_RATIO"
            } else if (skill.abilityEffectType === "UP_ELEMENT_DMG_RATE_RATIO") {
                skill.abilityEffectType = "UP_GIV_DMG_RATIO";
            }
            this.add_to_effects(skill.abilityEffectType, eff);
        }
    }

    toString() {
        return `${this.name} A${this.ascension}
  Stats: base_atk=${this.base_atk.toFixed(0)}, atk_bonus_flat=${this.atk_bonus_flat}, buff_mult=${this.buff_mult}, debuff_mult=${this.debuff_mult}
  Support: ${this.support ? this.support.name : null}
  Portrait: ${this.portrait}
  Effect: ${JSON.stringify(Object.fromEntries(
            Object.entries(this.effects).filter(([k]) => (Kioku.knownBoosts as any)[k])
        ))}`;
    }

    getKey(): any[] {
        return [
            this.name,
            this.dpsElement,
            this.kiokuLvl,
            this.magicLvl,
            this.heartphialLvl,
            this.portrait,
            this.supportKey,
            this.isDps,
            this.crys,
            this.ascension,
            this.specialLvl,
        ];
    }

    static fromKey(key: any[]) {
        return getKioku({
            name: key[0],
            dpsElement: key[1],
            kiokuLvl: key[2],
            magicLvl: key[3],
            heartphialLvl: key[4],
            portrait: key[5],
            supportKey: key[6],
            isDps: key[7],
            crys: key[8],
            ascension: key[9],
            specialLvl: key[10],
        });
    }
}


export const KiokuConstants = {
    availableCrys: { ATK: "ATK%-25", CD: "CD-20", WEAK: "Elem-24", DMG: "Dmg-20", EX: "EX" } as Record<string, string>,
    // ATK_FLAT: "ATK-125", flat atk are technically dps crys, but it's so bad I don't see the point, just takes more time....
    availableSubCrys: { CD: "CD-10", ATK_FLAT: "ATK-60" } as Record<string, string>,
    maxKiokuLvl: 120,
    maxMagicLvl: 130,
    maxAscension: 5,
    maxHeartphialLvl: 50,
    maxSpecialLvl: 10,
    heartphialAtkRewardLvls: { 45: 20, 39: 20, 33: 20, 27: 20, 21: 20, 15: 10, 9: 10 } as Record<string, number>,

}
export interface KiokuGeneratorArgs {
    name: string;
    dpsElement: string;
    kiokuLvl?: number;
    magicLvl?: number;
    heartphialLvl?: number;
    portrait?: string | null;
    supportKey?: any[] | undefined;
    isDps?: boolean;
    crys?: string[];
    ascension?: number;
    specialLvl?: number;
}

export enum EnemyTargetTypes {
    TARGET,
    PROXIMITY,
    OTHER
}

const cache = new Map<string, Kioku>();

export function getKioku({
    name,
    dpsElement,
    supportKey,
    portrait,
    isDps = false,
    ascension = KiokuConstants.maxAscension,
    kiokuLvl = KiokuConstants.maxKiokuLvl,
    magicLvl = KiokuConstants.maxMagicLvl,
    heartphialLvl = KiokuConstants.maxHeartphialLvl,
    specialLvl = KiokuConstants.maxSpecialLvl,
    crys = [KiokuConstants.availableCrys.EX],
}: KiokuGeneratorArgs) {
    if (name == null || dpsElement == null || kiokuLvl == null || magicLvl == null || heartphialLvl == null || isDps == null || ascension == null || specialLvl == null) {
        throw new Error("Ivalid arguments provided to getKioku");
    }
    const key = JSON.stringify([
        name,
        dpsElement,
        supportKey,
        portrait,
        isDps,
        ascension,
        kiokuLvl,
        magicLvl,
        heartphialLvl,
        specialLvl,
        crys,
    ]);

    if (!cache.has(key)) {
        console.log("Creating new Kioku", key)
        cache.set(key, new Kioku({
            name,
            dpsElement,
            supportKey,
            portrait,
            isDps,
            ascension,
            kiokuLvl,
            magicLvl,
            heartphialLvl,
            specialLvl,
            crys,
        }));
    } else {
        console.log("Returning known Kioku", key)
    }

    return cache.get(key);
}
