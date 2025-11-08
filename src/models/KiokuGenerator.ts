import { KiokuConstants, KiokuGeneratorArgs } from '../types/KiokuTypes';
import { Kioku } from './Kioku';
import { ScoreAttackKioku } from './ScoreAttackKioku';

const cache = new Map<string, Kioku>();

export interface KiokuArgs {
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

export function getKioku<T extends Kioku>({
    name,
    supportKey,
    portrait,
    ascension = KiokuConstants.maxAscension,
    kiokuLvl = KiokuConstants.maxKiokuLvl,
    magicLvl = KiokuConstants.maxMagicLvl,
    heartphialLvl = KiokuConstants.maxHeartphialLvl,
    specialLvl = KiokuConstants.maxSpecialLvl,
    crys = [],
    crys_sub = [],
    score = false,
}: KiokuGeneratorArgs): T {
    const clearCrys = crys.filter(Boolean)
    const clearSubCrys = crys_sub.filter(Boolean)
    const Class = score ? ScoreAttackKioku : Kioku;

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
        cache.set(key, new Class({
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

    return cache.get(key) as T;
}
