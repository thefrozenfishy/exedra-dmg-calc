// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { IComparer } from "./IComparer";
import { AbilityEffectListComparer } from "./AbilityEffectListComparer";
import { IntListComparer } from "./IntListComparer";
import { BoolValueComparer } from "./BoolValueComparer";
import { FloatValueComparer } from "./FloatValueComparer";
import { IntValueComparer } from "./IntValueComparer";
import { TargetRoleType } from "../../Network/Definition/Battle/TargetRoleType";
import { TargetElementType } from "../../Network/Definition/Battle/TargetElementType";
import { UniqueLvUnitStateBase } from "../UnitState/UniqueLvUnitStateBase";
import { UniqueAccumUnitStateBase } from "../UnitState/UniqueAccumUnitStateBase";
import { UniqueUnitStateBase } from "../UnitState/UniqueUnitStateBase";
import { AbnormalUnitStateBase } from "../UnitState/AbnormalUnitStateBase";
import { CharacterParameter } from "../CharacterParameter";
import { enumParse, f32, intParse, isNullOrEmpty, notPorted } from "../../runtime";
import type { List } from "../../runtime";
import type { AffectedUnitNotice } from "../AffectedUnitNotice";
import type { BattleConditionUtils_Condition } from "./BattleConditionUtils";
import { ConditionCheckerBase } from "./ConditionCheckerBase";
import type { BattleUnit } from "../BattleUnit";
import type { Nullable } from "../../runtime";
import type { float } from "../../runtime";
import type { int } from "../../runtime";
import { boolParse } from "../../runtime";

// ---- ReDriveBattleCore.BattleCondition.BattleUnitConditionChecker  (TypeDefIndex 1046, public class) ----
export class BattleUnitConditionChecker extends ConditionCheckerBase {
    /** 0x18 private BattleUnit battleUnit */
    battleUnit: BattleUnit = null!;
    /** 0x20 private BattleUnit selfUnit */
    selfUnit: BattleUnit = null!;
    /** 0x28 private BattleUnit actorUnit */
    actorUnit: BattleUnit = null!;
    /** 0x30 private BattleUnit mainTargetUnit */
    mainTargetUnit: BattleUnit = null!;
    /** 0x38 private List<BattleUnit> friendUnits */
    friendUnits: List<BattleUnit> = null!;
    /** 0x40 private List<BattleUnit> opponentUnits */
    opponentUnits: List<BattleUnit> = null!;
    /** 0x48 private AffectedUnitNotice notice */
    notice: AffectedUnitNotice = null!;
    /** @rva 0x17E5D80  public void .ctor(BattleConditionUtils.Condition condition, BattleUnit battleUnit, BattleUnit selfUnit, BattleUnit actorUnit, BattleUnit mainTargetUnit, List<BattleUnit> friendUnits, List<BattleUnit> opponentUnits, AffectedUnitNotice notice) { } */
    ctor$Condition_BattleUnit_BattleUnit_BattleUnit_BattleUnit_ListBattleUnit_ListBattleUnit_AffectedUnitNotice(condition: BattleConditionUtils_Condition, battleUnit: BattleUnit, selfUnit: BattleUnit, actorUnit: BattleUnit, mainTargetUnit: BattleUnit, friendUnits: List<BattleUnit>, opponentUnits: List<BattleUnit>, notice: AffectedUnitNotice): this {
        super.ctor$Condition(condition); // inlined in the game
        this.battleUnit = battleUnit;
        this.selfUnit = selfUnit;
        this.actorUnit = actorUnit;
        this.mainTargetUnit = mainTargetUnit;
        this.friendUnits = friendUnits;
        this.opponentUnits = opponentUnits;
        this.notice = notice;
        return this;
    }
    /** @rva 0x17E3F10 slot 4  public override bool Check() { } */
    Check(): boolean {
        if (this.battleUnit == null) return false;
        const cond = this.condition;
        const unit = this.battleUnit;
        const splitCompareValue = (): string[] => cond._CompareValue.split(ConditionCheckerBase.CompareValueDelimiter); // String.Split(...).ToArray()
        const at = (a: string[], i: int): string => { if (i >= a.length) throw new RangeError("IndexOutOfRangeException"); return a[i]; };
        let comparer: IComparer;
        switch (cond._CompareContent) {
            case 1: comparer = new IntValueComparer().ctor$int_int(unit._HP, cond.get_CompareValueInt() /* inlined */); break;
            case 2: comparer = new FloatValueComparer().ctor$float_float(unit.CalculationHpRate(), cond.get_CompareValueFloat() /* inlined */); break;
            case 3: comparer = new FloatValueComparer().ctor$float_float(f32(unit.get_ATK()), cond.get_CompareValueFloat() /* inlined */); break;
            case 4: comparer = new FloatValueComparer().ctor$float_float(f32(unit.get_DEF()), cond.get_CompareValueFloat() /* inlined */); break;
            case 5: comparer = new FloatValueComparer().ctor$float_float(f32(unit.get_Speed()), cond.get_CompareValueFloat() /* inlined */); break;
            case 6: comparer = new IntValueComparer().ctor$int_int(unit._EP, cond.get_CompareValueInt() /* inlined */); break;
            case 7: comparer = new IntValueComparer().ctor$int_int(unit._TurnNum, cond.get_CompareValueInt() /* inlined */); break;
            case 8: {
                const actorId: Nullable<int> = this.actorUnit != null ? this.actorUnit._Id : null;
                const id = unit._Id;
                const right = cond.get_CompareValueBool(); // inlined
                comparer = new BoolValueComparer().ctor$bool_bool(actorId != null && actorId === id, right);
                break;
            }
            case 9: {
                const id = unit._Id;
                const mainTargetId: Nullable<int> = this.mainTargetUnit != null ? this.mainTargetUnit._Id : null;
                const right = cond.get_CompareValueBool(); // inlined
                comparer = new BoolValueComparer().ctor$bool_bool(mainTargetId != null && id === mainTargetId, right);
                break;
            }
            case 10: comparer = new BoolValueComparer().ctor$bool_bool(this.friendUnits.includes(unit), cond.get_CompareValueBool() /* inlined */); break;
            case 11: comparer = new BoolValueComparer().ctor$bool_bool(this.opponentUnits.includes(unit), cond.get_CompareValueBool() /* inlined */); break;
            case 12: {
                const effectTypes = unit._Condition._StateList.map(x => x._EffectType); // <>c.b__8_0
                comparer = new AbilityEffectListComparer().ctor$ICollectionstring_string(effectTypes, cond._CompareValue);
                break;
            }
            case 13: {
                const values = splitCompareValue();
                const n = intParse(at(values, 0).trim());
                const interval = 0 < n ? n : 1;
                let startTurn = 1;
                if (2 <= values.length && !isNullOrEmpty(at(values, 1))) {
                    const s = intParse(at(values, 1).trim());
                    startTurn = 0 < s ? s : 1;
                }
                if (!(startTurn <= unit._TurnNum)) return false;
                comparer = new BoolValueComparer().ctor$bool_bool((unit._TurnNum - startTurn) % interval === 0, true);
                break;
            }
            case 14: comparer = new IntValueComparer().ctor$int_int(unit.isCharacter ? unit._MstId : 0, cond.get_CompareValueInt() /* inlined */); break;
            case 15: comparer = new IntValueComparer().ctor$int_int(unit._CurrentHpGaugeCount, cond.get_CompareValueInt() /* inlined */); break;
            case 16: comparer = new BoolValueComparer().ctor$bool_bool(unit._BreakPoint.get_IsBreak(), cond.get_CompareValueBool() /* inlined */); break;
            case 17: comparer = new IntValueComparer().ctor$int_int(unit._Condition._ChargePoint, cond.get_CompareValueInt() /* inlined */); break;
            case 18: comparer = new BoolValueComparer().ctor$bool_bool(unit._Condition._CanNotAction, cond.get_CompareValueBool() /* inlined */); break;
            case 19: comparer = new BoolValueComparer().ctor$bool_bool(unit.IsMatch$TargetElementType(enumParse(TargetElementType, cond._CompareValue) as TargetElementType), true); break;
            case 20: comparer = new BoolValueComparer().ctor$bool_bool(unit.IsMatch$TargetRoleType(enumParse(TargetRoleType, cond._CompareValue) as TargetRoleType), true); break;
            case 21: {
                const upValue = this.notice != null ? this.notice._BreakedDamageReceiveRateUpValue : 0;
                const left = f32(unit._BreakedDamageReceiveRate - upValue);
                comparer = new FloatValueComparer().ctor$float_float(left, cond.get_CompareValueFloat() /* inlined */);
                break;
            }
            case 22: {
                const rate = unit._BreakedDamageReceiveRate;
                const maxRate = unit._BattleParameter._MaxBreakedDamageReceiveRate; // get_BattleParameter
                const right = cond.get_CompareValueBool(); // inlined
                comparer = new BoolValueComparer().ctor$bool_bool(f32(f32(maxRate) / 10) <= f32(rate), right);
                break;
            }
            case 23: comparer = new IntValueComparer().ctor$int_int(unit._Condition._StateList.filter(x => x instanceof AbnormalUnitStateBase).length /* <>c.b__8_1 */, cond.get_CompareValueInt() /* inlined */); break;
            case 24: comparer = new IntValueComparer().ctor$int_int(unit._Condition._StateList.filter(s => s.get_Direction() === 0 && s._EffectOrigin === 1).length /* <>c.b__8_2 */, cond.get_CompareValueInt() /* inlined */); break;
            case 25: comparer = new IntValueComparer().ctor$int_int(unit._Condition._StateList.filter(s =>
                s.get_Direction() === 1 && !(s instanceof AbnormalUnitStateBase) && (s._EffectOrigin === 1 || s.IsConditionActivation)).length /* <>c.b__8_3 */, cond.get_CompareValueInt() /* inlined */); break;
            case 26: {
                const ids = unit._Condition._StateList.filter((s): s is UniqueUnitStateBase => s instanceof UniqueUnitStateBase).map(x => x._UniqueStatePatternMstId); // <>c.b__8_4
                comparer = new IntListComparer().ctor$ICollectionint_int(ids, cond.get_CompareValueInt() /* inlined */);
                break;
            }
            case 27: {
                // <>c__DisplayClass8_0: 0x10 uniqueStatePatternMstId
                const values = splitCompareValue();
                const patternId = intParse(at(values, 0).trim());
                const accumCount = intParse(at(values, 1).trim());
                const sum = unit._Condition._StateList.filter((s): s is UniqueAccumUnitStateBase => s instanceof UniqueAccumUnitStateBase)
                    .filter(s => s._UniqueStatePatternMstId === patternId) // b__5
                    .reduce((a, s) => a + s._AccumCount, 0); // <>c.b__8_6
                comparer = new IntValueComparer().ctor$int_int(sum, accumCount);
                break;
            }
            case 28: {
                const parameter = unit.isCharacter ? unit._BattleParameter : null; // get_BattleParameter
                if (!(parameter instanceof CharacterParameter)) return false;
                const styleIds = splitCompareValue().filter(x => !isNullOrEmpty(x)) /* <>c.b__8_8 */.map(x => intParse(x.trim())); // <>c.b__8_9
                comparer = new IntListComparer().ctor$ICollectionint_int(styleIds, parameter._StyleMstId);
                break;
            }
            case 29: {
                const values = splitCompareValue();
                const patternId = intParse(at(values, 0).trim());
                const right = boolParse(at(values, 1).trim());
                if (patternId === 0) comparer = new BoolValueComparer().ctor$bool_bool(unit.GetUniqueZoneUnitStatePatternId() !== 0, right);
                else comparer = new BoolValueComparer().ctor$bool_bool(unit.GetUniqueZoneUnitStatePatternId() === patternId, right);
                break;
            }
            case 30: comparer = new IntValueComparer().ctor$int_int(unit._BreakPoint._BreakCount, cond.get_CompareValueInt() /* inlined */); break;
            case 31: {
                // <>c__DisplayClass8_1: 0x10 uniqueStatePatternMstId
                const values = splitCompareValue();
                const patternId = intParse(at(values, 0).trim());
                const lv = intParse(at(values, 1).trim());
                const state = unit._Condition._StateList.filter((s): s is UniqueLvUnitStateBase => s instanceof UniqueLvUnitStateBase)
                    .find(s => s._UniqueStatePatternMstId === patternId) ?? null; // b__7
                if (state == null) return false;
                comparer = new IntValueComparer().ctor$int_int(state._Lv, lv);
                break;
            }
            case 101: {
                let damage = 0;
                if (this.notice != null) damage = this.notice.GetTotalDamageValue(true);
                if (this.notice != null && this.notice._IsReceivedReflection) damage = 0;
                comparer = new IntValueComparer().ctor$int_int(damage, cond.get_CompareValueInt() /* inlined */);
                break;
            }
            case 102: {
                let ratio: float = 0;
                if (this.notice != null) ratio = f32(f32(f32(this.notice.GetTotalDamageValue(true)) * 100) / f32(unit._MaxHP));
                if (this.notice != null && this.notice._IsReceivedReflection) ratio = 0;
                comparer = new FloatValueComparer().ctor$float_float(ratio, cond.get_CompareValueFloat() /* inlined */);
                break;
            }
            case 103: {
                const v = this.notice != null && 1 <= this.notice.GetTotalDamageValue(true) ? this.notice._IsDead : false;
                comparer = new BoolValueComparer().ctor$bool_bool(v, cond.get_CompareValueBool() /* inlined */);
                break;
            }
            case 104: comparer = new BoolValueComparer().ctor$bool_bool(this.notice != null ? this.notice._IsReceivedRecovery : false, cond.get_CompareValueBool() /* inlined */); break;
            case 105: comparer = new BoolValueComparer().ctor$bool_bool(this.notice != null ? this.notice._IsBarrierAdded : false, cond.get_CompareValueBool() /* inlined */); break;
            case 106: comparer = new BoolValueComparer().ctor$bool_bool(this.notice != null ? this.notice._IsBarrierAttacked : false, cond.get_CompareValueBool() /* inlined */); break;
            case 107: comparer = new BoolValueComparer().ctor$bool_bool(this.notice != null ? this.notice._IsBarrierDestroyed : false, cond.get_CompareValueBool() /* inlined */); break;
            case 108: comparer = new BoolValueComparer().ctor$bool_bool(this.notice != null ? this.notice._IsBreakedDamageReceiveRateBecomeMax : false, cond.get_CompareValueBool() /* inlined */); break;
            case 109: comparer = new BoolValueComparer().ctor$bool_bool(this.notice != null ? this.notice._IsWeakElementAttacked : false, cond.get_CompareValueBool() /* inlined */); break;
            case 110: comparer = new BoolValueComparer().ctor$bool_bool(this.notice != null ? this.notice._IsReceivedAttack : false, cond.get_CompareValueBool() /* inlined */); break;
            case 111: {
                const v = this.notice == null ? false : this.notice._ReceivedSlipDamageEffectTypeList.length > 0;
                comparer = new BoolValueComparer().ctor$bool_bool(v, cond.get_CompareValueBool() /* inlined */);
                break;
            }
            case 112: {
                const list = this.notice != null && this.notice._ReceivedSlipDamageEffectTypeList != null ? this.notice._ReceivedSlipDamageEffectTypeList : [];
                comparer = new AbilityEffectListComparer().ctor$ICollectionstring_string(list, cond._CompareValue);
                break;
            }
            case 113:
            case 114: {
                const values = splitCompareValue();
                const patternId = intParse(at(values, 0).trim());
                const right = boolParse(at(values, 1).trim());
                const zoneId = cond._CompareContent === 113 ? unit._Condition._ExpandZoneUnitStatePatternMstId : unit._Condition._ReleaseZoneUnitStatePatternMstId;
                if (patternId === 0) comparer = new BoolValueComparer().ctor$bool_bool(zoneId !== 0, right);
                else comparer = new BoolValueComparer().ctor$bool_bool(zoneId === patternId, right);
                break;
            }
            case 115: comparer = new IntValueComparer().ctor$int_int(this.notice == null ? 0 : this.notice._AddStateInfoList.filter(info => info.isRemovableBuff).length /* <>c.b__8_10 */, cond.get_CompareValueInt() /* inlined */); break;
            case 116: comparer = new IntValueComparer().ctor$int_int(this.notice == null ? 0 : this.notice._AddStateInfoList.filter(info => info.isRemovableDebuff).length /* <>c.b__8_11 */, cond.get_CompareValueInt() /* inlined */); break;
            case 1001: comparer = new BoolValueComparer().ctor$bool_bool(this.selfUnit._Team === 0, cond.get_CompareValueBool()); break;
            default: return false;
        }
        return comparer.Compare(cond._CompareOperator);
    }
}

