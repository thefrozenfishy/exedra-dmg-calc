// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { AbilityEffectBase_TargetSideType } from "./AbilityEffectBase";
import { EnemyAppearanceGameDirectorBase } from "../EnemyAppearanceGameDirectorBase";
import { SoloGameDirectorBase } from "../SoloGameDirectorBase";
import { AffectedUnitNotice } from "../AffectedUnitNotice";
import { AffectedUnitNoticeBundle } from "../AffectedUnitNoticeBundle";
import { Decimal, notPorted } from "../../runtime";
import type { Dictionary, int } from "../../runtime";
import { AbilityEffectBase } from "./AbilityEffectBase";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";

import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { EffectOriginType } from "../UnitState/EffectOriginType";

// ---- ReDriveBattleCore.AbilityEffect.ConsumeSelfHpAbilityEffect  (TypeDefIndex 1177, public class) ----
export class ConsumeSelfHpAbilityEffect extends AbilityEffectBase {
    /** 0x60 protected int consumeHpRatio */
    consumeHpRatio: int = 0;
    /** 0x64 protected int consumeHpFixed */
    consumeHpFixed: int = 0;
    /** @rva 0x1920EF0  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x19226E0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this._TargetSide = 0 as AbilityEffectBase_TargetSideType;
        this.consumeHpRatio = info._EffectValue1;
        this.consumeHpFixed = info._EffectValue2;
        return this;
    }
    /** @rva 0x1923220 slot 4  public override void SelectTargets(BattleUnit userUnit, Dictionary<int, BattleUnit> targetUnitDic, int selectFriendUnitId, int attackTargetId = 0) { } */
    SelectTargets(userUnit: BattleUnit, targetUnitDic: Dictionary<int, BattleUnit>, selectFriendUnitId: int, attackTargetId?: int /* = 0 */): void {
        this._TargetUnitIdList = [];
        if (this._EffectRange !== -1) return;
        this._TargetUnitIdList.push(userUnit._Id);
    }
    /** @rva 0x1923320 slot 5  public override AffectedUnitNoticeBundle Triggering(EffectOriginType origin, BattleUnit userUnit, Dictionary<int, BattleUnit> targetUnitDic, GameDirectorBase gameDirector) { } */
    Triggering(origin: EffectOriginType, userUnit: BattleUnit, targetUnitDic: Dictionary<int, BattleUnit>, gameDirector: GameDirectorBase): AffectedUnitNoticeBundle {
        const bundle = new AffectedUnitNoticeBundle().ctor();
        if (this._TargetUnitIdList.length !== 1) return bundle;
        if (this._TargetUnitIdList[0] !== userUnit._Id) return bundle;
        userUnit.activeConditionCheckDataBundle._EachTargetUnit = userUnit; // setter inlined in the game
        let consume = Decimal.Zero;
        if (this.consumeHpRatio > 0) consume = consume.add(Decimal.fromInt(userUnit._MaxHP).mul(Decimal.fromInt(this.consumeHpRatio).div(Decimal.fromInt(1000))));
        if (this.consumeHpFixed > 0) consume = consume.add(Decimal.fromInt(this.consumeHpFixed));
        // never kills: at most HP - 1
        let value = Math.min(consume.ceiling().toInt(), Math.max(0, userUnit._HP - 1));
        let applyHp = true;
        if (userUnit.get_IsEnemy() && gameDirector != null && gameDirector instanceof EnemyAppearanceGameDirectorBase
            && gameDirector.linkHpReferee.linkHpType === 2) applyHp = false; // linked HP: the unit's own HP is not reduced
        if (applyHp) {
            if (gameDirector != null && gameDirector instanceof SoloGameDirectorBase) value = gameDirector.modeChangeReferee.GetNextModeChangeDamageCutDamage(userUnit, value);
            userUnit.AddHP(-value);
        }
        bundle.Add(AffectedUnitNotice.CreateByConsumeHp(userUnit._Id, value));
        userUnit.activeConditionCheckDataBundle._EachTargetUnit = null!; // setter inlined in the game
        return bundle;
    }
}
