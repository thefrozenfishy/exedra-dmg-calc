import { ScoreAttackKioku } from "./ScoreAttackKioku";
import { EnemyTargetTypes, Enemy } from "../types/EnemyTypes";
import { isActiveConditionRelevantForScoreAttack, isStartCondRelevantForScoreAttack } from "./BattleConditionParser";
import { ActiveSkill, Aliment, elementMap, SkillDetail, skillDetailId } from "../types/KiokuTypes";

const targetTypeAtPosition = [
    EnemyTargetTypes.L_OTHER,
    EnemyTargetTypes.L_PROXIMITY,
    EnemyTargetTypes.TARGET,
    EnemyTargetTypes.R_PROXIMITY,
    EnemyTargetTypes.R_OTHER,
];

const DPS_IDX = 2;

export const knownBoosts = {
    DWN_DEF_ACCUM_RATIO: "Def%2",
    DWN_DEF_RATIO: "Def%1",
    DWN_ELEMENT_RESIST_ACCUM_RATIO: "Elem Resist-",
    FLAT_ATK: "Flat atk",
    UP_AIM_RCV_DMG_RATIO: "Elem DMG Taken+",
    UP_ATK_ACCUM_RATIO: "Atk%2",
    UP_ATK_FIXED: "FlatAtk",
    UP_ATK_RATIO: "Atk%1",
    UP_ATK_CONSUME_RATIO: "Atk%3",
    UP_CTD_ACCUM_RATIO: "CD2+",
    UP_CTD_FIXED: "CD1+",
    UP_CTD_RATIO: "CD3+",
    UP_CTR_ACCUM_RATIO: "CR2+",
    UP_CTR_FIXED: "CR1+",
    UP_CTR_RATIO: "CR3+",
    UP_DEF_ACCUM_RATIO: "Def%1",
    UP_DEF_FIXED: "Flat def",
    UP_DEF_RATIO: "Def%2",
    ADDITIONAL_DAMAGE: "Additional dmg",
    UP_ELEMENT_DMG_RATE_RATIO: "Dmg Dealt+ (Elem only)",
    UP_GIV_DMG_RATIO: "DMG Dealt+1",
    UP_GIV_DMG_ACCUM_RATIO: "DMG Dealt+2",
    UP_GIV_SLIP_DMG_RATIO: "DOT DMG+",
    UP_RCV_CTR_RATIO: "CR4+",
    UP_RCV_DMG_RATIO: "DMG Taken+",
    UP_WEAK_ELEMENT_DMG_RATIO: "Elem Dmg+",
    WEAKNESS: "Def%3",
};

const skippable = new Set([
    "ADD_BUFF_TURN",
    "ADD_DEBUFF_TURN",
    "ADDITIONAL_SKILL_ACT",
    "ADDITIONAL_TURN_UNIT_ACT",
    "BARRIER",
    "BLEED_ATK",
    "BURN_ATK",
    "CHARGE",
    "CONSUME_CHARGE_POINT",
    "CONSUME_COUNT_POINT",
    "CONSUME_ZONE_STACK",
    "CONTINUOUS_RECOVERY",
    "COUNT",
    "CURSE_ATK",
    "CUTOUT",
    "DMG_ATK",
    "DMG_DEF",
    "DMG_RANDOM",
    "DOWN_SPD_RATIO",
    "DWN_ATK_RATIO",
    "DWN_RCV_DMG_RATIO",
    "DWN_SPD_ACCUM_RATIO",
    "DWN_SPD_RATIO",
    "GAIN_CHARGE_POINT",
    "GAIN_COUNT_POINT",
    "GAIN_EP_FIXED",
    "GAIN_EP_RATIO",
    "GAIN_SP_FIXED",
    "GAIN_ZONE_STACK",
    "HASTE",
    "IMM_SLIP_DMG",
    "POISON_ATK",
    "RE_ACTION_TURN_UNIT_ACT",
    "RECOVERY_HP_ATK",
    "RECOVERY_HP",
    "REFLECTION_RATIO",
    "REGAIN_ATK",
    "REMOVE_ALL_ABNORMAL",
    "REMOVE_ALL_BUFF",
    "REMOVE_ALL_DEBUFF",
    "SHIELD",
    "SLOW",
    "STUN",
    "SWITCH_SKILL",
    "TSUBAME_CORE",
    "TSUBAME_LINK",
    "TSUBAME",
    "UNIQUE_10030301",
    "UNIQUE_10070201",
    "UNIQUE_BUFF_ACCUM",
    "UNIQUE_BUFF",
    "UNIQUE_DEBUFF_ACCUM",
    "UNIQUE_DEBUFF",
    "UP_ABNORMAL_HIT_RATE_RATIO",
    "UP_BREAK_DAMAGE_RECEIVE_RATIO",
    "UP_BREAK_EFFECT",
    "UP_BUFF_EFFECT_VALUE",
    "UP_BUFF_EFFECT_VALUE",
    "UP_DEBUFF_EFFECT_VALUE",
    "UP_EFFECT_HIT_RATE_RATIO",
    "UP_EFFECT_PARRY_RATE_RATIO",
    "UP_EP_RECOVER_RATE_RATIO",
    "UP_GIV_BREAK_POINT_DMG_FIXED",
    "UP_GIV_VORTEX_DMG_RATIO",
    "UP_HATE",
    "UP_HEAL_RATE_RATIO",
    "UP_HP_FIXED",
    "UP_HP_RATIO",
    "UP_RCV_BREAK_POINT_DMG_RATIO",
    "UP_SPD_ACCUM_RATIO",
    "UP_SPD_FIXED",
    "UP_SPD_RATIO",
    "ZONE_STACK",
    "VORTEX_ATK",
]);

const bannedEffects: Set<number> = new Set([
    65101002, // Sakurako passive is listed multiple places
    65101003, // Sakurako passive is listed multiple places
    12701003, // Yotsugi too
    12721005, // Yotsugi too
]);

function prettyNumber(n: number) {
    const rounded = Math.round((n + Number.EPSILON) * 100) / 100;
    return Number(rounded.toString());
}

function buffAppliesToAlly(range: number, sourceIdx: number, targetIdx: number): boolean {
    if (range === -1) return sourceIdx === targetIdx;
    if (range >= 2) return true;
    return targetIdx === DPS_IDX;
}

type EffectPool = Record<string, number>;
type ExtraEffectPool = Record<string, [Function, number][]>;
export type DebugContributions = Record<string, [SkillDetail, number, string, string?, string?][]>;
export type DotAllyCompositeKey = `${number}_${string}`;

interface AllyContext {
    kioku: ScoreAttackKioku;
    isDps: boolean;
    effects: EffectPool;
    extraEffects: ExtraEffectPool;
    debugContributionsToDps: DebugContributions;
    debugContributionsToSelf: DebugContributions;
    debugDebuffContributions: DebugContributions;
}

export interface DebugSections {
    calc: string;
    enemy: string;
    kiokuStats: string;
    kiokuReceived: string;
    kiokuContributed: string;
    kiokuDebuffs: string;
    rawReceived: DebugContributions;
    rawContributed: DebugContributions;
    rawDebuffs: DebugContributions;
}

const emptyDebugSections = (): DebugSections => ({
    calc: "",
    enemy: "",
    kiokuStats: "",
    kiokuReceived: "",
    kiokuContributed: "",
    kiokuDebuffs: "",
    rawReceived: {},
    rawContributed: {},
    rawDebuffs: {},
});

export class ScoreAttackTeam {
    private team: ScoreAttackKioku[];
    private dps: ScoreAttackKioku;

    private allyContexts: AllyContext[] = [];
    private debuffPool: EffectPool = {};
    private extraDebuffPool: ExtraEffectPool = {};

    private debug: boolean;
    private attackerHealth: number;
    private activeBuffsAndDebuffs: string[];
    private userBannedEffects: Set<number>;
    private enabledDotAllyEffects: Set<DotAllyCompositeKey>;

    private hasDpsDotPop: boolean = false;
    private dotAllyIndices: { idx: number; charId: string; name: string }[] = [];

    constructor(
        dps: ScoreAttackKioku,
        team: ScoreAttackKioku[],
        attackerHealth: number,
        activeAliments: Aliment[],
        debug = false,
        userBannedEffects: Set<number> = new Set(),
        enabledDotAllyEffects: Set<DotAllyCompositeKey> = new Set(),
    ) {
        this.team = team;
        this.dps = dps;
        this.debug = debug;
        this.attackerHealth = attackerHealth;
        this.activeBuffsAndDebuffs = activeAliments;
        this.userBannedEffects = userBannedEffects;
        this.enabledDotAllyEffects = enabledDotAllyEffects;
        this.setup();
    }

    private setup() {
        const alliesOrdered: ScoreAttackKioku[] = [
            this.team[0],
            this.team[1],
            this.dps,
            this.team[2],
            this.team[3],
        ];

        for (const kioku of alliesOrdered) {
            kioku.effects = kioku.effects.filter(detail => {
                if (
                    Aliment.WEAKNESS === detail.abilityEffectType &&
                    !this.activeBuffsAndDebuffs.includes(Aliment.WEAKNESS)
                ) {
                    return false;
                }
                if (!this.activeBuffsAndDebuffs.includes(detail.abilityEffectType)) {
                    this.activeBuffsAndDebuffs.push(detail.abilityEffectType);
                }
                return true;
            });
        }

        this.debuffPool["DWN_DEF_ACCUM_RATIO"] = 1;
        this.debuffPool["DWN_DEF_RATIO"] = 1;
        this.debuffPool["WEAKNESS"] = 0;

        this.hasDpsDotPop = this.dps.effects.some(
            eff => eff.abilityEffectType === "IMM_SLIP_DMG",
        );

        if (this.hasDpsDotPop) {
            for (const nonDpsIdx of [0, 1, 3, 4]) {
                const kioku = alliesOrdered[nonDpsIdx];
                const hasDot = kioku.effects.some(eff => {
                    const dotType = eff.abilityEffectType.replace("_ATK", "");
                    return (
                        dotType !== Aliment.WEAKNESS &&
                        Object.values(Aliment).includes(dotType as Aliment) &&
                        this.activeBuffsAndDebuffs.includes(dotType)
                    );
                });
                if (hasDot) {
                    this.dotAllyIndices.push({
                        idx: nonDpsIdx,
                        charId: String(kioku.data.id),
                        name: kioku.name,
                    });
                }
            }
        }

        for (let idx = 0; idx < 5; idx++) {
            this.allyContexts.push({
                kioku: alliesOrdered[idx],
                isDps: idx === DPS_IDX,
                effects: {},
                extraEffects: {},
                debugContributionsToDps: {},
                debugContributionsToSelf: {},
                debugDebuffContributions: {},
            });
        }

        for (let sourceIdx = 0; sourceIdx < 5; sourceIdx++) {
            const sourceKioku = alliesOrdered[sourceIdx];
            const sourceCtx = this.allyContexts[sourceIdx];

            for (const detail of sourceKioku.effects) {
                if (skippable.has(detail.abilityEffectType)) continue;
                if (bannedEffects.has(skillDetailId(detail))) continue;
                if (
                    detail.startConditionSetIdCsv
                        .split(",")
                        .some(id => !isStartCondRelevantForScoreAttack(id, sourceKioku.maxMagicStacks))
                ) continue;

                const userBanned = this.userBannedEffects.has(skillDetailId(detail));

                let valueTotal = detail.value1;
                valueTotal *= detail.value2 || 1;

                const isDebuff = detail.abilityEffectType.startsWith("DWN_")
                    || detail.abilityEffectType.startsWith("DOWN_")
                    || detail.abilityEffectType.replace("AIM_", "") === "UP_RCV_DMG_RATIO"
                    || detail.abilityEffectType === "WEAKNESS";

                if (isDebuff) {
                    if (detail.element && elementMap[detail.element] !== this.dps.data.element) continue;
                    this.distributeEffect(
                        detail,
                        valueTotal,
                        this.debuffPool,
                        this.extraDebuffPool,
                        undefined,
                        undefined,
                        sourceCtx.debugDebuffContributions,
                        sourceKioku.name,
                        userBanned,
                    );
                } else {
                    for (let targetIdx = 0; targetIdx < 5; targetIdx++) {
                        if (!buffAppliesToAlly(detail.range, sourceIdx, targetIdx)) continue;

                        const targetCtx = this.allyContexts[targetIdx];
                        if (detail.element && elementMap[detail.element] !== targetCtx.kioku.data.element) continue;

                        const dbgToDps = targetIdx === DPS_IDX
                            ? sourceCtx.debugContributionsToDps
                            : undefined;

                        const dbgToSelf = targetCtx.debugContributionsToSelf;

                        this.distributeEffect(
                            detail,
                            valueTotal,
                            targetCtx.effects,
                            targetCtx.extraEffects,
                            dbgToDps,
                            dbgToSelf,
                            undefined,
                            sourceKioku.name,
                            userBanned,
                        );
                    }

                    if (detail.range === 1 && this.dotAllyIndices.length > 0) {
                        for (const { idx: dotIdx, charId, name: dotName } of this.dotAllyIndices) {
                            if (dotIdx === DPS_IDX) continue;

                            const dotCtx = this.allyContexts[dotIdx];
                            if (detail.element && elementMap[detail.element] !== dotCtx.kioku.data.element) continue;

                            const compositeKey = `${skillDetailId(detail)}_${charId}` as DotAllyCompositeKey;
                            const dotEnabled = this.enabledDotAllyEffects.has(compositeKey);

                            this.distributeEffect(
                                detail,
                                valueTotal,
                                dotCtx.effects,
                                dotCtx.extraEffects,
                                sourceCtx.debugContributionsToDps,
                                dotCtx.debugContributionsToSelf,
                                undefined,
                                sourceKioku.name,
                                !dotEnabled,
                                charId,
                                dotName,
                            );
                        }
                    }
                }
            }
        }

        if (this.debug) {
            console.log(
                "Debuff pool",
                Object.fromEntries(Object.entries(this.debuffPool).filter(([key]) => key in knownBoosts)),
            );
            for (let i = 0; i < 5; i++) {
                console.log(
                    `Ally[${i}] buff pool`,
                    Object.fromEntries(Object.entries(this.allyContexts[i].effects).filter(([key]) => key in knownBoosts)),
                );
            }
        }

        const allPoolKeys = [
            ...Object.keys(this.debuffPool),
            ...this.allyContexts.flatMap(ctx => Object.keys(ctx.effects)),
        ];
        const leftover = [...new Set(allPoolKeys)].filter(
            key => !(key in knownBoosts) && !skippable.has(key),
        );
        if (leftover.length > 0) {
            throw new Error(`Found unknown effects: ${leftover.join(", ")}`);
        }
    }

    private distributeEffect(
        detail: SkillDetail,
        valueTotal: number,
        pool: EffectPool,
        extraPool: ExtraEffectPool,
        debugContributionsToDps?: DebugContributions,
        debugContributionsToSelf?: DebugContributions,
        debugDebuffContributions?: DebugContributions,
        sourceName: string = "?",
        userBanned: boolean = false,
        dotTargetCharId?: string,
        dotTargetName?: string,
    ) {
        detail.activeConditionSetIdCsv.split(",").forEach(activeCondId => {
            const isActiveCond = isActiveConditionRelevantForScoreAttack(
                activeCondId,
                this.attackerHealth,
                this.activeBuffsAndDebuffs,
            );

            if (typeof isActiveCond === "boolean") {
                if (!isActiveCond) return;
                for (const dbg of [debugContributionsToDps, debugContributionsToSelf, debugDebuffContributions]) {
                    if (!dbg) continue;
                    if (!(detail.abilityEffectType in dbg)) dbg[detail.abilityEffectType] = [];
                    dbg[detail.abilityEffectType].push([detail, valueTotal, sourceName, dotTargetCharId, dotTargetName]);
                }
                if (!userBanned) {
                    this.accumulateIntoPool(detail.abilityEffectType, valueTotal, pool);
                }
            } else {
                if (!(detail.abilityEffectType in extraPool)) {
                    extraPool[detail.abilityEffectType] = [];
                }
                if (!userBanned) {
                    extraPool[detail.abilityEffectType].push([isActiveCond, valueTotal]);
                }
                for (const dbg of [debugContributionsToDps, debugContributionsToSelf, debugDebuffContributions]) {
                    if (!dbg) continue;
                    if (!(detail.abilityEffectType in dbg)) dbg[detail.abilityEffectType] = [];
                    dbg[detail.abilityEffectType].push([detail, valueTotal, sourceName, dotTargetCharId, dotTargetName]);
                }
            }
        });
    }

    private accumulateIntoPool(effectType: string, value: number, pool: EffectPool) {
        if (effectType in pool) {
            if (["DWN_DEF_RATIO", "DWN_DEF_ACCUM_RATIO"].includes(effectType)) {
                pool[effectType] *= 1 - value / 1000;
            } else if (effectType === "WEAKNESS") {
                pool[effectType] += 1;
            } else {
                pool[effectType] += value;
            }
        } else {
            pool[effectType] = value;
        }
    }

    private getAllyEffect(allyIdx: number, eff: string, amountOfEnemies: number, maxBreak: number): number {
        const ctx = this.allyContexts[allyIdx];
        let val = ctx.effects[eff] ?? 0;
        ctx.extraEffects[eff]?.forEach(([fun, v]) => {
            if (fun(amountOfEnemies, maxBreak)) {
                if (["DWN_DEF_RATIO", "DWN_DEF_ACCUM_RATIO"].includes(eff)) {
                    val *= 1 - v / 1000;
                } else {
                    val += v;
                }
            }
        });
        return val;
    }

    private getDebuffEffect(eff: string, amountOfEnemies: number, maxBreak: number): number {
        let val = this.debuffPool[eff] ?? 0;
        this.extraDebuffPool[eff]?.forEach(([fun, v]) => {
            if (fun(amountOfEnemies, maxBreak)) {
                if (["DWN_DEF_RATIO", "DWN_DEF_ACCUM_RATIO"].includes(eff)) {
                    val *= 1 - v / 1000;
                } else {
                    val += v;
                }
            }
        });
        return val;
    }

    calc_base_dmg(ability_percentage: number, base_atk: number): number {
        return ability_percentage * base_atk * ((base_atk / 124) ** 1.2 + 12) / 20;
    }

    private resolveAllyAtk(
        allyIdx: number,
        useDef: boolean,
        amountOfEnemies: number,
        maxBreak: number,
        atkDown = 0,
    ): number {
        const kioku = this.allyContexts[allyIdx].kioku;
        const base = useDef ? kioku.getBaseDef() : kioku.getBaseAtk();
        const statKey = useDef ? "DEF" : "ATK";

        const atkPlus =
            (this.getAllyEffect(allyIdx, `UP_${statKey}_RATIO`, amountOfEnemies, maxBreak) +
                this.getAllyEffect(allyIdx, `UP_${statKey}_CONSUME_RATIO`, amountOfEnemies, maxBreak) +
                this.getAllyEffect(allyIdx, `UP_${statKey}_ACCUM_RATIO`, amountOfEnemies, maxBreak)) /
            1000;

        const flatAtk = this.getAllyEffect(allyIdx, `UP_${statKey}_FIXED`, amountOfEnemies, maxBreak);
        return base * (1 + atkPlus) * (1 - atkDown) + flatAtk;
    }

    add_additional_dmg(): number {
        let base_dmg = 0;
        for (const ally of this.team) {
            for (const eff of ally.effects) {
                if (eff.abilityEffectType === "ADDITIONAL_DAMAGE") {
                    base_dmg += this.calc_base_dmg(eff.value1 / 1000, ally.getBaseAtk());
                }
            }
        }
        return base_dmg;
    }

    add_dot_dmg(enemy: Enemy, amountOfEnemies: number): number {
        let total = 0;

        const def_remaining =
            this.getDebuffEffect("DWN_DEF_ACCUM_RATIO", amountOfEnemies, enemy.maxBreak) *
            this.getDebuffEffect("DWN_DEF_RATIO", amountOfEnemies, enemy.maxBreak) *
            (0.9 ** this.debuffPool["WEAKNESS"]);
        const elem_res_down =
            this.getDebuffEffect("DWN_ELEMENT_RESIST_ACCUM_RATIO", amountOfEnemies, enemy.maxBreak) / 1000;
        const break_factor = enemy.isBreak ? enemy.maxBreak / 100 : 1;

        for (let allyIdx = 0; allyIdx < 5; allyIdx++) {
            let passive_done = false;
            let active_done = false;

            for (const eff of this.allyContexts[allyIdx].kioku.effects) {
                const dotType = eff.abilityEffectType.replace("_ATK", "");
                if (
                    !Object.values(Aliment).includes(dotType as Aliment) ||
                    !this.activeBuffsAndDebuffs.includes(dotType)
                ) continue;

                if ("passiveSkillDetailMstId" in eff) {
                    if (passive_done) continue;
                    passive_done = true;
                } else {
                    if (active_done) continue;
                    active_done = true;
                }

                const allyTotalAtk = this.resolveAllyAtk(allyIdx, false, amountOfEnemies, enemy.maxBreak);
                const base = this.calc_base_dmg(eff.turn * eff.value1 / 1000, this.allyContexts[allyIdx].kioku.getBaseAtk());

                const def_total = enemy.defense * (1 + enemy.defenseUp / 100) * def_remaining;
                const ally_def_factor = Math.min(2, ((allyTotalAtk + 10) / (def_total + 10)) * 0.12);

                const dmg_dealt =
                    (this.getAllyEffect(allyIdx, "UP_GIV_DMG_RATIO", amountOfEnemies, enemy.maxBreak) +
                        this.getAllyEffect(allyIdx, "UP_GIV_DMG_ACCUM_RATIO", amountOfEnemies, enemy.maxBreak) +
                        this.getAllyEffect(allyIdx, "UP_GIV_SLIP_DMG_RATIO", amountOfEnemies, enemy.maxBreak) +
                        this.getAllyEffect(allyIdx, "UP_ELEMENT_DMG_RATE_RATIO", amountOfEnemies, enemy.maxBreak)) /
                    1000;

                const dmg_taken =
                    (this.getDebuffEffect("UP_RCV_DMG_RATIO", amountOfEnemies, enemy.maxBreak) +
                        this.getDebuffEffect("UP_AIM_RCV_DMG_RATIO", amountOfEnemies, enemy.maxBreak)) /
                    1000;

                const elem_dmg_up =
                    this.getAllyEffect(allyIdx, "UP_WEAK_ELEMENT_DMG_RATIO", amountOfEnemies, enemy.maxBreak) / 1000;
                const effect_elem_factor = 1 + (enemy.isWeak ? 0.2 + elem_dmg_up : 0);

                total +=
                    base *
                    ally_def_factor *
                    (1 + dmg_dealt) *
                    (1 + dmg_taken) *
                    (1 + elem_res_down) *
                    effect_elem_factor *
                    break_factor;
            }
        }

        return total;
    }

    get_special_dmg(
        targetType: EnemyTargetTypes,
        initAmountOfEnemies: number,
        currentAmountOfEnemies: number,
        maxBreak: number,
        nrHitThatKills: number,
    ): [number, boolean, boolean] {
        let total_dmg = 0;
        let uses_def = false;

        for (const detail of this.dps.effects) {
            if (
                detail.startConditionSetIdCsv
                    .split(",")
                    .some(id => !isStartCondRelevantForScoreAttack(id, this.dps.maxMagicStacks, initAmountOfEnemies))
            ) continue;
            if (((detail as ActiveSkill).skillMstId / 100 | 0) !== this.dps.data.special_id) continue;

            let delta_dmg = 0;
            if (!detail.abilityEffectType.startsWith("DMG_")) continue;
            if (detail.abilityEffectType.includes("DEF")) uses_def = true;

            detail.activeConditionSetIdCsv.split(",").forEach(activeCondId => {
                const isActiveCond = isActiveConditionRelevantForScoreAttack(
                    activeCondId,
                    this.attackerHealth,
                    this.activeBuffsAndDebuffs,
                );

                if (typeof isActiveCond === "boolean") {
                    if (!isActiveCond) return;
                } else {
                    if (!isActiveCond(nrHitThatKills > 1 ? currentAmountOfEnemies : currentAmountOfEnemies - 1, maxBreak)) return;
                }

                if (detail.abilityEffectType === "DMG_RANDOM" && targetType === EnemyTargetTypes.TARGET) {
                    delta_dmg = detail.value1 * detail.value2;
                } else if (detail.range === 3) {
                    delta_dmg = detail.value1;
                } else if (
                    detail.range === 2 &&
                    (targetType === EnemyTargetTypes.L_PROXIMITY || targetType === EnemyTargetTypes.R_PROXIMITY)
                ) {
                    delta_dmg = detail.value2;
                } else if (targetType === EnemyTargetTypes.TARGET) {
                    delta_dmg = detail.value1;
                }

                nrHitThatKills--;
            });

            total_dmg += delta_dmg;
        }

        return [total_dmg / 1000, nrHitThatKills < 1, uses_def];
    }

    memberForLog = (idx: number): ScoreAttackKioku => {
        if (idx === EnemyTargetTypes.TARGET) return this.dps;
        if (idx < EnemyTargetTypes.TARGET) return this.team[idx];
        return this.team[idx - 1];
    };

    calculate_max_dmg(enemies: Enemy[], atk_down = 0): [number, number, number, DebugSections[]] {
        let dmg: number, avg_dmg: number, enemyDied: boolean;
        let total_dmg = 0;
        let average_dmg = 0;
        let critRate = 0;
        let debugSections: DebugSections = emptyDebugSections();
        let initAmountOfEnemies = enemies.filter(e => e.enabled).length;
        let currentAmountOfEnemies = initAmountOfEnemies;
        const allDebugSections: DebugSections[] = Array(5).fill(null).map(emptyDebugSections);

        for (const i of [
            EnemyTargetTypes.TARGET,
            EnemyTargetTypes.L_PROXIMITY,
            EnemyTargetTypes.R_PROXIMITY,
            EnemyTargetTypes.L_OTHER,
            EnemyTargetTypes.R_OTHER,
        ]) {
            [dmg, avg_dmg, critRate, debugSections, enemyDied] = this.calculate_single_dmg(
                i, this.memberForLog(i), enemies[i],
                initAmountOfEnemies, currentAmountOfEnemies, atk_down,
            );
            total_dmg += dmg;
            average_dmg += avg_dmg;
            if (enemies[i].enabled && enemyDied) currentAmountOfEnemies -= 1;
            allDebugSections[i] = debugSections;
        }

        return [total_dmg, average_dmg, Math.round(critRate * 100), allDebugSections];
    }

    private formatContributions(contribs: DebugContributions, saySource: boolean): string {
        const bySource: Record<string, [string, SkillDetail, number][]> = {};

        for (const [effectType, entries] of Object.entries(contribs)) {
            for (const [detail, value, sourceName] of entries) {
                if (!bySource[sourceName]) bySource[sourceName] = [];
                bySource[sourceName].push([effectType, detail, value]);
            }
        }

        if (Object.keys(bySource).length === 0) return "(none)";

        return Object.entries(bySource)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([sourceName, entries]) => {
                const lines = entries
                    .sort(([, , a], [, , b]) => a - b)
                    .map(([effectType, d, n]) => {
                        let st = "";
                        if (d.activeConditionSetIdCsv.length) st += "A" + d.activeConditionSetIdCsv;
                        if (d.startConditionSetIdCsv.length) {
                            if (st.length) st += " & ";
                            st += "S" + d.startConditionSetIdCsv;
                        }
                        let outString = ` ${effectType}: ${prettyNumber(n / 10)} (${skillDetailId(d)})`.match(/.{1,30}/g)?.join("\n     ");
                        if (st.length) outString += " => " + st;
                        const desc = d.description.match(/.{1,20}/g)?.join("\n     ");
                        if (desc) outString += `\n  ${desc}`;
                        return outString;
                    })
                    .join("\n");
                if (saySource) return `From ${sourceName}:\n${lines}`;
                return lines;
            })
            .join("\n\n");
    }

    calculate_single_dmg(
        idx: number,
        kiokuAtPosition: ScoreAttackKioku,
        enemy: Enemy,
        initAmountOfEnemies: number,
        currentAmountOfEnemies: number,
        atk_down: number,
    ): [number, number, number, DebugSections, boolean] {
        const [special, enemyDied, uses_def] = this.get_special_dmg(
            targetTypeAtPosition[idx],
            initAmountOfEnemies, currentAmountOfEnemies,
            enemy.maxBreak, enemy.hitsToKill,
        );

        const base_atk = uses_def ? this.dps.getBaseDef() : this.dps.getBaseAtk();
        const atk_total = this.resolveAllyAtk(DPS_IDX, uses_def, currentAmountOfEnemies, enemy.maxBreak, atk_down);
        const flat_atk = this.getAllyEffect(DPS_IDX, `UP_${uses_def ? "DEF" : "ATK"}_FIXED`, currentAmountOfEnemies, enemy.maxBreak);
        const atk_pluss =
            (this.getAllyEffect(DPS_IDX, `UP_${uses_def ? "DEF" : "ATK"}_RATIO`, currentAmountOfEnemies, enemy.maxBreak) +
                this.getAllyEffect(DPS_IDX, `UP_${uses_def ? "DEF" : "ATK"}_CONSUME_RATIO`, currentAmountOfEnemies, enemy.maxBreak) +
                this.getAllyEffect(DPS_IDX, `UP_${uses_def ? "DEF" : "ATK"}_ACCUM_RATIO`, currentAmountOfEnemies, enemy.maxBreak)) /
            1000;

        let def_remaining =
            this.getDebuffEffect("DWN_DEF_ACCUM_RATIO", currentAmountOfEnemies, enemy.maxBreak) *
            this.getDebuffEffect("DWN_DEF_RATIO", currentAmountOfEnemies, enemy.maxBreak) *
            (0.9 ** this.debuffPool["WEAKNESS"]);

        const def_total = enemy.defense * (1 + enemy.defenseUp / 100) * def_remaining;

        const uncapped_crit_rate =
            (this.dps.baseCritRate +
                this.getAllyEffect(DPS_IDX, "UP_CTR_ACCUM_RATIO", currentAmountOfEnemies, enemy.maxBreak) +
                this.getAllyEffect(DPS_IDX, "UP_CTR_FIXED", currentAmountOfEnemies, enemy.maxBreak) +
                this.getAllyEffect(DPS_IDX, "UP_RCV_CTR_RATIO", currentAmountOfEnemies, enemy.maxBreak) +
                this.getAllyEffect(DPS_IDX, "UP_CTR_RATIO", currentAmountOfEnemies, enemy.maxBreak)) /
            1000;
        const crit_rate = Math.min(1, uncapped_crit_rate);
        const crit_dmg =
            (this.dps.baseCritDamage +
                this.getAllyEffect(DPS_IDX, "UP_CTD_FIXED", currentAmountOfEnemies, enemy.maxBreak) +
                this.getAllyEffect(DPS_IDX, "UP_CTD_RATIO", currentAmountOfEnemies, enemy.maxBreak) +
                this.getAllyEffect(DPS_IDX, "UP_CTD_ACCUM_RATIO", currentAmountOfEnemies, enemy.maxBreak)) /
            1000;

        const dmg_pluss =
            (this.getAllyEffect(DPS_IDX, "UP_GIV_DMG_RATIO", currentAmountOfEnemies, enemy.maxBreak) +
                this.getAllyEffect(DPS_IDX, "UP_GIV_DMG_ACCUM_RATIO", currentAmountOfEnemies, enemy.maxBreak) +
                this.getAllyEffect(DPS_IDX, "UP_ELEMENT_DMG_RATE_RATIO", currentAmountOfEnemies, enemy.maxBreak)) /
            1000;
        const elem_dmg_up =
            this.getAllyEffect(DPS_IDX, "UP_WEAK_ELEMENT_DMG_RATIO", currentAmountOfEnemies, enemy.maxBreak) / 1000;
        const dmg_taken =
            (this.getDebuffEffect("UP_RCV_DMG_RATIO", currentAmountOfEnemies, enemy.maxBreak) +
                this.getDebuffEffect("UP_AIM_RCV_DMG_RATIO", currentAmountOfEnemies, enemy.maxBreak)) /
            1000;
        const elem_res_down =
            this.getDebuffEffect("DWN_ELEMENT_RESIST_ACCUM_RATIO", currentAmountOfEnemies, enemy.maxBreak) / 1000;

        const def_factor = Math.min(2, ((atk_total + 10) / (def_total + 10)) * 0.12);
        const crit_factor = 1 + (enemy.isCrit ? crit_dmg : 0);
        const crit_average = 1 + crit_rate * crit_dmg;
        const dmg_dealt_factor = 1 + dmg_pluss;
        const dmg_taken_factor = 1 + dmg_taken;
        const elem_resist_factor = 1 + elem_res_down;
        const effect_elem_factor = 1 + (enemy.isWeak ? 0.2 + elem_dmg_up : 0);
        const break_factor = enemy.isBreak ? enemy.maxBreak / 100 : 1;

        let base_dmg = this.calc_base_dmg(special, base_atk);
        let dot_total_dmg = 0;
        if (special > 0 && enemy.enabled) {
            base_dmg += this.add_additional_dmg();
            if (this.hasDpsDotPop) {
                dot_total_dmg = this.add_dot_dmg(enemy, currentAmountOfEnemies);
            }
        }

        const total_dmg_pre_crit =
            Number(enemy.enabled) *
            base_dmg *
            def_factor *
            dmg_dealt_factor *
            dmg_taken_factor *
            elem_resist_factor *
            effect_elem_factor *
            break_factor;

        const pre_dot_total = total_dmg_pre_crit * crit_factor;
        const pre_dot_average = total_dmg_pre_crit * crit_average;
        const total = pre_dot_total + dot_total_dmg;
        const average_total = pre_dot_average + dot_total_dmg;

        let sections: DebugSections = emptyDebugSections();

        if (this.debug) {
            const posCtx = this.allyContexts[idx];

            sections.calc = `Ability Mult    - ${special * 100 | 0}%
Base ${uses_def ? "Def" : "Atk"}        - ${(base_atk | 0).toLocaleString()}
${uses_def ? "Def" : "Atk"} Up %        - ${atk_pluss * 100 | 0}%
${uses_def ? "Def" : "Atk"} Up flat     - ${flat_atk | 0}
Total ${uses_def ? "Def" : "Atk"}       - ${(atk_total | 0).toLocaleString()}
Def down%       - ${(1 - def_remaining) * 100 | 0}%
Total def       - ${(def_total | 0).toLocaleString()}
Crit rate       - ${uncapped_crit_rate * 100 | 0}%
Crit dmg        - ${crit_dmg * 100 | 0}%
Dmg Dealt       - ${dmg_pluss * 100 | 0}%
Elem dmg up     - ${elem_dmg_up * 100 | 0}%
Dmg Taken       - ${dmg_taken * 100 | 0}%
Elem Res        - ${elem_res_down * 100 | 0}%
atk down        - ${atk_down * 100 | 0}%
   
Ability dmg     - ${(base_dmg | 0).toLocaleString()}
Def Factor      - ${def_factor * 100 | 0}%
Crit Factor     - ${crit_factor * 100 | 0}%
Dmg Dlt Fact    - ${dmg_dealt_factor * 100 | 0}%
Dmg Tkn Fact    - ${dmg_taken_factor * 100 | 0}%
Elem ResFact    - ${elem_resist_factor * 100 | 0}%
EffElem Fact    - ${effect_elem_factor * 100 | 0}%
Break Factor    - ${break_factor * 100 | 0}%
Dot             - ${(dot_total_dmg | 0).toLocaleString()}
Pre-dot-total   - ${(pre_dot_total | 0).toLocaleString()}
Pre-dot-avrg    - ${(pre_dot_average | 0).toLocaleString()}
Result          - ${(total | 0).toLocaleString()}
AverageDmg      - ${(average_total | 0).toLocaleString()}`;

            sections.enemy = `enemiesAlive    - ${currentAmountOfEnemies}
base_def        - ${enemy.defense.toLocaleString()}
break           - ${enemy.maxBreak}%
def_up          - ${enemy.defenseUp}%
is_break        - ${enemy.isBreak}
is_elemt_weak   - ${enemy.isWeak}
does_crit       - ${enemy.isCrit}
enabled         - ${enemy.enabled}
enemy died      - ${enemyDied}`;

            const statLines = kiokuAtPosition
                ? Object.keys(kiokuAtPosition)
                    .sort()
                    .sort((a, b) => {
                        if (a.endsWith("Atk")) return -1;
                        if (b.endsWith("Atk")) return 1;
                        if (a === "portrait") return -1;
                        if (b === "portrait") return 1;
                        if (a === "support") return -1;
                        if (b === "support") return 1;
                        if (a.endsWith("Lvl")) return -1;
                        if (b.endsWith("Lvl")) return 1;
                        return 0;
                    })
                    .map(key => {
                        let val = (kiokuAtPosition as any)[key];
                        if (key.startsWith("base") || key.endsWith("Def") || key.endsWith("Hp")) return;
                        if (key === "shouldUseSupportAndPortraitReason") return;
                        if (["effects", "ascension", "crys", "data", "inputCrys", "inputCrysSub", "name", "scalableEffects", "unscalableEffects"].includes(key)) return;
                        if (key === "portrait") { val = val?.["stats"]?.["atk"]; key = "PortraitAtk"; }
                        if (key === "support") { val = val?.getBaseAtk() * 0.16; key = "SupportAtk"; }
                        if (key === "supportLvl") { val = (kiokuAtPosition as any)["support"]?.supportLvl ?? "N/A"; }
                        if (key.endsWith("Atk")) val |= 0;
                        val = prettyNumber(val).toString();
                        if (key === "SupportAtk" || key === "supportLvl") val = val + "\n";
                        return `${key.padEnd(15)} - ${val}`;
                    })
                    .filter(Boolean)
                : [];
            sections.kiokuStats = statLines.join("\n");

            sections.kiokuReceived = this.formatContributions(posCtx.debugContributionsToSelf, true);
            sections.kiokuContributed = this.formatContributions(posCtx.debugContributionsToDps, false);
            sections.kiokuDebuffs = this.formatContributions(posCtx.debugDebuffContributions, false);

            sections.rawReceived = posCtx.debugContributionsToSelf;
            sections.rawContributed = posCtx.debugContributionsToDps;
            sections.rawDebuffs = posCtx.debugDebuffContributions;
        }

        return [total | 0, average_total | 0, crit_rate, sections, enemyDied];
    }
}
