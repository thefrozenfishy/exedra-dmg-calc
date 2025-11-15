import { ActiveSkill, KiokuArgs, KiokuData, SkillDetail, SkillKey } from '../types/KiokuTypes';
import { passiveDetails, skillDetails } from '../utils/helpers';
import { Kioku } from './Kioku';


export class ScoreAttackKioku extends Kioku {
    effects: SkillDetail[];
    private scalableEffects: SkillDetail[] = [];
    private unscalableEffects: SkillDetail[] = [];
    private buffMult = 1;
    private debuffMult = 1;

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
            this.addEffect(passiveDetails, "passiveSkillMstId", 0, c, false);
        });

        this.addEffect(skillDetails, "skillMstId", this.data.special_id, this.specialLvl, true);
        this.addEffect(skillDetails, "skillMstId", this.data.attack_id, this.attackLvl, true);

        this.addEffect(passiveDetails, "passiveSkillMstId", this.data.ability_id, this.abilityLvl, true);
        let skillId = this.data.skill_id;
        this.scalableEffects.forEach(e => {
            if ((e as ActiveSkill).abilityEffectType === "SWITCH_SKILL") {
                skillId = e.value1
            }
        });
        this.addEffect(skillDetails, "skillMstId", skillId, this.skillLvl, true);

        [...this.unscalableEffects, ...this.scalableEffects].forEach(e => {
            if (e.abilityEffectType === "UP_BUFF_EFFECT_VALUE") {
                this.buffMult += e.value1 / 1000;
            } else if (e.abilityEffectType === "UP_DEBUFF_EFFECT_VALUE") {
                this.debuffMult += e.value1 / 1000;
            }
            if (e.abilityEffectType === "ADDITIONAL_SKILL_ACT") {
                this.addEffect(skillDetails, "skillMstId", 0, e.value1, true);
            }
        });
        this.scalableEffects.forEach(e => {
            if (e.abilityEffectType === "TSUBAME_LINK") {
                this.scalableEffects.push(
                    { ...e, abilityEffectType: "UP_ATK_RATIO", value1: e.value2, value2: 0, value3: 0 },
                    { ...e, abilityEffectType: "UP_DMG_DEALT", value1: e.value3, value2: 0, value3: 0 }
                )
            }
        })

        this.effects = this.unscalableEffects.concat(this.scalableEffects.map(e => {
            let v = e.value1;
            if (e.abilityEffectType.startsWith("DWN_") || e.abilityEffectType.startsWith("DOWN_") || e.abilityEffectType === "UP_RCV_DMG_RATIO") {
                v *= this.debuffMult;
            } else if (e.abilityEffectType.startsWith("UP_")) {
                v *= this.buffMult;
            }
            return { ...e, value1: v }
        }));
    }

    addEffect(map: Record<any, SkillDetail>, key: SkillKey, id: number, lvl: number, affectedByMult: boolean) {
        (affectedByMult ? this.scalableEffects : this.unscalableEffects).push(...Object.values(map).filter(v => (v as any)[key] === id * 100 + lvl));
    }
}
