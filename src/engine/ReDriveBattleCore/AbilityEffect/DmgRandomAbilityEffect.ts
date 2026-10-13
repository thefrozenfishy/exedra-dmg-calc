// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { AdditionalSkillAct } from "../Act/AdditionalSkillAct";
import { CharacterParameter } from "../CharacterParameter";
import { BreakPoint } from "../BreakPoint";
import { BattleDamageCalculator } from "../BattleDamageCalculator";
import { AffectedUnitNotice } from "../AffectedUnitNotice";
import { AffectedUnitNoticeBundle } from "../AffectedUnitNoticeBundle";
import { DamageAbilityEffectBase } from "./DamageAbilityEffectBase";
import { dictGet, notPorted, randomNext } from "../../runtime";
import type { Dictionary, Nullable, int } from "../../runtime";
import type { RoleType } from "../../Network/Definition/Battle/RoleType";
import { DmgAtkAbilityEffect } from "./DmgAtkAbilityEffect";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";

import type { BattleUnit } from "../BattleUnit";
import type { DamageCategory } from "../DamageCategory";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { EffectOriginType } from "../UnitState/EffectOriginType";
import { f32 } from "../../runtime";

// ---- ReDriveBattleCore.AbilityEffect.DmgRandomAbilityEffect  (TypeDefIndex 1178, public class) ----
export class DmgRandomAbilityEffect extends DmgAtkAbilityEffect {
    /** 0x0 private static readonly int MinDamageCount */
    static MinDamageCount: int = 0;
    /** 0x90 protected int damageCount */
    damageCount: int = 0;
    /** @rva 0x7E1AD0 slot 13  public override DamageCategory get_DamageCategory() { } */
    get_DamageCategory(): DamageCategory { return 2 as DamageCategory; /* asm: mov eax, 2; ret */ }
    /** @rva 0x18F0810  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x18F1210  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        DamageAbilityEffectBase.prototype.ctor$AbilityEffectInfo.call(this, info); // the game calls DamageAbilityEffectBase..ctor directly
        this.damagePower = [f32(info._EffectValue1 / 1000), f32(info._EffectValue1 / 1000)];
        this.damageCount = info._EffectValue2;
        this._SpecifiedVariationBreakPoint = [info._EffectValue3, info._EffectValue3];
        this.breakedDamageReceiveRatio = f32(info._EffectValue4 / 10);
        return this;
    }
    /** @rva 0x18F08B0 slot 5  public override AffectedUnitNoticeBundle Triggering(EffectOriginType origin, BattleUnit userUnit, Dictionary<int, BattleUnit> targetUnitDic, GameDirectorBase gameDirector) { } */
    Triggering(origin: EffectOriginType, userUnit: BattleUnit, targetUnitDic: Dictionary<int, BattleUnit>, gameDirector: GameDirectorBase): AffectedUnitNoticeBundle {
        const affectedUnitNoticeBundle = new AffectedUnitNoticeBundle().ctor();
        const attackSkill = userUnit._SkillSet.GetSkill(this.skillMstId);
        if (attackSkill == null || !(this.damageCount > 0) || !(this._TargetUnitIdList.length > 0)) return affectedUnitNoticeBundle;
        let roleType = 0 as RoleType;
        if (userUnit.isCharacter) {
            const parameter = userUnit.get_Param();
            if (parameter instanceof CharacterParameter) roleType = parameter._Role;
        }
        const variationBreakPoint: [int, int] = this.GetVariationBreakPoint(roleType /* new Nullable<RoleType>(roleType) */); // vslot 14
        for (const targetUnitId of this._TargetUnitIdList) {
            const notice = new AffectedUnitNotice().ctor$int(targetUnitId);
            notice._IsVisibleOnAttack = true;
            affectedUnitNoticeBundle.Add(notice);
        }
        // new System.Random(): the game seeds from the clock; GameRandom here
        const turnOrderPriority = gameDirector.turnActSystem.turnReferee.get_NextTurnOrderPriority();
        for (let i = 0; i < this.damageCount; i++) {
            const targetUnitId = this._TargetUnitIdList[randomNext(this._TargetUnitIdList.length)];
            const targetUnit = dictGet(targetUnitDic, targetUnitId);
            userUnit.activeConditionCheckDataBundle._EachTargetUnit = targetUnit; // setter inlined in the game
            this.CollectAttackHitConsumableStates(userUnit);
            for (const reflectionNotice of this.ReflectionProcess(userUnit, targetUnit, attackSkill, gameDirector).GetNoticeList()) {
                reflectionNotice.SetDamageSequence(i);
                affectedUnitNoticeBundle.Add(reflectionNotice);
            }
            const damageBase = this.GetDamageBase(userUnit, this.damagePower[0]); // vslot 15
            let notice = BattleDamageCalculator.GetAttackDamageResult(userUnit, targetUnit, damageBase, this.attackElement, this.get_DamageBaseType(), attackSkill, gameDirector.get_BattleType(), 2 as any /* DamageCategory */);
            this.IncreaseBreakedDamageReceiveRate(userUnit, targetUnit, notice);
            notice = AffectedUnitNotice.op_Addition(notice, targetUnit._BreakPoint.Decrease(userUnit, targetUnit, this.attackElement, variationBreakPoint[0], turnOrderPriority));
            const totalDamageValue = notice.GetTotalDamageValue(false);
            notice = AffectedUnitNotice.op_Addition(notice, this.VortexProcess(targetUnit, gameDirector));
            const attackDamage = userUnit.Attack(targetUnit, notice.GetTotalDamageValue(true), gameDirector);
            notice._IsDead = targetUnit.get_IsDead();
            this.UniqueStateLvUpProcess(targetUnit, userUnit);
            Math.min(attackDamage, totalDamageValue); // result unused in the game
            notice.SetDamageSequence(i);
            const currentAct = gameDirector.turnActSystem.actReferee.currentAct;
            if (currentAct instanceof AdditionalSkillAct) notice._IsCounterAttack = currentAct.IsTargetingCurrentActUnit;
            affectedUnitNoticeBundle.Add(notice);
            userUnit.activeConditionCheckDataBundle._EachTargetUnit = null!; // setter inlined in the game
            if (this.ConsumeAttackHitConsumableStates(attackSkill, [notice])) {
                affectedUnitNoticeBundle.Add(new AffectedUnitNotice().ctor$int(userUnit._Id));
            }
        }
        return affectedUnitNoticeBundle;
    }
    /** @rva 0x18F0820 slot 14  public override ValueTuple<int, int> GetVariationBreakPoint(Nullable<RoleType> attackerRoleType) { } */
    GetVariationBreakPoint(attackerRoleType: Nullable<RoleType>): any /* ValueTuple<int, int> */ {
        // game quirk: only Item1 of SpecifiedVariationBreakPoint is tested, and GetDecreaseValue gets `true` (the base passes false)
        if (this._SpecifiedVariationBreakPoint[0] === 0) {
            return BreakPoint.GetDecreaseValue(this.skillType, this._EffectRange, (attackerRoleType ?? 0) as RoleType /* GetValueOrDefault */, true);
        }
        return this._SpecifiedVariationBreakPoint;
    }
    /** @rva 0x18F11D0  private static void .cctor() { } */
    static cctor(): void {
        DmgRandomAbilityEffect.MinDamageCount = 3;
    }
}

DmgRandomAbilityEffect.cctor(); // C# static constructor