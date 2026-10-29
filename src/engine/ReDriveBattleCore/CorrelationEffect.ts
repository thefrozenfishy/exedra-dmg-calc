// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import { UpWeakElementDmgRatioUnitState } from "./UnitState/UpWeakElementDmgRatioUnitState";
import { CharacterParameter } from "./CharacterParameter";
import { f32, notPorted } from "../runtime";
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
    /** @rva 0x14A4250  public void .ctor(BattleUnit attacker, BattleUnit defender, TargetElementType attackElement = 0) { } */
    ctor$BattleUnit_BattleUnit_TargetElementType(attacker: BattleUnit, defender: BattleUnit, attackElement: TargetElementType = 0 as TargetElementType): this {
        this._ElementDamageRatio = CorrelationEffect.DamageRatioDefault;
        if (attacker._BattleParameter instanceof CharacterParameter && attackElement !== 0 && CorrelationEffect.IsMatchWeakElement(attackElement, defender._WeakElements)) { // inlined in the game
            this._DamageType = 2 as CorrelationDamageType;
            this._ElementDamageRatio = CorrelationEffect.DamageRatioElementStrong;
            for (const state of attacker._Condition._StateList) {
                if (state instanceof UpWeakElementDmgRatioUnitState && state.IsActive$BattleUnit(attacker)) {
                    this._ElementDamageRatio = f32(f32(state.get_UpRatio() / 100) + this._ElementDamageRatio); // vslot 28
                }
            }
        } else {
            this._DamageType = 0 as CorrelationDamageType;
        }
        this._TotalDamageRatio = this._ElementDamageRatio;
        return this;
    }
    /** @rva 0x14A41B0  public static bool IsMatchWeakElement(TargetElementType attackElement, ElementType[] weakElements) { } */
    static IsMatchWeakElement(attackElement: TargetElementType, weakElements: ElementType[]): boolean {
        if (attackElement === 0 || weakElements == null) return false;
        for (let i = 0; i < weakElements.length; i++) if ((weakElements[i] as number) === (attackElement as number)) return true;
        return false;
    }
    /** @rva 0x14A40B0  private CorrelationDamageType GetDamageType(BattleUnit attacker, BattleUnit defender, TargetElementType attackElement) { } */
    GetDamageType(attacker: BattleUnit, defender: BattleUnit, attackElement: TargetElementType): CorrelationDamageType {
        if (attacker._BattleParameter instanceof CharacterParameter && attackElement !== 0) {
            const weakElements = defender._WeakElements;
            for (let i = 0; i < weakElements.length; i++) if ((weakElements[i] as number) === (attackElement as number)) return 2 as CorrelationDamageType;
        }
        return 0 as CorrelationDamageType;
    }
    /** @rva 0x14A4200  private static void .cctor() { } */
    static cctor(): void {
        CorrelationEffect.DamageRatioDefault = 1; // 0x3F800000
        CorrelationEffect.DamageRatioElementStrong = f32(1.2); // 0x3F99999A
    }
}

CorrelationEffect.cctor(); // C# static constructor