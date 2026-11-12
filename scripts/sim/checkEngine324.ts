// Checks of the game 3.24.0 rules ported into the 1:1 engine (src/engine), run on the bundle:
//   NODE_OPTIONS=--max-old-space-size=3300 node scripts/engine/bundle.mjs && npx tsx scripts/sim/checkEngine324.ts
// Each check fails on the 3.22 port (the members / types did not exist or did something else).
// 3.24.0 added Element Drive (UNIQUE_ELEMENT_DRIVE), Drive break-gauge bonuses (DRIVE_UP_BREAK_POINT_DMG_*) and
// Over Break (OVER_BREAK_DAMAGE_RECEIVE_RATE_DRIVE).
import { AbilityEffectInfo, AffectedUnitNotice, BattleDamageCalculator, BattleUnit, BreakPoint, DriveUpBreakPointDmgRatioUnitState,
    DriveUpBreakPointDmgFixedUnitState, OverBreakDamageReceiveRateDriveUnitState, PassiveSkill, SpecialAttack, ActiveSkill,
    UniqueElementDriveUnitState, UnitStateFactory, ActiveSkillBaseUtility, Decimal } from "../../src/engine/dist/engine.js";

let failed = 0;
const check = (name: string, ok: boolean, info: string) => { if (!ok) failed++; console.log(`${ok ? "PASS" : "FAIL"} ${name}: ${info}`); };
const info = (v1: number, v2: number, v3: number, extra: any = {}) => { const i: any = new AbilityEffectInfo(); i._EffectValue1 = v1; i._EffectValue2 = v2; i._EffectValue3 = v3; Object.assign(i, extra); return i; };
const active = <T>(s: T): T => { (s as any).IsActive$BattleUnit = () => true; return s; };
// a Drive state at level lv out of maxLv, given by unit `user`
const drive = (user: number, lv: number, maxLv: number, element = 0) => {
    const d: any = active(new UniqueElementDriveUnitState().ctor$AbilityEffectInfo(info(1, 2, 3, { _TargetElement: element })));
    d._UserUnitId = user; d._Lv = lv;
    d.lvMstListCache = Array.from({ length: maxLv }, (_, k) => ({ record: { level: k + 1, conditionCount: 1 } }));
    return d;
};
// a BattleUnit as far as these methods read it
const unit = (id: number, extra: any = {}) => {
    const u: any = Object.create(BattleUnit.prototype);
    Object.assign(u, { _Id: id, _OverBreakBonusValue: 0, _MaxOverBreakBonusValue: 0, _BreakedDamageReceiveRate: 0, _Team: 1,
        _BattleParameter: { _MaxBreakedDamageReceiveRate: 3000 }, IsMatch$TargetRoleType: () => true, IsMatch$TargetElementType: () => true,
        _Condition: { _StateList: [] as any[], get StateList() { return this._StateList; } }, ...extra });
    Object.defineProperty(u, "Condition", { get() { return u._Condition; } });
    return u;
};

// 1. factories (UnitStateFactory..cctor 0x1607340): 4 new types, UNIQUE_ELEMENT_BREAK gone
{
    UnitStateFactory.cctor?.();
    const has = (t: string) => UnitStateFactory.CanCreate(t);
    check("factories", has("UNIQUE_ELEMENT_DRIVE") && has("DRIVE_UP_BREAK_POINT_DMG_RATIO") && has("DRIVE_UP_BREAK_POINT_DMG_FIXED") && has("OVER_BREAK_DAMAGE_RECEIVE_RATE_DRIVE") && !has("UNIQUE_ELEMENT_BREAK"),
        `DRIVE ${has("UNIQUE_ELEMENT_DRIVE")} RATIO ${has("DRIVE_UP_BREAK_POINT_DMG_RATIO")} FIXED ${has("DRIVE_UP_BREAK_POINT_DMG_FIXED")} OVER ${has("OVER_BREAK_DAMAGE_RECEIVE_RATE_DRIVE")} BREAK(gone) ${has("UNIQUE_ELEMENT_BREAK")}`);
}
// 2. Drive break-gauge bonus (BreakPoint.CalculateProcessedBreakPointDamage 0x14D0EF0 -> IGiveBreakPointDamageVariation slot 2,
//    DriveUpBreakPointDamageUnitStateBase.GetDamageVariationValue 0x1716C30): only vs the holder's own Drive at targetLevel
{
    const up: any = active(new DriveUpBreakPointDmgRatioUnitState().ctor$AbilityEffectInfo(info(2, 500, 0))); up._UserUnitId = 1; // +50%, level 2, Selectable
    const calc = (defs: any[], skillType: number) => BreakPoint.CalculateProcessedBreakPointDamage([up], defs, 10, 0, [], skillType);
    const hit = calc([drive(1, 2, 3)], 1), wrongLv = calc([drive(1, 1, 3)], 1), other = calc([drive(9, 2, 3)], 1), normal = calc([drive(1, 2, 3)], 3);
    check("Drive break bonus (ratio)", hit === 15 && wrongLv === 10 && other === 10 && normal === 15, `hit ${hit} (want 15), wrong level ${wrongLv} (want 10), other giver ${other} (want 10), normal attack ${normal} (want 15: Selectable takes 1/2/3)`);
    const fx: any = active(new DriveUpBreakPointDmgFixedUnitState().ctor$AbilityEffectInfo(info(1, 7, 2))); fx._UserUnitId = 1; // +7, level 1, Special Attack only
    const saOnly = BreakPoint.CalculateProcessedBreakPointDamage([fx], [drive(1, 1, 3)], 10, 0, [], 2), skill = BreakPoint.CalculateProcessedBreakPointDamage([fx], [drive(1, 1, 3)], 10, 0, [], 1);
    check("Drive break bonus (fixed, SA only)", saOnly === 17 && skill === 10, `SA ${saOnly} (want 17), skill ${skill} (want 10)`);
    check("HasDriveBreakPointUp", BreakPoint.HasDriveBreakPointUp([up], [drive(1, 2, 3)], 1) && !BreakPoint.HasDriveBreakPointUp([up], [drive(1, 3, 3)], 1),
        `level 2 ${BreakPoint.HasDriveBreakPointUp([up], [drive(1, 2, 3)], 1)} (want true), level 3 ${BreakPoint.HasDriveBreakPointUp([up], [drive(1, 3, 3)], 1)} (want false)`);
}
// 3. Over Break damage (BattleDamageCalculator.GetAppliedDamageOfBreakSituation 0x13BAB60): + OverBreakBonusValue / 100 while broken
{
    const bp = new BreakPoint(); bp.Initialize(100); bp.DecreaseValue(100);
    const u = unit(5, { _BreakPoint: bp, _BreakedDamageReceiveRate: 300, _OverBreakBonusValue: 50 });
    const d = (x: any) => BattleDamageCalculator.GetAppliedDamageOfBreakSituation(x, Decimal.fromInt(1000), false).toInt();
    const over = d(u); u._OverBreakBonusValue = 0; const plain = d(u);
    check("Over Break damage", over === 3500 && plain === 3000, `bonus 50: ${over} (want 3500), bonus 0: ${plain} (want 3000)`);
}
// 4. ApplyOverBreakAddition 0x171B070 + BattleUnit.AddOverBreakBonus 0x13C1440 / AddMaxOverBreakBonus / ClearOverBreak 0x13C17F0
{
    const st: any = active(new OverBreakDamageReceiveRateDriveUnitState().ctor$AbilityEffectInfo(info(1000, 300, 100))); st._UserUnitId = 1; // max +100, +30 role / +10 other
    const sa = new SpecialAttack(), skill = new ActiveSkill();
    const target = unit(5, { _BreakedDamageReceiveRate: 300 }); target._Condition._StateList.push(drive(1, 3, 3));
    const user = unit(1, { _Team: 0 });
    const r1 = st.ApplyOverBreakAddition(target, user, sa);
    const afterEnter = [target._OverBreakBonusValue, target._MaxOverBreakBonusValue];
    const r2 = st.ApplyOverBreakAddition(target, user, sa);
    for (let k = 0; k < 5; k++) st.ApplyOverBreakAddition(target, user, sa);
    const capped = target._OverBreakBonusValue;
    const viaSkill = st.ApplyOverBreakAddition(target, user, skill);
    check("Over Break enter / grow / cap", r1 === true && afterEnter[0] === 0 && afterEnter[1] === 100 && r2 === false && capped === 100 && viaSkill === false,
        `1st SA ${r1} bonus ${afterEnter[0]} max ${afterEnter[1]} (want true 0 100), 2nd ${r2} (want false), after 7 SAs ${capped} (want 100), skill ${viaSkill} (want false)`);
    const low = unit(6, { _BreakedDamageReceiveRate: 299 }); low._Condition._StateList.push(drive(1, 3, 3));
    const notMax = unit(7, { _BreakedDamageReceiveRate: 300 }); notMax._Condition._StateList.push(drive(1, 2, 3));
    check("Over Break needs capped rate + max Drive", !st.ApplyOverBreakAddition(low, user, sa) && low._MaxOverBreakBonusValue === 0 && !st.ApplyOverBreakAddition(notMax, user, sa),
        `rate 299 -> max ${low._MaxOverBreakBonusValue} (want 0), Drive Lv2/3 -> ${notMax._MaxOverBreakBonusValue} (want 0)`);
    target.ClearOverBreak();
    check("ClearOverBreak", target._OverBreakBonusValue === 0 && target._MaxOverBreakBonusValue === 0, `${target._OverBreakBonusValue}/${target._MaxOverBreakBonusValue} (want 0/0)`);
}
// 5. notice + notice (AffectedUnitNotice.op_Addition 0x13B7C30): larger BreakPointDecreaseType, OR of the Over Break flags
{
    const a = new AffectedUnitNotice().ctor$int(1), b = new AffectedUnitNotice().ctor$int(1);
    a._BreakPointDecreaseType = 1; b._IsOverBreakEnterWhenHit = true; a._IsOverBreakMaxWhenHit = true;
    const s = AffectedUnitNotice.op_Addition(b, a);
    check("notice + notice", s._BreakPointDecreaseType === 1 && s._IsOverBreakEnterWhenHit && s._IsOverBreakMaxWhenHit, `type ${s._BreakPointDecreaseType} enter ${s._IsOverBreakEnterWhenHit} max ${s._IsOverBreakMaxWhenHit} (want 1 true true)`);
}
// 6. states that stay when their giver leaves / dies (PassiveSkill StateRemovingPredicate 0x14E4280, RemoveByUserUnitDeath b__0 0x13CD440)
{
    const keep = [new OverBreakDamageReceiveRateDriveUnitState(), new DriveUpBreakPointDmgRatioUnitState(), new UniqueElementDriveUnitState()];
    const removeOnLeave = keep.map(s => PassiveSkill.$RemoveByBattleUnit$g__StateRemovingPredicate_13_0(s));
    let pred: any = null;
    ActiveSkillBaseUtility.RemoveByUserUnitDeath({ Id: 1 } as any, new Map([[2, { Condition: { RemoveUnitState$BattleUnit_FuncUnitStateBasebool: (_u: any, p: any) => { pred = p; } } } as any]]));
    const d = drive(1, 1, 3);
    check("Drive states outlive their giver", removeOnLeave.every(x => x === false) && pred && pred(d) === false,
        `removed on leave ${removeOnLeave.join("/")} (want false x3), Drive removed on giver death ${pred?.(d)} (want false)`);
}
// 7. UniqueLvUnitStateBase.get_IsMaxLv 0x1727610 / Element Drive level-up type
{
    const top = drive(1, 3, 3), mid = drive(1, 2, 3);
    check("IsMaxLv + AfterActiveSkill", top.get_IsMaxLv() && !mid.get_IsMaxLv() && top.TryCountUp() === false && top.get_TargetLvUpType() === 2,
        `Lv3/3 ${top.get_IsMaxLv()} Lv2/3 ${mid.get_IsMaxLv()} TryCountUp at max ${top.TryCountUp()} type ${top.get_TargetLvUpType()} (want true false false 2)`);
}
console.log(failed ? `${failed} FAILED` : "all passed");
process.exit(failed ? 1 : 0);
