import { KiokuArgs, KiokuConstants, KiokuData, Portrait, StyleParamUpEffect } from '../types/KiokuTypes';
import { portraits, kiokuData, crystalises, characterHeart, characterHeartParamUpGroup, styleParamUpEffect, styleParamUp } from '../utils/helpers';
import { fromKey } from '../models/BestTeamCalculator';

export class Kioku {
    name: string;
    protected support?: Kioku;
    protected portrait?: Portrait;

    private inputCrys: string[];
    private inputCrysSub: string[];

    protected ascension: number;
    private kiokuLvl: number;
    private magicLvl: number;
    private heartphialLvl: number;

    supportLvl = 1;
    protected skillLvl = 1;
    protected abilityLvl = 1;
    protected attackLvl = 1;
    protected specialLvl: number;
    protected crys: number[] = [];

    data: KiokuData;

    private kiokuAtk: number;
    private kiokuDef: number;
    private kiokuHp: number;
    private magicAtk: number = 0;
    private magicDef: number = 0;
    private magicHp: number = 0;
    private heartAtk: number = 0;
    private heartDef: number = 0;
    private heartHp: number = 0;

    baseCritRate: number
    baseCritDamage: number;

    maxMagicStacks = 0;

    getBaseAtk(): number {
        return (this.kiokuAtk * (1 + 0.02 * this.ascension) + (this.support?.getBaseAtk() ?? 0) * 0.16 + (this.portrait?.stats?.atk ?? 0) + this.magicAtk + this.heartAtk);
    }

    getBaseDef(): number {
        return (this.kiokuDef * (1 + 0.02 * this.ascension) + (this.support?.getBaseDef() ?? 0) * 0.16 + (this.portrait?.stats?.def ?? 0) + this.magicDef + this.heartDef);
    }

    getBaseHp(): number {
        return (this.kiokuHp * (1 + 0.02 * this.ascension) + (this.support?.getBaseHp() ?? 0) * 0.16 + (this.portrait?.stats?.hp ?? 0) + this.magicHp + this.heartHp);
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
        this.data = kiokuData[name];

        if (portrait) this.portrait = portraits[portrait]
        if (supportKey) this.support = fromKey(supportKey);

        this.inputCrys = crys?.filter(Boolean) ?? [];
        this.inputCrysSub = crys_sub?.filter(Boolean) ?? [];

        this.ascension = ascension;
        this.kiokuLvl = kiokuLvl;
        this.magicLvl = magicLvl;
        this.heartphialLvl = heartphialLvl;
        this.specialLvl = specialLvl;
        this.maxMagicStacks = this.data.maxMagicStacks ?? 0
        this.baseCritDamage = this.data.minCritDmg * 10
        this.baseCritRate = this.data.minCritRate * 10

        this.kiokuAtk = this.data.minAtk + (this.kiokuLvl - 1) * (this.data.atk100 - this.data.minAtk) / (KiokuConstants.maxKiokuLvl - 1);
        this.kiokuDef = this.data.minDef + (this.kiokuLvl - 1) * (this.data.def100 - this.data.minDef) / (KiokuConstants.maxKiokuLvl - 1);
        this.kiokuHp = this.data.minHp + (this.kiokuLvl - 1) * (this.data.hp100 - this.data.minHp) / (KiokuConstants.maxKiokuLvl - 1);

        const heartGroup = characterHeart[this.data.id / 10_000]?.paramUpGroupId ?? 1;
        for (const v of Object.values(characterHeartParamUpGroup)) {
            if (v.paramUpGroupId === heartGroup && this.heartphialLvl > v.heartLevel) {
                this.addStat(v.styleParamUpEffectMstId, false);
            }
        }

        for (const v of Object.values(styleParamUp)) {
            if (v.styleMstId === this.data.id && v.priority <= this.magicLvl) {
                this.addStat(v.styleParamUpEffectMstId, true);
            }
        }

        for (const c of [...this.inputCrys, ...this.inputCrysSub]) {
            if (c === "EX") {
                this.crys.push(this.data.crystalis_id)
            } else if (c in crystalises) {
                this.crys.push(crystalises[c].value1)
            } else {
                console.error("Could not find", c, "in crystalises")
            }
        }
    }

    addStat(styleParamUpEffectMstId: number, isMagic: boolean) {
        const eff = styleParamUpEffect[styleParamUpEffectMstId] as StyleParamUpEffect

        switch (eff.abilityEffectType || eff.name) {
            case "UP_ATK_FIXED":
                if (isMagic) this.magicAtk += eff.value1
                else this.heartAtk += eff.value1
                break;
            case "UP_DEF_FIXED":
                if (isMagic) this.magicDef += eff.value1
                else this.heartDef += eff.value1
                break;
            case "UP_HP_FIXED":
                if (isMagic) this.magicHp += eff.value1
                else this.heartHp += eff.value1
                break;
            case "UP_CTR_FIXED":
                this.baseCritRate += eff.value1
                break;
            case "UP_CTD_FIXED":
                this.baseCritDamage += eff.value1
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
                console.warn("Missing lvl", eff)
        }
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
            this.inputCrys,
            this.inputCrysSub,
        ];
    }
}
