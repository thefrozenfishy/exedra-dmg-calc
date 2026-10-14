// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { AdditionalSkillAct } from "../Act/AdditionalSkillAct";
import { QuestEnemyAppearanceParameter } from "../QuestEnemyAppearanceParameter";
import { AffectedUnitNotice } from "../AffectedUnitNotice";
import { AffectedUnitNoticeBundle } from "../AffectedUnitNoticeBundle";
import { dictGet, f32, notPorted } from "../../runtime";
import type { Dictionary, float, int } from "../../runtime";
import { DamageAbilityEffectBase } from "./DamageAbilityEffectBase";
import type { DamageBaseType } from "./DamageBaseType";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";

import type { BattleUnit } from "../BattleUnit";
import type { DamageCategory } from "../DamageCategory";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { EffectOriginType } from "../UnitState/EffectOriginType";

// ---- ReDriveBattleCore.AbilityEffect.DmgRatioAbilityEffect  (TypeDefIndex 1181, public class) ----
export class DmgRatioAbilityEffect extends DamageAbilityEffectBase {
    /** 0x90 protected float damagePowerCurrentHpRatio */
    damagePowerCurrentHpRatio: float = 0;
    /** 0x94 protected float damagePowerMaxHpRatio */
    damagePowerMaxHpRatio: float = 0;
    /** @rva 0x7431D0 slot 9  protected override DamageBaseType get_DamageBaseType() { } */
    get_DamageBaseType(): DamageBaseType { return 0 as DamageBaseType; /* asm: xor eax, eax; ret */ }
    /** @rva 0xDB7A40 slot 13  public override DamageCategory get_DamageCategory() { } */
    get_DamageCategory(): DamageCategory { return 6 as DamageCategory; /* asm: mov eax, 6; ret */ }
    /** @rva 0x18F0810  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x18F17A0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this.damagePowerCurrentHpRatio = f32(f32(info._EffectValue1) / 1000);
        this.damagePowerMaxHpRatio = f32(f32(info._EffectValue2) / 1000);
        return this;
    }
    /** @rva 0x18F1320 slot 5  public override AffectedUnitNoticeBundle Triggering(EffectOriginType origin, BattleUnit userUnit, Dictionary<int, BattleUnit> targetUnitDic, GameDirectorBase gameDirector) { } */
    Triggering(origin: EffectOriginType, userUnit: BattleUnit, targetUnitDic: Dictionary<int, BattleUnit>, gameDirector: GameDirectorBase): AffectedUnitNoticeBundle {
        const bundle = new AffectedUnitNoticeBundle().ctor();
        for (const targetUnitId of this._TargetUnitIdList) {
            const targetUnit = dictGet(targetUnitDic, targetUnitId);
            const param = targetUnit.get_Param();
            if (param instanceof QuestEnemyAppearanceParameter && param._IsMainTargetEnemy) continue;
            userUnit.activeConditionCheckDataBundle._EachTargetUnit = targetUnit; // setter inlined in the game
            const maxDamage = targetUnit._HP - 1;
            let damage: int;
            if (this.damagePowerCurrentHpRatio > 0) {
                damage = Math.min(Math.trunc(Math.floor(f32(targetUnit._HP * this.damagePowerCurrentHpRatio))), maxDamage);
            } else if (this.damagePowerMaxHpRatio > 0) {
                damage = Math.min(Math.trunc(Math.floor(f32(targetUnit._MaxHP * this.damagePowerMaxHpRatio))), maxDamage);
            } else {
                throw new Error("DamageRatioAbilityEffect の value1, value2 の値が 0 のため、計算不能");
            }
            const notice = AffectedUnitNotice.CreateByDamage(targetUnit._Id, damage, 6 as any /* DamageCategory */, false, 0 as any, null!, 0 as any, false);
            userUnit.Attack(targetUnit, damage, gameDirector);
            const currentAct = gameDirector.turnActSystem.actReferee.currentAct;
            if (currentAct instanceof AdditionalSkillAct) notice._IsCounterAttack = currentAct.IsTargetingCurrentActUnit;
            bundle.Add(notice);
            userUnit.activeConditionCheckDataBundle._EachTargetUnit = null!; // setter inlined in the game
        }
        return bundle;
    }
}
