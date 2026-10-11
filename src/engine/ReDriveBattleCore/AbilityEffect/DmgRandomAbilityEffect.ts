// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Dictionary, Nullable, int } from "../../runtime";
import type { RoleType } from "../../Network/Definition/Battle/RoleType";
import { DmgAtkAbilityEffect } from "./DmgAtkAbilityEffect";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { AffectedUnitNoticeBundle } from "../AffectedUnitNoticeBundle";
import type { BattleUnit } from "../BattleUnit";
import type { DamageCategory } from "../DamageCategory";
import type { GameDirectorBase } from "../GameDirectorBase";
import type { EffectOriginType } from "../UnitState/EffectOriginType";

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
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("DmgRandomAbilityEffect..ctor", 0x18F1210); }
    /** @rva 0x18F08B0 slot 5  public override AffectedUnitNoticeBundle Triggering(EffectOriginType origin, BattleUnit userUnit, Dictionary<int, BattleUnit> targetUnitDic, GameDirectorBase gameDirector) { } */
    Triggering(origin: EffectOriginType, userUnit: BattleUnit, targetUnitDic: Dictionary<int, BattleUnit>, gameDirector: GameDirectorBase): AffectedUnitNoticeBundle { return notPorted("DmgRandomAbilityEffect.Triggering", 0x18F08B0); }
    /** @rva 0x18F0820 slot 14  public override ValueTuple<int, int> GetVariationBreakPoint(Nullable<RoleType> attackerRoleType) { } */
    GetVariationBreakPoint(attackerRoleType: Nullable<RoleType>): any /* ValueTuple<int, int> */ { return notPorted("DmgRandomAbilityEffect.GetVariationBreakPoint", 0x18F0820); }
    /** @rva 0x18F11D0  private static void .cctor() { } */
    static cctor(): void { return notPorted("DmgRandomAbilityEffect..cctor", 0x18F11D0); }
}
