// 1:1 port of ReDriveBattleCore (game 3.19.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { notPorted } from "../runtime";
import type { float } from "../runtime";
import type { ElementType } from "../Network/Definition/Battle/ElementType";
import type { TargetElementType } from "../Network/Definition/Battle/TargetElementType";
import type { BattleUnit } from "./BattleUnit";
import type { CorrelationDamageType } from "./CorrelationDamageType";

// ---- ReDriveBattleCore.CorrelationEffect  (TypeDefIndex 371, public class) ----
export class CorrelationEffect {
    /** 0x0 private static readonly float DamageRatioDefault */
    static DamageRatioDefault: float = 0;
    /** 0x4 private static readonly float DamageRatioElementStrong */
    static DamageRatioElementStrong: float = 0;
    /** 0x10 private readonly float <ElementDamageRatio>k__BackingField */
    _ElementDamageRatio: float = 0;
    /** 0x14 private readonly float <TotalDamageRatio>k__BackingField */
    _TotalDamageRatio: float = 0;
    /** 0x18 private readonly CorrelationDamageType <DamageType>k__BackingField */
    _DamageType: CorrelationDamageType = 0 as CorrelationDamageType;
    get ElementDamageRatio(): float { return this.get_ElementDamageRatio(); }
    get TotalDamageRatio(): float { return this.get_TotalDamageRatio(); }
    get DamageType(): CorrelationDamageType { return this.get_DamageType(); }
    /** @rva 0x8879E0  public float get_ElementDamageRatio() { } */
    get_ElementDamageRatio(): float { return this._ElementDamageRatio; /* auto-property */ }
    /** @rva 0x8879D0  public float get_TotalDamageRatio() { } */
    get_TotalDamageRatio(): float { return this._TotalDamageRatio; /* auto-property */ }
    /** @rva 0x763820  public CorrelationDamageType get_DamageType() { } */
    get_DamageType(): CorrelationDamageType { return this._DamageType; /* auto-property */ }
    /** @rva 0x1493F80  public void .ctor(BattleUnit attacker, BattleUnit defender, TargetElementType attackElement = 0) { } */
    ctor$BattleUnit_BattleUnit_TargetElementType(attacker: BattleUnit, defender: BattleUnit, attackElement?: TargetElementType /* = 0 */): this { return notPorted("CorrelationEffect..ctor", 0x1493F80); }
    /** @rva 0x1493EE0  public static bool IsMatchWeakElement(TargetElementType attackElement, ElementType[] weakElements) { } */
    static IsMatchWeakElement(attackElement: TargetElementType, weakElements: ElementType[]): boolean { return notPorted("CorrelationEffect.IsMatchWeakElement", 0x1493EE0); }
    /** @rva 0x1493DE0  private CorrelationDamageType GetDamageType(BattleUnit attacker, BattleUnit defender, TargetElementType attackElement) { } */
    GetDamageType(attacker: BattleUnit, defender: BattleUnit, attackElement: TargetElementType): CorrelationDamageType { return notPorted("CorrelationEffect.GetDamageType", 0x1493DE0); }
    /** @rva 0x1493F30  private static void .cctor() { } */
    static cctor(): void { return notPorted("CorrelationEffect..cctor", 0x1493F30); }
}
