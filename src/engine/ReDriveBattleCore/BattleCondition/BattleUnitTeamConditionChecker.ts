// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { UnitStateBase } from "../UnitState/UnitStateBase";
import type { CompareOperator } from "./CompareOperator";
import type { IComparer } from "./IComparer";
import { AbilityEffectListComparer } from "./AbilityEffectListComparer";
import { BoolValueComparer } from "./BoolValueComparer";
import { IntValueComparer } from "./IntValueComparer";
import { UniqueAccumUnitStateBase } from "../UnitState/UniqueAccumUnitStateBase";
import { UniqueUnitStateBase } from "../UnitState/UniqueUnitStateBase";
import { AbnormalUnitStateBase } from "../UnitState/AbnormalUnitStateBase";
import { intParse, notPorted } from "../../runtime";
import type { HashSet, List, int } from "../../runtime";
import type { AffectedUnitNotice } from "../AffectedUnitNotice";
import type { BattleConditionUtils_Condition } from "./BattleConditionUtils";
import { ConditionCheckerBase } from "./ConditionCheckerBase";
import type { BattleUnit } from "../BattleUnit";
import { startsWith } from "../../runtime";
import { boolParse } from "../../runtime";

// ---- ReDriveBattleCore.BattleCondition.BattleUnitTeamConditionChecker  (TypeDefIndex 1062, public class) ----
export class BattleUnitTeamConditionChecker extends ConditionCheckerBase {
    /** 0x18 private List<BattleUnit> battleUnits */
    battleUnits: List<BattleUnit> = null!;
    /** 0x20 private int SP */
    SP: int = 0;
    /** 0x24 private int breakedUnitTotalCount */
    breakedUnitTotalCount: int = 0;
    /** 0x28 private List<AffectedUnitNotice> affectedUnitNotices */
    affectedUnitNotices: List<AffectedUnitNotice> = null!;
    /** 0x30 private HashSet<string> appliedSkillEffectTypes */
    appliedSkillEffectTypes: HashSet<string> = null!;
    /** @rva 0x180F140  public void .ctor(BattleConditionUtils.Condition condition, List<BattleUnit> battleUnits, List<AffectedUnitNotice> affectedUnitNotices, int SP, int breakedUnitTotalCount, HashSet<string> appliedSkillEffectTypes) { } */
    ctor$Condition_ListBattleUnit_ListAffectedUnitNotice_int_int_HashSetstring(condition: BattleConditionUtils_Condition, battleUnits: List<BattleUnit>, affectedUnitNotices: List<AffectedUnitNotice>, SP: int, breakedUnitTotalCount: int, appliedSkillEffectTypes: HashSet<string>): this {
        super.ctor$Condition(condition); // inlined in the game
        this.battleUnits = battleUnits;
        this.affectedUnitNotices = affectedUnitNotices;
        this.SP = SP;
        this.breakedUnitTotalCount = breakedUnitTotalCount;
        this.appliedSkillEffectTypes = appliedSkillEffectTypes;
        return this;
    }
    /** @rva 0x180CEF0 slot 4  public override bool Check() { } */
    Check(): boolean {
        const cond = this.condition;
        let compareOperator: CompareOperator = cond._CompareOperator;
        // <>c__DisplayClass6_0: 0x10 abilityEffectTypePrefix, 0x18 greaterThanRate, 0x1C lessThanRate, 0x20 abilityEffectAndDamagePrefix, 0x28 abilityEffectAndDamageValue, 0x30 this
        const c0 = { prefix: null! as string, greaterThanRate: 0 as int, lessThanRate: 0 as int, damagePrefix: null! as string, damageValue: 0 as int };
        const values = (): string[] => cond._CompareValue.split(ConditionCheckerBase.CompareValueDelimiter);
        const at = (a: string[], i: int): string => { if (i >= a.length) throw new RangeError("IndexOutOfRangeException"); return a[i]; };
        const noticeOf = (unit: BattleUnit): AffectedUnitNotice | null => this.affectedUnitNotices.find(n => n._AffectedUnitId === unit._Id) ?? null;
        let comparer: IComparer;
        switch (cond._CompareContent) {
            case 201: comparer = new IntValueComparer().ctor$int_int(this.SP, cond.get_CompareValueInt() /* inlined */); break;
            case 202: comparer = new IntValueComparer().ctor$int_int(this.battleUnits.filter(x => !x.get_IsDead()).length /* <>c.b__6_0 */, cond.get_CompareValueInt() /* inlined */); break;
            case 203: comparer = new IntValueComparer().ctor$int_int(this.battleUnits.filter(x => x.get_IsDead()).length /* <>c.b__6_1 (IsDead inlined) */, cond.get_CompareValueInt() /* inlined */); break;
            case 204: comparer = new AbilityEffectListComparer().ctor$ICollectionstring_string([...this.appliedSkillEffectTypes], cond._CompareValue); break;
            case 205: {
                const v = values();
                c0.prefix = at(v, 0).trim();
                const n = intParse(at(v, 1).trim());
                // b__9: List.Exists(b__18)
                const count = this.battleUnits.filter(x => x._Condition._StateList.some(y => y._EffectType != null && startsWith(y._EffectType, c0.prefix) /* b__18 */)).length;
                comparer = new IntValueComparer().ctor$int_int(count, n);
                break;
            }
            case 206: {
                const v = values();
                c0.greaterThanRate = intParse(at(v, 0).trim());
                const n = intParse(at(v, 1).trim());
                comparer = new IntValueComparer().ctor$int_int(this.battleUnits.filter(x => !x.get_IsDead() && c0.greaterThanRate <= x._BreakedDamageReceiveRate).length /* b__10 */, n);
                break;
            }
            case 207: {
                const v = values();
                c0.lessThanRate = intParse(at(v, 0).trim());
                const n = intParse(at(v, 1).trim());
                comparer = new IntValueComparer().ctor$int_int(this.battleUnits.filter(x => !x.get_IsDead() && x._BreakedDamageReceiveRate < c0.lessThanRate).length /* b__11 */, n);
                break;
            }
            case 208: {
                const sum = this.battleUnits.filter(u => !u.get_IsDead()) /* <>c.b__6_12 */
                    .reduce((a, u) => a + u._Condition._StateList.filter(state =>
                        (state._EffectOrigin === 1 || state.IsConditionActivation) && state.get_Direction() === 1 && !(state instanceof AbnormalUnitStateBase)).length /* <>c.b__6_26 */, 0); // <>c.b__6_13
                comparer = new IntValueComparer().ctor$int_int(sum, cond.get_CompareValueInt() /* inlined */);
                break;
            }
            case 209: comparer = new IntValueComparer().ctor$int_int(this.battleUnits.reduce((a, u) => a + u._Condition._CountPoint, 0) /* <>c.b__6_14 */, cond.get_CompareValueInt() /* inlined */); break;
            case 210: {
                // <>c__DisplayClass6_1: 0x10 uniqueStatePatternMstId
                const v = values();
                const patternId = intParse(at(v, 0).trim());
                const n = intParse(at(v, 1).trim());
                const count = this.battleUnits.filter(unit => unit._Condition._StateList.filter((s): s is UniqueUnitStateBase => s instanceof UniqueUnitStateBase)
                    .some(s => s._UniqueStatePatternMstId === patternId) /* b__20 */).length; // b__19
                comparer = new IntValueComparer().ctor$int_int(count, n);
                break;
            }
            case 211: {
                // <>c__DisplayClass6_2: 0x10 uniqueStatePatternMstId
                const v = values();
                const patternId = intParse(at(v, 0).trim());
                const n = intParse(at(v, 1).trim());
                const sum = this.battleUnits.flatMap(unit => unit._Condition._StateList) // <>c.b__6_21
                    .filter((s): s is UniqueAccumUnitStateBase => s instanceof UniqueAccumUnitStateBase)
                    .filter(s => s._UniqueStatePatternMstId === patternId) // b__22
                    .reduce((a, s) => a + s._AccumCount, 0); // <>c.b__6_23
                comparer = new IntValueComparer().ctor$int_int(sum, n);
                break;
            }
            case 212: comparer = new IntValueComparer().ctor$int_int(this.battleUnits.filter(x => !x.get_IsDead()) /* <>c.b__6_24 */.reduce((a, x) => a + x._BreakPoint._BreakCount, 0) /* <>c.b__6_25 */, cond.get_CompareValueInt() /* inlined */); break;
            case 301: comparer = new IntValueComparer().ctor$int_int(this.affectedUnitNotices.filter(x => 1 <= x.GetTotalDamageValue(true) && x._IsDead).length /* <>c.b__6_2 */, cond.get_CompareValueInt() /* inlined */); break;
            case 302: comparer = new IntValueComparer().ctor$int_int(this.affectedUnitNotices.filter(x => x._BreakDamage != null).length /* <>c.b__6_3 */, cond.get_CompareValueInt() /* inlined */); break;
            case 303: comparer = new IntValueComparer().ctor$int_int(this.affectedUnitNotices.filter(x =>
                x.Damages.some(dmg => dmg._IsCritical) /* <>c.b__6_16 */ || x.BarrierDamages.some(dmg => dmg._IsCritical) /* <>c.b__6_17 */).length /* <>c.b__6_4 */, cond.get_CompareValueInt() /* inlined */); break;
            case 304: comparer = new IntValueComparer().ctor$int_int(this.affectedUnitNotices.reduce((a, x) => {
                // <>c.b__6_8
                const damage = x.Damages.reduce((s, d) => s + d._DamageValue, 0); // AffectedUnitNotice.<>c.b__128_0
                return a + (x._BreakDamage == null ? damage : damage + x._BreakDamage._DamageValue);
            }, 0), cond.get_CompareValueInt() /* inlined */); break;
            case 305: {
                const v = values();
                c0.damagePrefix = at(v, 0); // not trimmed in the game
                c0.damageValue = intParse(at(v, 1).trim());
                // b__15
                const any = this.battleUnits.some(unit => {
                    // <>c__DisplayClass6_3: 0x10 unit
                    const states = unit._Condition._StateList.filter(unitState => unitState._EffectType != null && startsWith(unitState._EffectType, c0.damagePrefix)); // b__27
                    if (!(states.length > 0)) return false;
                    const notice = this.affectedUnitNotices.find(n => n._AffectedUnitId === unit._Id) ?? null; // b__28
                    if (notice == null) return false;
                    let found = false;
                    for (const state of states) {
                        // <>c__DisplayClass6_4: 0x10 state; b__29
                        if (!notice._AddStateInfoList.some(s => s.stateEffectType === state._EffectType && s.isNewUnitStateType)) { found = true; break; }
                    }
                    if (!found) return false;
                    return new IntValueComparer().ctor$int_int(notice.GetTotalDamageValue(true), c0.damageValue).Compare(this.condition._CompareOperator);
                });
                comparer = new BoolValueComparer().ctor$bool_bool(any, true);
                compareOperator = 1 as CompareOperator;
                break;
            }
            case 306: comparer = new IntValueComparer().ctor$int_int(this.breakedUnitTotalCount, cond.get_CompareValueInt() /* inlined */); break;
            case 307: comparer = new IntValueComparer().ctor$int_int(this.affectedUnitNotices.filter(x => x._IsWeakElementAttacked).length /* <>c.b__6_6 */, cond.get_CompareValueInt() /* inlined */); break;
            case 308: comparer = new IntValueComparer().ctor$int_int(this.affectedUnitNotices.filter(x => x._IsBreakedDamageReceiveRateBecomeMax).length /* <>c.b__6_7 */, cond.get_CompareValueInt() /* inlined */); break;
            case 309: {
                // <>c__DisplayClass6_5: 0x10 prefix, 0x18 CS$<>8__locals (DisplayClass6_0)
                const v = values();
                const prefix = at(v, 0).trim();
                const n = intParse(at(v, 1).trim());
                const count = this.battleUnits.filter(unit => {
                    // b__30; <>c__DisplayClass6_6: 0x10 unit, 0x18 notice
                    const notice = this.affectedUnitNotices.find(nn => nn._AffectedUnitId === unit._Id) ?? null; // b__31
                    if (notice == null || !notice._IsReceivedAttack) return false;
                    return unit._Condition._StateList.some(state => {
                        // b__32
                        if (state._EffectType == null) return false;
                        if (!startsWith(state._EffectType, prefix)) return false;
                        return !notice._AddStateInfoList.some(info => info.stateEffectType === state._EffectType && info.isNewUnitStateType); // b__33
                    });
                }).length;
                comparer = new IntValueComparer().ctor$int_int(count, n);
                break;
            }
            case 310: comparer = new IntValueComparer().ctor$int_int(this.battleUnits.filter(unit => this.$Check$b__6_34(unit)).length, cond.get_CompareValueInt() /* inlined */); break;
            case 311:
            case 312: {
                const v = values();
                const patternId = intParse(at(v, 0).trim());
                const right = boolParse(at(v, 1).trim());
                const zoneId = (u: BattleUnit): int => cond._CompareContent === 311 ? u._Condition._ExpandZoneUnitStatePatternMstId : u._Condition._ReleaseZoneUnitStatePatternMstId;
                const any = patternId === 0
                    ? this.battleUnits.some(u => zoneId(u) !== 0) // <>c.b__6_36 / b__6_38
                    : this.battleUnits.some(u => zoneId(u) === patternId); // b__37 / b__39
                comparer = new BoolValueComparer().ctor$bool_bool(any, right);
                break;
            }
            case 313: comparer = new IntValueComparer().ctor$int_int(this.affectedUnitNotices.filter(x => x._IsReceivedAttack).length /* <>c.b__6_5 */, cond.get_CompareValueInt() /* inlined */); break;
            case 314: comparer = new IntValueComparer().ctor$int_int(this.battleUnits.filter(unit => this.$Check$b__6_40(unit)).length, cond.get_CompareValueInt() /* inlined */); break;
            case 315:
            case 316: {
                let total = 0;
                for (const unit of this.battleUnits) {
                    // <>c__DisplayClass6_12 / 6_13: 0x10 unit; b__42 / b__44
                    if (this.affectedUnitNotices != null) {
                        const notice = noticeOf(unit);
                        if (notice != null) {
                            total += cond._CompareContent === 315
                                ? notice._AddStateInfoList.filter(info => info.isRemovableBuff).length // <>c.b__6_43
                                : notice._AddStateInfoList.filter(info => info.isRemovableDebuff).length; // <>c.b__6_45
                        }
                    }
                }
                comparer = new IntValueComparer().ctor$int_int(total, cond.get_CompareValueInt() /* inlined */);
                break;
            }
            default: return false;
        }
        return comparer.Compare(compareOperator);
    }
    /** @rva 0x180EF10  private bool <Check>b__6_34(BattleUnit unit) { } */
    $Check$b__6_34(unit: BattleUnit): boolean {
        // <>c__DisplayClass6_8: 0x10 unit; b__35
        const notice = this.affectedUnitNotices.find(n => n._AffectedUnitId === unit._Id) ?? null;
        if (notice == null) return false;
        return notice._ReceivedSlipDamageEffectTypeList.length > 0;
    }
    /** @rva 0x180F020  private bool <Check>b__6_40(BattleUnit unit) { } */
    $Check$b__6_40(unit: BattleUnit): boolean {
        // <>c__DisplayClass6_11: 0x10 unit; b__41
        if (this.affectedUnitNotices == null) return false;
        const notice = this.affectedUnitNotices.find(n => n._AffectedUnitId === unit._Id) ?? null;
        return notice != null && notice._IsReceivedAttack && notice._BreakDamage == null && 0 < unit._BreakedDamageReceiveRate;
    }
}

