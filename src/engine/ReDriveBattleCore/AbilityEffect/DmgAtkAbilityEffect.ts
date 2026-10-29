// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import { DamageAbilityEffectBase } from "./DamageAbilityEffectBase";
import type { DamageBaseType } from "./DamageBaseType";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { DamageCategory } from "../DamageCategory";

// ---- ReDriveBattleCore.AbilityEffect.DmgAtkAbilityEffect  (TypeDefIndex 1175, public class) ----
export class DmgAtkAbilityEffect extends DamageAbilityEffectBase {
    /** @rva 0x759B30 slot 9  protected override DamageBaseType get_DamageBaseType() { } */
    get_DamageBaseType(): DamageBaseType { return 1 as DamageBaseType; /* asm: mov eax, 1; ret */ }
    /** @rva 0x759B30 slot 13  public override DamageCategory get_DamageCategory() { } */
    get_DamageCategory(): DamageCategory { return 1 as DamageCategory; /* asm: mov eax, 1; ret */ }
    /** @rva 0x1915D20  protected void .ctor() { } */
    ctor(): this {
        super.ctor();
        return this;
    }
    /** @rva 0x1915D10  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this {
        super.ctor$AbilityEffectInfo(info);
        return this;
    }
}
