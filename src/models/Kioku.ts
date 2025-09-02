import { KiokuConstants, KiokuData, KiokuGeneratorArgs, KiokuElement, MagicLevel, SkillDetail, SupportKey, KiokuRole, PortraitData, PortraitLvlData } from '../types/KiokuTypes';
import { magicData, portraits, portraitLevels, passiveDetails, skillDetails, kiokuData, crystalises } from '../utils/helpers';

function getIdx(obj: SkillDetail): number {
    return "passiveSkillMstId" in obj ? obj.passiveSkillMstId : obj.skillMstId;
}

/**
 * Recursively find all subskills for a given skill ID.
 */
function find_all_details(
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
        const vKey = Math.floor((v as any)[key] / (is_unique ? 1 : 100));
        if (vKey === skill_id) this_skill[k] = v;
    }

    // recursively add sub-skills
    let sub_skills: Record<string, SkillDetail> = {};
    for (const skill of Object.values(this_skill)) {
        for (let i = 1; i <= 5; i++) {
            const valKey = `value${i}`;
            if (valKey in skill) {
                const subId = Math.floor((skill as any)[valKey] / 100);
                if (Object.keys(find_all_details(false, subId)).length) {
                    console.log("Found subskill on false", find_all_details(false, subId))
                }
                if (Object.keys(find_all_details(true, subId)).length) {
                    console.log("Found subskill on true", find_all_details(true, subId))
                }
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
    name: string;
    private support?: Kioku;
    private portrait?: PortraitData;
    private portraitStats?: PortraitLvlData;
    element: KiokuElement;
    role: KiokuRole;
    private ascension: number;
    private kiokuLvl: number;
    private magicLvl: number;
    private heartphialLvl: number;
    private supportLvl = 1;
    private skillLvl = 1;
    private abilityLvl = 1;
    private attackLvl = 1;
    critRate: number
    critDamage: number;
    private specialLvl: number;
    private crys: string[];
    private crys_sub: string[];
    data: KiokuData;
    effects: Record<number, SkillDetail[]> = {};
    private kiokuAtk: number;
    private kiokuDef: number;
    private kiokuHp: number;
    private magicAtk: number = 0;
    private magicDef: number = 0;
    private magicHp: number = 0;
    private heartAtk: number = 0;
    private heartDef: number = 0;
    private heartHp: number = 0;
    private ascensionAtk: number;
    private ascensionDef: number;
    private ascensionHp: number;
    baseSpd: number
    private buff_mult: number = 1;
    private debuff_mult: number = 1;
    maxMagicStacks = 0;

    add_to_effects(skill_id: number, details: SkillDetail[]) {
        if (!(skill_id in this.effects)) {
            this.effects[skill_id] = []
        }
        this.effects[skill_id].push(...details);
    }

    getBaseAtk(): number {
        return this.kiokuAtk + (this.support?.getBaseAtk() ?? 0) * 0.16 + (this.portraitStats?.atk ?? 0) + this.magicAtk + this.heartAtk + this.ascensionAtk
    }

    getBaseDef(): number {
        return this.kiokuDef + (this.support?.getBaseDef() ?? 0) * 0.16 + (this.portraitStats?.def ?? 0) + this.magicDef + this.heartDef + this.ascensionDef
    }

    getBaseHp(): number {
        return this.kiokuHp + (this.support?.getBaseHp() ?? 0) * 0.16 + (this.portraitStats?.hp ?? 0) + this.magicHp + this.heartHp + this.ascensionHp
    }

    constructor({
        name,
        supportKey,
        portrait,
        ascension,
        kiokuLvl,
        magicLvl,
        heartphialLvl,
        specialLvl,
        crys,
        crys_sub
    }: KiokuArgs) {
        this.name = name;
        if (portrait) {
            this.portrait = portraits[portrait]
            this.portraitStats = portraitLevels[this.portrait.cardMstId * 10 + 5];
        }
        this.ascension = ascension;
        this.kiokuLvl = kiokuLvl;
        this.magicLvl = magicLvl;
        this.heartphialLvl = heartphialLvl;
        this.specialLvl = specialLvl;
        this.crys = crys
        this.crys_sub = crys_sub
        this.data = kiokuData[name];
        this.element = this.data.element
        this.role = this.data.role
        this.baseSpd = this.data.minSpd
        this.maxMagicStacks = this.data.maxMagicStacks ?? 0
        this.critDamage = this.data.minCritDmg * 10
        this.critRate = this.data.minCritRate * 10

        this.support = supportKey ? Kioku.fromKey(supportKey) : undefined;

        this.kiokuAtk = this.data.minAtk + (this.kiokuLvl - 1) * (this.data.atk100 - this.data.minAtk) / (KiokuConstants.maxKiokuLvl - 1);
        this.ascensionAtk = this.ascension / 5 * this.data.atka5
        this.kiokuDef = this.data.minDef + (this.kiokuLvl - 1) * (this.data.def100 - this.data.minDef) / (KiokuConstants.maxKiokuLvl - 1);
        this.ascensionDef = this.ascension / 5 * this.data.defa5
        this.kiokuHp = this.data.minHp + (this.kiokuLvl - 1) * (this.data.hp100 - this.data.minHp) / (KiokuConstants.maxKiokuLvl - 1);
        this.ascensionHp = this.ascension / 5 * this.data.hpa5

        for (const [k, v] of Object.entries(KiokuConstants.heartphialAtkRewardLvls)) {
            if (this.heartphialLvl >= parseInt(k)) this.heartAtk += v;
            // TODO: Add hp and def
        }


        for (let lvl = 1; lvl <= this.magicLvl; lvl++) {
            const lvlEff = magicData[+(this.data.rarity === 5)][lvl.toString()] as MagicLevel
            switch (lvlEff.eff) {
                case "UP_ATK_FIXED":
                    this.magicAtk += lvlEff.val
                    break;
                case "UP_DEF_FIXED":
                    this.magicDef += lvlEff.val
                    break;
                case "UP_HP_FIXED":
                    this.magicHp += lvlEff.val
                    break;
                case "UP_CTR_FIXED":
                    this.critRate += lvlEff.val
                    break;
                case "UP_CTD_FIXED":
                    this.critDamage += lvlEff.val
                    break;
                case "Support Ability Lvl. Up":
                    this.supportLvl += 1;
                    break;
                case "Battle Skill Lvl. Up":
                    this.skillLvl += 1;
                    break;
                case "Ability Lvl. Up":
                    this.abilityLvl += 1;
                    break;
                case "Basic Attack Lvl. Up":
                    this.attackLvl += 1;
                    break;
                default:
                    console.warn("Missing magic lvl", lvlEff)
            }
        }

        this.setupEffects();
    }

    setupEffects(): void {
        this.add_to_effects(0,
            [...this.crys, ...this.crys_sub]
                .filter(c => c !== "EX")
                .flatMap(c => Object.values(find_all_details(true, crystalises[c].value1, true))))

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
                this.add_effects(0, supp_eff, true, 10, true);
            }
        }

        // Ascension effects
        for (let i = 1; i <= this.ascension; i++) {
            const ascId = (this.data as any)[`ascension_${i}_effect_2_id`] as number;
            if (!ascId) continue;
            this.add_effects(0, find_all_details(true, ascId), true, 10);
        }

        // Portrait effects
        if (this.portrait) {
            const port_eff = find_all_details(true, this.portrait.passiveSkill1);
            this.add_effects(0, { 1: port_eff[Math.max(...Object.keys(port_eff).map(Number))] }, true, 1, true);
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

        for (const [is_passive, skill_label, lvl] of skillTuples) {
            const isCrys = skill_label === "crystalis_id"
            const skill_id = (this.data as any)[skill_label]
            if (isCrys && !this.crys.includes("EX")) continue;
            const details = find_all_details(
                is_passive,
                skill_id,
                isCrys
            );
            this.add_effects(skill_id, details, isCrys, lvl, isCrys);
        }
    }

    is_valid_support(target: SupportKey) {
        return target === this.data.role || target === this.data.element;
    }

    get_support_effect(): [SupportKey, Record<string, SkillDetail>] {
        const supp_eff = find_all_details(true, this.data.support_id);
        const lvl_details: Record<string, SkillDetail> = {};
        for (const [k, v] of Object.entries(supp_eff)) {
            if (parseInt(String(getIdx(v)).slice(-2)) === this.supportLvl) {
                lvl_details[k] = v;
            }
        }
        return [this.data.support_target, lvl_details];
    }

    add_effects(skill_id: number, details: Record<string, SkillDetail>, is_unique: boolean, lvl: number, ignore_buff_mult = false) {
        const lvl_details = Object.values(details).filter(s => is_unique || parseInt(String(getIdx(s)).slice(-2)) === lvl).map(detail => {
            let v = detail.value1
            if (!ignore_buff_mult) {
                if (detail.abilityEffectType.startsWith("DWN_") || detail.abilityEffectType.startsWith("DOWN_") || detail.abilityEffectType === "UP_RCV_DMG_RATIO") {
                    v *= this.debuff_mult;
                } else if (detail.abilityEffectType.startsWith("UP_")) {
                    v = (detail.value1 * this.buff_mult) | 0;
                }
            }
            return { ...detail, value1: v }
        });
        this.add_to_effects(skill_id, lvl_details)
    }

    getKey(): any[] {
        return [
            this.name,
            this.support?.getKey(),
            this.portrait,
            this.ascension,
            this.kiokuLvl,
            this.magicLvl,
            this.heartphialLvl,
            this.specialLvl,
            this.crys,
            this.crys_sub,
        ];
    }

    static fromKey(key: any[]) {
        return getKioku({
            name: key[0],
            supportKey: key[1],
            portrait: key[2],
            ascension: key[3],
            kiokuLvl: key[4],
            magicLvl: key[5],
            heartphialLvl: key[6],
            specialLvl: key[7],
            crys: key[8],
            crys_sub: key[9],
        });
    }
}

interface KiokuArgs {
    name: string;
    kiokuLvl: number;
    magicLvl: number;
    heartphialLvl: number;
    portrait?: string;
    supportKey?: any[];
    crys: string[];
    crys_sub: string[]
    ascension: number;
    specialLvl: number;
}

const cache = new Map<string, Kioku>();

export function getKioku({
    name,
    supportKey,
    portrait,
    ascension = KiokuConstants.maxAscension,
    kiokuLvl = KiokuConstants.maxKiokuLvl,
    magicLvl = KiokuConstants.maxMagicLvl,
    heartphialLvl = KiokuConstants.maxHeartphialLvl,
    specialLvl = KiokuConstants.maxSpecialLvl,
    crys = ["EX"],
    crys_sub = Array(3).fill(["Increases critical rate by 5%.", "Increases critical DMG by 10%.", "Increases ATK by 60."]).flat()
}: KiokuGeneratorArgs) {
    const clearCrys = crys.filter(Boolean)
    const clearSubCrys = crys_sub.filter(Boolean)
    const key = JSON.stringify([
        name,
        supportKey,
        portrait,
        ascension,
        kiokuLvl,
        magicLvl,
        heartphialLvl,
        specialLvl,
        clearCrys,
        clearSubCrys,
    ]);

    if (!cache.has(key)) {
        cache.set(key, new Kioku({
            name,
            supportKey,
            portrait,
            ascension,
            kiokuLvl,
            magicLvl,
            heartphialLvl,
            specialLvl,
            crys: clearCrys,
            crys_sub: clearSubCrys
        }));
    }

    return cache.get(key);
}
