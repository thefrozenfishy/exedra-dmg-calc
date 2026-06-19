import { ActiveSkill, Aliment, KiokuArgs, KiokuData, SkillDetail, skillDetailId, SkillKey } from '../types/KiokuTypes';
import { passiveDetails, skillDetails } from '../utils/helpers';
import { Kioku } from './Kioku';


export class ScoreAttackKioku extends Kioku {
    effects: SkillDetail[];
    shouldUseSupportAndPortraitReason = 0;
    private scalableEffects: Record<string, SkillDetail> = {};
    private unscalableEffects: Record<string, SkillDetail> = {};
    private buffMult = 1;
    private debuffMult = 1;
    private debuffTurnBonus = 0;

    constructor(args: KiokuArgs, buffMultReduction = 0, debuffMultReduction = 0) {
        super(args);
        this.buffMult -= buffMultReduction / 100;
        this.debuffMult -= debuffMultReduction / 100;

        if (this.support && [this.data.role, this.data.element].includes(this.support.data.support_target)) {
            this.addEffect(passiveDetails, "passiveSkillMstId", this.support.data.support_id, this.support.supportLvl, false);
        }
        if (this.portrait) {
            this.addEffect(passiveDetails, "passiveSkillMstId", this.portrait.passiveSkill1, 6, false);
        }
        for (let i = 1; i <= this.ascension; i++) {
            const passiveId = this.data[`ascension_${i}_effect_2_id` as keyof KiokuData] as number;
            if (passiveId) this.addEffect(passiveDetails, "passiveSkillMstId", passiveId, 1, true);

        }
        this.crys.forEach(c => {
            this.addEffect(passiveDetails, "passiveSkillMstId", 0, c, false, true);
        });

        this.addEffect(skillDetails, "skillMstId", this.data.special_id, this.specialLvl, true);
        this.addEffect(skillDetails, "skillMstId", this.data.attack_id, this.attackLvl, true);

        this.addEffect(passiveDetails, "passiveSkillMstId", this.data.ability_id, this.abilityLvl, true);
        let skillId = this.data.skill_id;
        Object.values(this.scalableEffects).forEach(e => {
            if ((e as ActiveSkill).abilityEffectType === "SWITCH_SKILL") {
                skillId = e.value1
            }
        });
        this.addEffect(skillDetails, "skillMstId", skillId, this.skillLvl, true);

        [...Object.values(this.unscalableEffects), ...Object.values(this.scalableEffects)].forEach(e => {
            if (e.abilityEffectType === "UP_BUFF_EFFECT_VALUE") {
                this.buffMult += e.value1 / 1000;
            } else if (e.abilityEffectType === "UP_DEBUFF_EFFECT_VALUE") {
                this.debuffMult += e.value1 / 1000;
            } else if (e.abilityEffectType === "ADDITIONAL_SKILL_ACT") {
                this.addEffect(skillDetails, "skillMstId", 0, e.value1, true);
            } else if (e.abilityEffectType === "ADD_DEBUFF_TURN") {
                this.debuffTurnBonus += e.value1; // Also increases buffs atm, but since those can't pop it doesn't matter. This is for dot pop
            }
        });

        Object.values(this.scalableEffects).forEach(e => {
            if (e.abilityEffectType === "TSUBAME_LINK") {
                this.scalableEffects[skillDetailId(e).toString() + "1"] = { ...e, abilityEffectType: "UP_ATK_RATIO", value1: e.value2, value2: 0, value3: 0 };
                this.scalableEffects[skillDetailId(e).toString() + "2"] = { ...e, abilityEffectType: "ADDITIONAL_DAMAGE", value1: e.value3, value2: 0, value3: 0 };
                this.scalableEffects[skillDetailId(e).toString() + "3"] = { ...e, abilityEffectType: "TSUBAME", value1: 0, value2: 0, value3: 0 }; // This is just to trigger the active condition
            }
        })

        if (this.buffMult < 0) this.buffMult = 0;
        if (this.debuffMult < 0) this.debuffMult = 0;
        this.effects = Object.values(this.unscalableEffects).concat(Object.values(this.scalableEffects).map(e => {
            let v = e.value1;
            if (e.abilityEffectType.startsWith("DWN_") || e.abilityEffectType.startsWith("DOWN_") || e.abilityEffectType.replace("AIM_", "") === "UP_RCV_DMG_RATIO") {
                v *= this.debuffMult;
            } else if (e.abilityEffectType.startsWith("UP_")) {
                v *= this.buffMult;
            }
            return { ...e, value1: v, turn: e.turn + this.debuffTurnBonus }
        }));
        this.effects.forEach(e => {
            const dotType = e.abilityEffectType.replace("_ATK", "");

            if (e.abilityEffectType === "ADDITIONAL_DAMAGE") {
                this.shouldUseSupportAndPortraitReason = 1;
            } else if (dotType !== Aliment.WEAKNESS && Object.values(Aliment).includes(dotType as Aliment)) {
                this.shouldUseSupportAndPortraitReason = 2;
            }
        });
    }

    addEffect(map: Record<any, SkillDetail>, key: SkillKey, id: number, lvl: number, affectedByMult: boolean, retainDupes = false) {
        const obj = Object.values(map).filter(v => (v as any)[key] === id * 100 + lvl);
        const target = affectedByMult ? this.scalableEffects : this.unscalableEffects;
        for (const e of obj) {
            let key = skillDetailId(e).toString();
            if (retainDupes) {
                let idx = 1;
                while (key in target) {
                    key = `${skillDetailId(e)}${idx++}`;
                }
            }
            if (Object.keys(target).includes(key)) {
                console.warn(`Duplicate effect ID ${key} on ${this.name} for`, e)
            } else {
                target[key] = e;
            }
        }
    }
}
