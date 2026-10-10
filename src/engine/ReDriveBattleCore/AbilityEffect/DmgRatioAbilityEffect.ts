// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Dictionary, float, int } from "../../runtime";
import { DamageAbilityEffectBase } from "./DamageAbilityEffectBase";
import type { DamageBaseType } from "./DamageBaseType";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { AffectedUnitNoticeBundle } from "../AffectedUnitNoticeBundle";
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
    ctor(): this { return notPorted("DmgRatioAbilityEffect..ctor", 0x18F0810); }
    /** @rva 0x18F17A0  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("DmgRatioAbilityEffect..ctor", 0x18F17A0); }
    /** @rva 0x18F1320 slot 5  public override AffectedUnitNoticeBundle Triggering(EffectOriginType origin, BattleUnit userUnit, Dictionary<int, BattleUnit> targetUnitDic, GameDirectorBase gameDirector) { } */
    Triggering(origin: EffectOriginType, userUnit: BattleUnit, targetUnitDic: Dictionary<int, BattleUnit>, gameDirector: GameDirectorBase): AffectedUnitNoticeBundle { return notPorted("DmgRatioAbilityEffect.Triggering", 0x18F1320); }
}
