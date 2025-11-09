import { KiokuArgs, KiokuData, SkillDetail, skillDetailId, SkillKey } from '../types/KiokuTypes';
import { passiveDetails } from '../utils/helpers';
import { Kioku } from './Kioku';


export class PvPKioku extends Kioku {
    effects: SkillDetail[];
    private scalableEffects: Record<number, SkillDetail> = {};
    private unscalableEffects: Record<number, SkillDetail> = {};
    private buffMult = 1;
    private debuffMult = 1;

    constructor(args: KiokuArgs) {
        super(args);
        // NOTE: Passives are applied in order: (ability or ascension effect), portrait, support ability, crystalis

        this.addEffect(passiveDetails, "passiveSkillMstId", this.data.ability_id, this.abilityLvl, true);

        for (let i = 1; i <= this.ascension; i++) {
            const passiveId = this.data[`ascension_${i}_effect_2_id` as keyof KiokuData] as number;
            if (passiveId) this.addEffect(passiveDetails, "passiveSkillMstId", passiveId, 1, true);

        }

        if (this.portrait) {
            this.addEffect(passiveDetails, "passiveSkillMstId", this.portrait.passiveSkill1, 6, false);
        }

        if (this.support && [this.data.role, this.data.element].includes(this.support.data.support_target)) {
            this.addEffect(passiveDetails, "passiveSkillMstId", this.support.data.support_id, this.support.supportLvl, false);
        }

        this.crys.forEach(c => {
            this.addEffect(passiveDetails, "passiveSkillMstId", 0, c, false);
        });

        [...Object.values(this.unscalableEffects), ...Object.values(this.scalableEffects)].forEach(e => {
            if (e.abilityEffectType === "UP_BUFF_EFFECT_VALUE") {
                this.buffMult += e.value1 / 1000;
            } else if (e.abilityEffectType === "UP_DEBUFF_EFFECT_VALUE") {
                this.debuffMult += e.value1 / 1000;
            }
        });

        this.effects = Object.values(this.unscalableEffects).concat(Object.values(this.scalableEffects).map(e => {
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
        const target = affectedByMult ? this.scalableEffects : this.unscalableEffects
        for (const eff of Object.values(map).filter(v => (v as any)[key] === id * 100 + lvl)) {
            // Merge crys with same ID, nothing else has same ID so this is not risky
            if (skillDetailId(eff) in target) {
                const old = target[skillDetailId(eff)]
                target[skillDetailId(eff)] = { ...old, value1: old.value1 + eff.value1 }
            } else {
                target[skillDetailId(eff)] = eff
            }
        }
    }
}
