// 1:1 port of ReDriveBattleCore (game 3.21.0). Shell generated from dump.cs by scripts/engine/gen_shells.py;
// method bodies are ported by hand from the decompile (see src/engine/README.md). Keep names/order as in the game.

import type { CalculationPointPolicyMstRecord } from "../Network/Definition/CalcPoint/CalculationPointPolicyMstRecord";
import { CalculationPointPolicyMstModel } from "./Model/CalculationPointPolicyMstModel";
import { BattleMstReaderBase } from "./Reader/BattleMstReaderBase";
import { BreakPoint } from "./BreakPoint";
import { f32, notPorted } from "../runtime";
import type { int } from "../runtime";
import type { ElementType } from "../Network/Definition/Battle/ElementType";
import type { RoleType } from "../Network/Definition/Battle/RoleType";
import { BattleParameter } from "./BattleParameter";
import type { ElementDamageRate } from "./ElementDamageRate";
import type { ElementResistRate } from "./ElementResistRate";
import type { StyleMstModel } from "./Model/StyleMstModel";

// ---- ReDriveBattleCore.CharacterParameter  (TypeDefIndex 341, public class) ----
export class CharacterParameter extends BattleParameter {
    /** 0x60 private int <StyleMstId>k__BackingField */
    _StyleMstId: int = 0;
    /** 0x64 private int <LevelReactionBreakDamageValue>k__BackingField */
    _LevelReactionBreakDamageValue: int = 0;
    /** 0x68 private int <LevelReactionSlipDamageValue>k__BackingField */
    _LevelReactionSlipDamageValue: int = 0;
    /** 0x6C private ElementType <Element>k__BackingField */
    _Element: ElementType = 0 as ElementType;
    /** 0x70 private RoleType <Role>k__BackingField */
    _Role: RoleType = 0 as RoleType;
    /** 0x74 private int <EP>k__BackingField */
    _EP: int = 0;
    /** 0x78 private int <BP>k__BackingField */
    _BP: int = 0;
    /** 0x7C private int <BreakDamageRate>k__BackingField */
    _BreakDamageRate: int = 0;
    /** 0x80 private int <RecoveryEpRate>k__BackingField */
    _RecoveryEpRate: int = 0;
    get StyleMstId(): int { return this.get_StyleMstId(); }
    set StyleMstId(v: int) { this.set_StyleMstId(v); }
    get LevelReactionBreakDamageValue(): int { return this.get_LevelReactionBreakDamageValue(); }
    set LevelReactionBreakDamageValue(v: int) { this.set_LevelReactionBreakDamageValue(v); }
    get LevelReactionSlipDamageValue(): int { return this.get_LevelReactionSlipDamageValue(); }
    set LevelReactionSlipDamageValue(v: int) { this.set_LevelReactionSlipDamageValue(v); }
    get Element(): ElementType { return this.get_Element(); }
    set Element(v: ElementType) { this.set_Element(v); }
    get Role(): RoleType { return this.get_Role(); }
    set Role(v: RoleType) { this.set_Role(v); }
    get EP(): int { return this.get_EP(); }
    set EP(v: int) { this.set_EP(v); }
    get BP(): int { return this.get_BP(); }
    set BP(v: int) { this.set_BP(v); }
    get BreakDamageRate(): int { return this.get_BreakDamageRate(); }
    set BreakDamageRate(v: int) { this.set_BreakDamageRate(v); }
    get RecoveryEpRate(): int { return this.get_RecoveryEpRate(); }
    set RecoveryEpRate(v: int) { this.set_RecoveryEpRate(v); }
    /** @rva 0x8A1200  public int get_StyleMstId() { } */
    get_StyleMstId(): int { return this._StyleMstId; /* auto-property */ }
    /** @rva 0x8A12D0  public void set_StyleMstId(int value) { } */
    set_StyleMstId(value: int): void { this._StyleMstId = value; /* auto-property */ }
    /** @rva 0x8A1220  public int get_LevelReactionBreakDamageValue() { } */
    get_LevelReactionBreakDamageValue(): int { return this._LevelReactionBreakDamageValue; /* auto-property */ }
    /** @rva 0x8A12F0  public void set_LevelReactionBreakDamageValue(int value) { } */
    set_LevelReactionBreakDamageValue(value: int): void { this._LevelReactionBreakDamageValue = value; /* auto-property */ }
    /** @rva 0x900770  public int get_LevelReactionSlipDamageValue() { } */
    get_LevelReactionSlipDamageValue(): int { return this._LevelReactionSlipDamageValue; /* auto-property */ }
    /** @rva 0x9007B0  public void set_LevelReactionSlipDamageValue(int value) { } */
    set_LevelReactionSlipDamageValue(value: int): void { this._LevelReactionSlipDamageValue = value; /* auto-property */ }
    /** @rva 0x8560F0  public ElementType get_Element() { } */
    get_Element(): ElementType { return this._Element; /* auto-property */ }
    /** @rva 0x900A00  public void set_Element(ElementType value) { } */
    set_Element(value: ElementType): void { this._Element = value; /* auto-property */ }
    /** @rva 0x8E9CC0  public RoleType get_Role() { } */
    get_Role(): RoleType { return this._Role; /* auto-property */ }
    /** @rva 0x900A20  public void set_Role(RoleType value) { } */
    set_Role(value: RoleType): void { this._Role = value; /* auto-property */ }
    /** @rva 0x8E06F0  public int get_EP() { } */
    get_EP(): int { return this._EP; /* auto-property */ }
    /** @rva 0x8772F0  public void set_EP(int value) { } */
    set_EP(value: int): void { this._EP = value; /* auto-property */ }
    /** @rva 0x901610  public int get_BP() { } */
    get_BP(): int { return this._BP; /* auto-property */ }
    /** @rva 0x901650  public void set_BP(int value) { } */
    set_BP(value: int): void { this._BP = value; /* auto-property */ }
    /** @rva 0x95CE30  public int get_BreakDamageRate() { } */
    get_BreakDamageRate(): int { return this._BreakDamageRate; /* auto-property */ }
    /** @rva 0x95CE40  public void set_BreakDamageRate(int value) { } */
    set_BreakDamageRate(value: int): void { this._BreakDamageRate = value; /* auto-property */ }
    /** @rva 0x900E80  public int get_RecoveryEpRate() { } */
    get_RecoveryEpRate(): int { return this._RecoveryEpRate; /* auto-property */ }
    /** @rva 0x900E90  public void set_RecoveryEpRate(int value) { } */
    set_RecoveryEpRate(value: int): void { this._RecoveryEpRate = value; /* auto-property */ }
    /** @rva 0x72F5E0  private void .ctor() { } */
    ctor(): this { return this; /* asm: xor edx, edx; jmp 0x730170 */ }
    /** @rva 0x13B2630  public void .ctor(in int atk, in int def, in int ctr, in int ctd, in int hp, in int speed, in int healRate, in int effectHitRate, in int effectParryRate, in ElementDamageRate[] elementDamageRates, in ElementResistRate[] elementResistRates, in int levelReactionBreakDamageValue, in int levelReactionSlipDamageValue, in int breakDamageRate, in int recoveryEpRate, in StyleMstModel styleMst, in bool isPvpOrGvg = False) { } */
    ctor$int_int_int_int_int_int_int_int_int_ElementDamageRate_ElementResistRate_int_int_int_int_StyleMstModel_bool(atk: int, def: int, ctr: int, ctd: int, hp: int, speed: int, healRate: int, effectHitRate: int, effectParryRate: int, elementDamageRates: ElementDamageRate[], elementResistRates: ElementResistRate[], levelReactionBreakDamageValue: int, levelReactionSlipDamageValue: int, breakDamageRate: int, recoveryEpRate: int, styleMst: StyleMstModel, isPvpOrGvg: boolean = false): this {
        super.ctor$int_int_int_int_int_int_int_int_int_ElementDamageRate_ElementResistRate(atk, def, ctr, ctd, hp, speed, healRate, effectHitRate, effectParryRate, elementDamageRates, elementResistRates);
        this._StyleMstId = styleMst.StyleMstId;
        this._Element = styleMst.Element;
        this._Role = styleMst.Role;
        this._EP = styleMst.Ep;
        this._BP = styleMst.Bp;
        this._LevelReactionBreakDamageValue = levelReactionBreakDamageValue;
        this._LevelReactionSlipDamageValue = levelReactionSlipDamageValue;
        this._BreakDamageRate = breakDamageRate;
        this._RecoveryEpRate = recoveryEpRate;
        if (!isPvpOrGvg) {
            this._BreakPoint = 0;
            this._InitialBreakedDamageReceiveRate = 1300;
            this._MaxBreakedDamageReceiveRate = 2000;
            this._BreakTurnGaugeSlowRatio = BreakPoint.BreakTurnGaugeSlowRatio * 10;
        } else {
            const reader = () => BattleMstReaderBase.get_Instance<CalculationPointPolicyMstModel, CalculationPointPolicyMstRecord, int>(CalculationPointPolicyMstModel);
            const initial = reader().GetModel(x => x.coefficientName === "initialBreakDamageReceiveRate"); // <.ctor>b__37_0
            const max = reader().GetModel(x => x.coefficientName === "maxBreakDamageReceiveRate");         // <.ctor>b__37_1
            const slow = reader().GetModel(x => x.coefficientName === "breakTurnGaugeSlowRatio");          // <.ctor>b__37_2
            this._BreakPoint = CharacterParameter.CalculateBreakPoint(styleMst.Rarity, styleMst.Role);
            this._BreakTurnGaugeSlowRatio = slow.Value;
            this._InitialBreakedDamageReceiveRate = initial.Value;
            this._MaxBreakedDamageReceiveRate = max.Value;
            this._BreakPointRecoveryPerTurn = 0;
        }
        this._BreakedDamageReceiveRateIncreaseRate = 1000;
        return this;
    }
    /** @rva 0x13B2250  private static int CalculateBreakPoint(int rarity, RoleType roleType) { } */
    static CalculateBreakPoint(rarity: int, roleType: RoleType): int {
        const reader = () => BattleMstReaderBase.get_Instance<CalculationPointPolicyMstModel, CalculationPointPolicyMstRecord, int>(CalculationPointPolicyMstModel);
        const baseMst = reader().GetModel(x => x.coefficientName === "baseBreakGaugeValue");                                  // <CalculateBreakPoint>b__38_0
        const rarityMst = reader().GetModel(x => x.coefficientName === "rarityBreakGaugeUpRatio" && x.conditionValue === rarity); // b__1
        let roleName: string;
        switch (roleType) {
            case 1: roleName = "attackerBreakGaugeUpRatio"; break;
            case 2: roleName = "breakerBreakGaugeUpRatio"; break;
            case 3: roleName = "healerBreakGaugeUpRatio"; break;
            case 4: roleName = "bufferBreakGaugeUpRatio"; break;
            case 5: roleName = "debufferBreakGaugeUpRatio"; break;
            case 6: roleName = "defenderBreakGaugeUpRatio"; break;
            default: roleName = ""; break;
        }
        const roleMst = reader().GetModel(x => x.coefficientName === roleName);                                                 // b__2
        const baseValue = baseMst.Value, rarityRatio = rarityMst.Value, roleRatio = roleMst.Value;
        // float math (asm 0x138aefb): (int)Math.Floor((double)((rarity / 1000f + 1f) * base * (role / 1000f + 1f)))
        const v = f32(f32(f32(f32(rarityRatio / 1000) + 1) * baseValue) * f32(f32(roleRatio / 1000) + 1));
        return Math.trunc(Math.floor(v));
    }
}
