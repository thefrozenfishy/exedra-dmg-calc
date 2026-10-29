// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { AffectedUnitNotice } from "../AffectedUnitNotice";
import { AffectedUnitNoticeBundle } from "../AffectedUnitNoticeBundle";
import { Decimal, dictGet, f32, notPorted } from "../../runtime";
import type { Dictionary, int } from "../../runtime";
import { RevivalAbilityEffectBase } from "./RevivalAbilityEffectBase";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";

import type { BattleUnit } from "../BattleUnit";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { EffectOriginType } from "../UnitState/EffectOriginType";
import { AbilityEffectBase_TargetSideType } from "./AbilityEffectBase";

// ---- ReDriveBattleCore.AbilityEffect.RevivalRatioAbilityEffect  (TypeDefIndex 1212, public class) ----
export class RevivalRatioAbilityEffect extends RevivalAbilityEffectBase {
    /** 0x60 private int <RecoveryRatio>k__BackingField */
    _RecoveryRatio: int = 0;
    get RecoveryRatio(): int { return this.get_RecoveryRatio(); }
    set RecoveryRatio(v: int) { this.set_RecoveryRatio(v); }
    /** @rva 0x8A2200  public int get_RecoveryRatio() { } */
    get_RecoveryRatio(): int { return this._RecoveryRatio; /* auto-property */ }
    /** @rva 0x8A22D0  public void set_RecoveryRatio(int value) { } */
    set_RecoveryRatio(value: int): void { this._RecoveryRatio = value; /* auto-property */ }
    /** @rva 0x1910A80  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x191F010  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        this._TargetSide = 0 as AbilityEffectBase_TargetSideType;
        this._IsIncludeDeadUnitInTarget = true;
        this._RecoveryRatio = info._EffectValue1;
        return this;
    }
    /** @rva 0x191ECC0 slot 5  public override AffectedUnitNoticeBundle Triggering(EffectOriginType origin, BattleUnit userUnit, Dictionary<int, BattleUnit> targetUnitDic, GameDirectorBase gameDirector) { } */
    Triggering(origin: EffectOriginType, userUnit: BattleUnit, targetUnitDic: Dictionary<int, BattleUnit>, gameDirector: GameDirectorBase): AffectedUnitNoticeBundle {
        const bundle = new AffectedUnitNoticeBundle().ctor();
        for (const targetUnitId of this._TargetUnitIdList) {
            const targetUnit = dictGet(targetUnitDic, targetUnitId);
            if (!targetUnit.get_IsDead()) continue;
            userUnit.activeConditionCheckDataBundle._EachTargetUnit = targetUnit; // setter inlined in the game
            const hp = Decimal.fromFloat(f32(targetUnit._MaxHP * f32(this._RecoveryRatio / 100))).ceiling().toInt();
            targetUnit.AddHP(hp);
            bundle.Add(AffectedUnitNotice.CreateByRecovery(targetUnitId, hp, true));
            userUnit.activeConditionCheckDataBundle._EachTargetUnit = null!; // setter inlined in the game
        }
        return bundle;
    }
}
