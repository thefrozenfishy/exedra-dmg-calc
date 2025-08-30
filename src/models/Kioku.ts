import { EnemyTargetTypes } from '../types/EnemyTypes';
import { elementMap, KiokuConstants, KiokuData, KiokuGeneratorArgs, KiokuElement, MagicLevel, SkillDetail, AvailableCrys, AvailableSubCrys, SupportKey } from '../types/KiokuTypes';
import { magicData, portraits, portraitLevels, passiveDetails, skillDetails, kiokuData } from '../utils/helpers';
import { isActiveConditionRelevantForScoreAttack } from './BattleConditionParser';

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


    private name: string;
    private dpsElement: KiokuElement;
    private supportKey: any[] | undefined;
    private support: Kioku | undefined;
    private portrait: string | undefined;
    isDps: boolean;
    private ascension: number;
    private kiokuLvl: number;
    private magicLvl: number;
    private heartphialLvl: number;
    private supportLvl = 1;
    private skillLvl = 1;
    private abilityLvl = 1;
    private attackLvl = 1;
    critRate = 50;
    critDamage = 100;
    private specialLvl: number;
    private crys: AvailableCrys[];
    private crys_sub: AvailableSubCrys[];
    private data: KiokuData;
    effects: Record<string, [number, string, string][]> = {};
    kiokuAtk: number;
    supportAtk: number = 0;
    portraitAtk: number = 0;
    magicAtk: number = 0;
    heartAtk: number = 0;
    ascensionAtk: number;
    atk_bonus_flat: number = 0;
    private buff_mult: number = 1;
    private debuff_mult: number = 1;
    maxMagicStacks = 0;

    add_to_effects(key: string, value: number, activeCondId: string, activeStartIdCsv: string) {
        if (activeCondId === "0") activeCondId = ""
        if (activeStartIdCsv === "0") activeStartIdCsv = ""

        if (key in this.effects) {
            this.effects[key].push([value, activeCondId, activeStartIdCsv]);
        } else {
            this.effects[key] = [[value, activeCondId, activeStartIdCsv]];
        }
    }

    getBaseAtk(): number {
        return this.kiokuAtk + this.supportAtk + this.portraitAtk + this.magicAtk + this.heartAtk
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
    }: KiokuArgs) {
        this.name = name;
        this.portrait = portrait;
        this.isDps = isDps;
        this.ascension = ascension;
        this.kiokuLvl = kiokuLvl;
        this.magicLvl = magicLvl;
        this.heartphialLvl = heartphialLvl;
        this.specialLvl = specialLvl;
        this.dpsElement = dpsElement ?? KiokuElement.Flame;
        this.crys = crys;
        this.data = kiokuData[name];
        this.maxMagicStacks = this.data.maxMagicStacks ?? 0

        this.crys_sub = Array(3).fill([KiokuConstants.availableSubCrys.CRIT_DMG, KiokuConstants.availableSubCrys.FLAT_ATK]).flat()

        this.supportKey = supportKey;
        this.support = supportKey ? Kioku.fromKey(supportKey) : undefined;

        this.kiokuAtk = this.data.minAtk + (this.kiokuLvl - 1) * (this.data.atk100 - this.data.minAtk) / (KiokuConstants.maxKiokuLvl - 1);
        this.ascensionAtk = this.ascension / 5 * this.data.atka5

        for (const [k, v] of Object.entries(KiokuConstants.heartphialAtkRewardLvls)) {
            if (this.heartphialLvl >= parseInt(k)) this.heartAtk += v;
        }


        for (let lvl = 1; lvl <= this.magicLvl; lvl++) {
            const lvlEff = magicData[+(this.data.rarity === 5)][lvl.toString()] as MagicLevel
            switch (lvlEff.eff) {
                case "UP_ATK_FIXED":
                    this.magicAtk += lvlEff.val
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
            }
        }

        if (this.support) this.supportAtk = 0.16 * this.support.getBaseAtk();

        this.setupEffects();
    }

    setupEffects(): void {
        for (const cry of [...this.crys, ...this.crys_sub]) {
            if (cry === KiokuConstants.availableCrys.EX || !this.isDps) continue;
            const eff = parseInt(cry.split("-")[1]);
            switch (cry) {
                // TODO: ADD SPD, MP+, AA on break, spd on break, others???
                // TODO: Allow input sub crys of these crys
                case KiokuConstants.availableCrys.FLAT_ATK:
                case KiokuConstants.availableSubCrys.FLAT_ATK:
                    this.atk_bonus_flat += eff;
                    break;
                case KiokuConstants.availableCrys.ATK_25_PERCENT:
                    this.add_to_effects("UP_ATK_RATIO", 10 * eff, "", "");
                    break;
                case KiokuConstants.availableCrys.CRIT_DMG:
                case KiokuConstants.availableSubCrys.CRIT_DMG:
                    this.add_to_effects("UP_CTD_FIXED", 10 * eff, "", "");
                    break;
                case KiokuConstants.availableCrys.DMG_TO_WEAK_ELEMENT:
                    this.add_to_effects("UP_WEAK_ELEMENT_DMG_RATIO", 10 * eff, "", "");
                    break;
                case KiokuConstants.availableCrys.ELEMENTAL_DMG:
                    this.add_to_effects("UP_GIV_DMG_RATIO", 10 * eff, "", "");
                    break;
                default:
                    console.warn("Uknown crys", cry)
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
                this.add_effects(supp_eff, true, 10, true);
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
            this.portraitAtk = portraitLevels[port_info.cardMstId * 10 + 5].atk;
            this.add_effects({ 1: port_eff[Math.max(...Object.keys(port_eff).map(Number))] }, true, 1, true);
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


    get_special_dmg(targetType: EnemyTargetTypes, amountOfEnemies: number, maxBreak: number, nrHitThatKills: number): [number, boolean] {
        let total_dmg = 0;
        for (const v of Object.values(find_all_details(false, this.data.special_id))) {
            // Not dmg or incorrect level
            if (parseInt(String(getIdx(v)).slice(-2)) !== this.specialLvl ||
                !v.abilityEffectType.startsWith("DMG_")) {
                continue;
            }
            nrHitThatKills -= 1
            if (v.activeConditionSetIdCsv.split(",").some((activeCondId: string) => {
                const isActiveCond = isActiveConditionRelevantForScoreAttack(activeCondId)
                if (typeof (isActiveCond) === 'boolean') {
                    if (!isActiveCond) return true;
                } else {
                    if (!isActiveCond(nrHitThatKills > 1 ? amountOfEnemies : amountOfEnemies - 1, maxBreak)) return true;
                }
                return false
            })) continue;


            if (v.abilityEffectType === "DMG_RANDOM" && targetType === EnemyTargetTypes.TARGET) total_dmg += v.value1 * v.value2;
            // We make random only hit lowest def for simplicity, since this is max dmg
            else if (v.range === 3) total_dmg += v.value1; // 3 is all enemies
            else if (v.range === 2 && (targetType === EnemyTargetTypes.L_PROXIMITY || targetType === EnemyTargetTypes.R_PROXIMITY)) total_dmg += v.value2;
            else if (targetType === EnemyTargetTypes.TARGET) total_dmg += v.value1;
        }
        return [total_dmg / 1000, nrHitThatKills < 1]
    }

    add_effects(details: Record<string, any>, is_unique: boolean, lvl: number, ignore_buff_mult = false) {
        const lvl_details = Object.values(details).filter(
            (v: any) =>
                (is_unique || parseInt(String(getIdx(v)).slice(-2)) === lvl) &&
                (this.isDps || v.range !== -1)
        );

        for (const skill of lvl_details) {
            let eff = skill.value1;
            // For multi-value skills, value2 is the max multiplier 
            if (skill.value2) {
                eff *= skill.value2;
            }

            if (!ignore_buff_mult) {
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
            if (skill.abilityEffectType === "TSUBAME_LINK") {
                this.add_to_effects("UP_SPD_RATIO", skill.value1, "", "");
                this.add_to_effects("UP_ATK_RATIO", skill.value2, "", "");
                this.add_to_effects("UP_GIV_DMG_RATIO", skill.value3, "", "");
            } else if (skill.abilityEffectType === "TSUBAME_CORE") {
                this.add_to_effects("DOWN_SPD_RATIO", skill.value1, "", "");
            } else {
                skill.activeConditionSetIdCsv.split(",").forEach((activeCondId: string) => {
                    this.add_to_effects(skill.abilityEffectType, eff, activeCondId, skill.startConditionSetIdCsv);
                });
            }
        }
    }

    getKey(): any[] {
        return [
            this.name,
            this.dpsElement,
            this.supportKey,
            this.portrait,
            this.isDps,
            this.ascension,
            this.kiokuLvl,
            this.magicLvl,
            this.heartphialLvl,
            this.specialLvl,
            this.crys,
        ];
    }

    static fromKey(key: any[]) {
        return getKioku({
            name: key[0],
            dpsElement: key[1],
            supportKey: key[2],
            portrait: key[3],
            isDps: key[4],
            ascension: key[5],
            kiokuLvl: key[6],
            magicLvl: key[7],
            heartphialLvl: key[8],
            specialLvl: key[9],
            crys: key[10],
        });
    }
}

interface KiokuArgs {
    name: string;
    dpsElement?: KiokuElement;
    kiokuLvl: number;
    magicLvl: number;
    heartphialLvl: number;
    portrait: string | undefined;
    supportKey: any[] | undefined;
    isDps: boolean;
    crys: AvailableCrys[];
    ascension: number;
    specialLvl: number;
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
    if (ascension == null) {
        console.warn("ascension was null, setting to", KiokuConstants.maxAscension)
        ascension = KiokuConstants.maxAscension
    }
    if (kiokuLvl == null) {
        console.warn("kiokuLvl was null, setting to", KiokuConstants.maxKiokuLvl)
        kiokuLvl = KiokuConstants.maxKiokuLvl
    }
    if (magicLvl == null) {
        console.warn("magicLvl was null, setting to", KiokuConstants.maxMagicLvl)
        magicLvl = KiokuConstants.maxMagicLvl
    }
    if (heartphialLvl == null) {
        console.warn("heartphialLvl was null, setting to", KiokuConstants.maxHeartphialLvl)
        heartphialLvl = KiokuConstants.maxHeartphialLvl
    }
    if (specialLvl == null) {
        console.warn("specialLvl was null, setting to", KiokuConstants.maxSpecialLvl)
        specialLvl = KiokuConstants.maxSpecialLvl
    }
    if (name == null || kiokuLvl == null || magicLvl == null || heartphialLvl == null || isDps == null || ascension == null || specialLvl == null) {
        throw new Error(`Ivalid arguments provided to getKioku ${{
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
            crys
        }}`);
    }
    const clearCrys = crys.filter(Boolean)
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
        clearCrys,
    ]);

    if (!cache.has(key)) {
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
            crys: clearCrys,
        }));
    }

    return cache.get(key);
}
