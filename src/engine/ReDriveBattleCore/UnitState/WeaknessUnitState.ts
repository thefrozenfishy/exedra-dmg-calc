// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../../runtime";
import type { Decimal, int } from "../../runtime";
import type { AbilityEffectInfo } from "../AbilityEffectInfo";
import type { BattleUnit } from "../BattleUnit";
import { AbnormalUnitStateBase } from "./AbnormalUnitStateBase";
import type { AdditionType } from "./AdditionType";
import type { IAtkVariation } from "./IAtkVariation";
import type { IDefVariation } from "./IDefVariation";

// ---- ReDriveBattleCore.UnitState.WeaknessUnitState  (TypeDefIndex 506, public class) ----
export class WeaknessUnitState extends AbnormalUnitStateBase {  // implements IAtkVariation, IDefVariation
    static readonly __interfaces: readonly string[] = ['IAtkVariation', 'IDefVariation'];
    get IAtkVariation$Addition(): AdditionType { return this.get_IAtkVariation$Addition(); }
    get IDefVariation$Addition(): AdditionType { return this.get_IDefVariation$Addition(); }
    get DownAtkRatio(): int { return this.get_DownAtkRatio(); }
    get DownDefRatio(): int { return this.get_DownDefRatio(); }
    /** @rva 0x15D2B20 slot 7  public override string get_IconName() { } */
    get_IconName(): string { return notPorted("WeaknessUnitState.get_IconName", 0x15D2B20); }
    /** @rva 0x15D2AF0 slot 13  public override string get_GiveVisualEffectName() { } */
    get_GiveVisualEffectName(): string { return notPorted("WeaknessUnitState.get_GiveVisualEffectName", 0x15D2AF0); }
    /** @rva 0x759B30 slot 25  private AdditionType ReDriveBattleCore.UnitState.IAtkVariation.get_Addition() { } */
    get_IAtkVariation$Addition(): AdditionType { return 1 as AdditionType; /* asm: mov eax, 1; ret */ }
    /** @rva 0x759B30 slot 27  private AdditionType ReDriveBattleCore.UnitState.IDefVariation.get_Addition() { } */
    get_IDefVariation$Addition(): AdditionType { return 1 as AdditionType; /* asm: mov eax, 1; ret */ }
    /** @rva 0x118F480  public int get_DownAtkRatio() { } */
    get_DownAtkRatio(): int { return 10; /* asm: mov eax, 0xa; ret */ }
    /** @rva 0x118F480  public int get_DownDefRatio() { } */
    get_DownDefRatio(): int { return 10; /* asm: mov eax, 0xa; ret */ }
    /** @rva 0x15D2A40  protected void .ctor() { } */
    ctor(): this { return notPorted("WeaknessUnitState..ctor", 0x15D2A40); }
    /** @rva 0x15D2A90  public void .ctor(AbilityEffectInfo info) { } */
    ctor$AbilityEffectInfo(info: AbilityEffectInfo): this { return notPorted("WeaknessUnitState..ctor", 0x15D2A90); }
    /** @rva 0x15D2840 slot 26  public Decimal GetAtkVariationValue(BattleUnit unit, Decimal processingValue) { } */
    GetAtkVariationValue(unit: BattleUnit, processingValue: Decimal): Decimal { return notPorted("WeaknessUnitState.GetAtkVariationValue", 0x15D2840); }
    /** @rva 0x15D2940 slot 28  public Decimal GetDefVariationValue(BattleUnit unit, Decimal processingValue) { } */
    GetDefVariationValue(unit: BattleUnit, processingValue: Decimal): Decimal { return notPorted("WeaknessUnitState.GetDefVariationValue", 0x15D2940); }
}
