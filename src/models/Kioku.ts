import { KiokuArgs, KiokuData, KiokuRole, Portrait, StyleParamUpEffect } from '../types/KiokuTypes';
import { portraits, kiokuData, crystalises, characterHeart, characterHeartParamUpGroup, styleParamUpEffect, styleParamUp } from '../utils/helpers';

const KIOKU_LEVEL_BREAKPOINTS = [1, 120, 140, 160, 180, 200] as const;

// Fetched from config.json cause I'm lazy
const ROLE_COEFFICIENTS: Record<string, { hp: number; atk: number; def: number }> = {
    [KiokuRole.Attacker]: { hp: 950, atk: 1100, def: 950 },
    [KiokuRole.Breaker]: { hp: 1000, atk: 1000, def: 1000 },
    [KiokuRole.Healer]: { hp: 1000, atk: 1000, def: 1000 },
    [KiokuRole.Buffer]: { hp: 1000, atk: 1000, def: 1000 },
    [KiokuRole.Debuffer]: { hp: 1000, atk: 1000, def: 1000 },
    [KiokuRole.Defender]: { hp: 1050, atk: 800, def: 1150 }
};

const linear_interpolation = (a: number, b: number, t: number) =>
    a + (b - a) * t;

const kiokuStat = (lvl: number, v: readonly number[]) => {
    const i = KIOKU_LEVEL_BREAKPOINTS.findIndex(L => lvl <= L);
    if (i <= 0) return v[0];
    if (i === -1) return v.at(-1)!;
    return linear_interpolation(
        v[i - 1],
        v[i],
        (lvl - KIOKU_LEVEL_BREAKPOINTS[i - 1]) /
        (KIOKU_LEVEL_BREAKPOINTS[i] - KIOKU_LEVEL_BREAKPOINTS[i - 1])
    );
};


export class Kioku {
    name: string;
    protected support?: Kioku;
    protected portrait?: Portrait;

    private inputCrysIDs: number[];
    private inputSubCrysIDs: number[];

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
        return Math.floor(this.kiokuAtk * (1 + 0.02 * this.ascension)) + Math.floor((this.support?.getBaseAtk() ?? 0) * 0.16) + (this.portrait?.stats?.atk ?? 0) + this.magicAtk + this.heartAtk;
    }

    getBaseDef(): number {
        return Math.floor(this.kiokuDef * (1 + 0.02 * this.ascension)) + Math.floor((this.support?.getBaseDef() ?? 0) * 0.16) + (this.portrait?.stats?.def ?? 0) + this.magicDef + this.heartDef;
    }

    getBaseHp(): number {
        return Math.floor(this.kiokuHp * (1 + 0.02 * this.ascension)) + Math.floor((this.support?.getBaseHp() ?? 0) * 0.16) + (this.portrait?.stats?.hp ?? 0) + this.magicHp + this.heartHp;
    }

    getTotalPower(): number {
        const roleCoeff = ROLE_COEFFICIENTS[this.data.role]
        const hpTerm = (100 / 1000) * this.getBaseHp() * (roleCoeff.hp / 1000);
        const atkTerm = (300 / 1000) * this.getBaseAtk() * (roleCoeff.atk / 1000);
        const defTerm = (300 / 1000) * this.getBaseDef() * (roleCoeff.def / 1000);
        const baseStatsBracket = hpTerm + atkTerm + defTerm;

        const critModifierBracket = ((this.baseCritRate / 1000) * (this.baseCritDamage / 1000)) + 1.0;

        const baseSkillVal = 1000 / 1000.0;
        const normalSkillTerm = (this.attackLvl * 30) / 1000.0;
        const activeSkillTerm = (this.skillLvl * 120) / 1000.0;
        const passiveSkillTerm = (this.abilityLvl * 100) / 1000.0;
        const specialAttackTerm = this.data.rarity === 3 ? 0 : (this.specialLvl * 150) / 1000.0;

        const skillModifierBracket = baseSkillVal + normalSkillTerm + activeSkillTerm + passiveSkillTerm + specialAttackTerm;

        const finalPowerFloat = baseStatsBracket * critModifierBracket * skillModifierBracket;
        return Math.floor(finalPowerFloat);
    }

    constructor({
        name,
        support,
        portrait,
        ascension,
        kiokuLvl,
        magicLvl,
        heartphialLvl,
        specialLvl,
        crysIDs,
        subCrysIDs
    }: KiokuArgs) {
        this.name = name;
        this.data = kiokuData[name];

        if (portrait) this.portrait = portraits[portrait]
        if (support) this.support = support;

        this.inputCrysIDs = crysIDs?.filter(Boolean) ?? [];
        this.inputSubCrysIDs = subCrysIDs?.filter(Boolean) ?? [];

        this.ascension = ascension;
        this.kiokuLvl = kiokuLvl;
        this.magicLvl = magicLvl;
        this.heartphialLvl = heartphialLvl;
        this.specialLvl = specialLvl;
        this.maxMagicStacks = this.data.maxMagicStacks ?? 0
        this.baseCritDamage = this.data.minCritDmg * 10
        this.baseCritRate = this.data.minCritRate * 10

        this.kiokuAtk = Math.floor(
            kiokuStat(this.kiokuLvl, [
                this.data.minAtk,
                this.data.atk120,
                this.data.atk140,
                this.data.atk160,
                this.data.atk180,
                this.data.atk200
            ])
        );

        this.kiokuDef = Math.floor(
            kiokuStat(this.kiokuLvl, [
                this.data.minDef,
                this.data.def120,
                this.data.def140,
                this.data.def160,
                this.data.def180,
                this.data.def200
            ])
        );

        this.kiokuHp = Math.floor(
            kiokuStat(this.kiokuLvl, [
                this.data.minHp,
                this.data.hp120,
                this.data.hp140,
                this.data.hp160,
                this.data.hp180,
                this.data.hp200
            ])
        );


        const heartGroup = characterHeart[this.data.id / 10_000]?.paramUpGroupId ?? 1;
        for (const v of Object.values(characterHeartParamUpGroup)) {
            if (v.paramUpGroupId === heartGroup && this.heartphialLvl >= v.heartLevel) {
                this.addStat(v.styleParamUpEffectMstId, false);
            }
        }

        for (const v of Object.values(styleParamUp)) {
            if (v.styleMstId === this.data.id && v.priority <= this.magicLvl) {
                this.addStat(v.styleParamUpEffectMstId, true);
            }
        }

        for (const c of [...this.inputCrysIDs, ...this.inputSubCrysIDs]) {
            if (c in crystalises) {
                this.crys.push(crystalises[c].value1)
            } else {
                console.warn("Could not find", c, "in crystalises")
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
            this.inputCrysIDs,
            this.inputSubCrysIDs,
        ];
    }

    static fromKey(key: any[]): Kioku {
        if (!key || key.length === 0) return undefined as any;

        return new Kioku({
            name: key[0],
            support: key[1] ? Kioku.fromKey(key[1]) : undefined,
            portrait: key[2],
            ascension: key[3],
            kiokuLvl: key[4],
            magicLvl: key[5],
            heartphialLvl: key[6],
            specialLvl: key[7],
            crysIDs: key[8],
            subCrysIDs: key[9],
        });
    }
}
