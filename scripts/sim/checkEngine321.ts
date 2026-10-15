// Checks of the game 3.21.0 rules ported into the 1:1 engine (src/engine), run on the bundle:
//   NODE_OPTIONS=--max-old-space-size=3300 node scripts/engine/bundle.mjs && npx tsx scripts/sim/checkEngine321.ts
// Each check fails on the 3.19 port (the members did not exist or did something else).
import { AbilityEffectInfo, ConsumeSelfHpAbilityEffect, AffectedUnitNotice, LinkHpReferee, StepUpSkillHandler, StepUpSkillUnitState,
    UnitStateFactory, AbilityEffectFactory } from "../../src/engine/dist/engine.js";

let failed = 0;
const check = (name: string, ok: boolean, info: string) => { if (!ok) failed++; console.log(`${ok ? "PASS" : "FAIL"} ${name}: ${info}`); };

// a unit as far as these methods read it
const unit = (id: number, hp: number, maxHp: number, extra: any = {}) => ({ _Id: id, _HP: hp, _MaxHP: maxHp, _Team: 0, isCharacter: true,
    activeConditionCheckDataBundle: {} as any, get_IsEnemy() { return false; }, AddHP(v: number) { this._HP = Math.max(0, Math.min(this._MaxHP, this._HP + v)); }, ...extra });

// 1. CONSUME_SELF_HP (ConsumeSelfHpAbilityEffect.Triggering 0x1923320): MaxHP x value1/1000 + value2, ceil, never below 1 HP
{
    const info = new AbilityEffectInfo(); info._EffectValue1 = 300; info._EffectValue2 = 50; info._EffectRange = -1 as any;
    const eff = new ConsumeSelfHpAbilityEffect().ctor$AbilityEffectInfo(info);
    const u: any = unit(1, 1000, 1001);
    eff.SelectTargets(u, new Map(), 0);
    const b = eff.Triggering(0 as any, u, new Map([[1, u]]), null as any);
    const n = b.GetNoticeList()[0];
    check("CONSUME_SELF_HP amount", u._HP === 1000 - 351 && n._IsConsumeHp && n._ConsumeHpValue === 351, `HP ${u._HP} (want 649), notice ${n?._ConsumeHpValue} (want 351 = ceil(1001*0.3)+50)`);
    const low: any = unit(2, 40, 1000);
    eff.SelectTargets(low, new Map(), 0);
    const b2 = eff.Triggering(0 as any, low, new Map([[2, low]]), null as any);
    check("CONSUME_SELF_HP keeps 1 HP", low._HP === 1 && b2.GetNoticeList()[0]._ConsumeHpValue === 39, `HP ${low._HP} (want 1), notice ${b2.GetNoticeList()[0]?._ConsumeHpValue} (want 39)`);
}
// 2. AffectedUnitNotice.op_Addition 0x13a0930 merges the HP cost
{
    const a = AffectedUnitNotice.CreateByConsumeHp(1, 10), c = AffectedUnitNotice.CreateByConsumeHp(1, 5);
    const s = AffectedUnitNotice.op_Addition(a, c);
    check("notice + notice adds ConsumeHpValue", s._IsConsumeHp && s._ConsumeHpValue === 15, `IsConsumeHp ${s._IsConsumeHp}, value ${s._ConsumeHpValue} (want 15)`);
}
// 3. LinkHpReferee.CalculateBossLinkHpDelta 0x14c4d10: an enemy's own HP cost lowers the linked HP
{
    const r = new LinkHpReferee().ctor();
    const enemy: any = unit(7, 100, 100, { isCharacter: false });
    const delta = r.CalculateBossLinkHpDelta([AffectedUnitNotice.CreateByConsumeHp(7, 30)], new Map([[7, enemy]]), null as any);
    check("linked HP counts HP cost", delta === -30, `delta ${delta} (want -30)`);
}
// 4. Step-Up SP (StepUpSkillHandler.CalcStepUpTotalConsumeSp 0x15e4900): the skill's SP + 1 per step
check("Step-Up SP", StepUpSkillHandler.CalcStepUpTotalConsumeSp(3, 2) === 5, `${StepUpSkillHandler.CalcStepUpTotalConsumeSp(3, 2)} (want 5)`);
// 5. TryEvaluateNextStepUp 0x15e5a20: next step's skill must be in SkillSet.StepUpSkills and affordable
{
    const st = new StepUpSkillUnitState(); st.stepLevel = 1; (st as any).GetSkillMstId$BattleUnit = () => 900;
    const u: any = unit(1, 10, 10, { _SkillSet: { _StepUpSkills: [{ _Id: 900, _ConsumeSP: 3 }] } });
    const sp = (n: number) => ({ GetSp: () => n });
    const id = { v: 0 }, cost = { v: 0 };
    const ok4 = StepUpSkillHandler.TryEvaluateNextStepUp(u, [st], 0, sp(4) as any, id, cost);
    const no3 = StepUpSkillHandler.TryEvaluateNextStepUp(u, [st], 0, sp(3) as any, { v: 0 }, { v: 0 });
    const noNext = StepUpSkillHandler.TryEvaluateNextStepUp(u, [st], 1, sp(9) as any, { v: 0 }, { v: 0 });
    check("Step-Up evaluate", ok4 && id.v === 900 && cost.v === 4 && !no3 && !noNext, `SP4 ${ok4} id ${id.v} cost ${cost.v} (want 900/4), SP3 ${no3} (want false), no step 2 ${noNext} (want false)`);
}
// 6. factories know the new types
{
    UnitStateFactory.cctor?.(); AbilityEffectFactory.cctor?.();
    check("factories", UnitStateFactory.CanCreate("STEP_UP_SKILL") && AbilityEffectFactory.CanCreate("CONSUME_SELF_HP"), `STEP_UP_SKILL ${UnitStateFactory.CanCreate("STEP_UP_SKILL")}, CONSUME_SELF_HP ${AbilityEffectFactory.CanCreate("CONSUME_SELF_HP")}`);
}
console.log(failed ? `${failed} FAILED` : "all passed");
process.exit(failed ? 1 : 0);
